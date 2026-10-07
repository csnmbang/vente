import { cookies } from "next/headers";
import { z } from "zod";
import { config, DEMO, EMAIL_ENABLED, SIGNUPS_PER_IP_PER_DAY } from "@/lib/config";
import { sign, verify } from "@/lib/crypto";
import { alreadyInEmail, confirmEmail, sendEmail } from "@/lib/email";
import { haversineKm, postcodeArea } from "@/lib/geo";
import { PASS_COOKIE } from "@/lib/quiz";
import { clientIpHash, fail, json } from "@/lib/request";
import { store } from "@/lib/store";
import type { memoryStore } from "@/lib/store/memory";
import { asComunidad, YO_COOKIE, YO_MAX_AGE, type Yo } from "@/lib/yo";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  cityId: z.number().int().positive(),
  postcode: z.string().trim().max(12).nullable(),
  hometownId: z.number().int().positive(),
  website: z.string().nullish(), // honeypot
});

// A postcode area must be this close to the chosen city to count as "in" it.
const MAX_POSTCODE_KM = 80;

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Revisa el correo.");
  const { email, cityId, postcode, hometownId, website } = parsed.data;

  // Bots fill every field. Pretend it worked and move on.
  if (website) return json({ status: "check-email" });

  const jar = await cookies();
  const pass = verify<{ id: string }>(jar.get(PASS_COOKIE)?.value, "pass");
  if (!pass) return fail("Para apuntarte tienes que haber aprobado el test en los últimos 30 minutos.", 403);

  const ipHash = await clientIpHash();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  if ((await store().countSignupsSince(ipHash, since)) >= SIGNUPS_PER_IP_PER_DAY) {
    return fail("Hoy ya se han hecho demasiadas altas desde esta conexión. Inténtalo mañana.", 429);
  }

  const [city, hometown] = await Promise.all([store().getPlace(cityId), store().getPlace(hometownId)]);
  if (!city?.is_abroad) return fail("Elige tu ciudad de la lista.");
  if (!hometown?.is_es_municipio) return fail("Elige tu pueblo o ciudad de la lista.");

  // Postcode → postcode area centre, checked against the city.
  let postcodeId: number | null = null;
  if (postcode) {
    const area = postcodeArea(city.country_code, postcode);
    let pc = await store().findPostcode(city.country_code, area);
    if (!pc && DEMO) pc = (store() as ReturnType<typeof memoryStore>).demoPostcode(city.country_code, area, city);
    if (!pc) return fail("No encontramos ese código postal. Revísalo o déjalo en blanco.");
    if (haversineKm(pc, city) > MAX_POSTCODE_KM) {
      return fail(`Ese código postal no es de ${city.name}. Revísalo o déjalo en blanco.`);
    }
    postcodeId = pc.id;
  }

  const existing = await store().findSignupByEmail(email);
  if (existing) {
    // Don't reveal who's signed up: same answer, and the owner gets a heads-up.
    if (!EMAIL_ENABLED) return fail("Ese correo ya está apuntado.", 409);
    const m = alreadyInEmail();
    await sendEmail(email, m.subject, m.html, m.text);
    jar.delete(PASS_COOKIE);
    return json({ status: "check-email" });
  }

  // One sign-up per passed quiz.
  if (!(await store().claimAttemptForSignup(pass.id))) {
    return fail("Ya te apuntaste con este test.", 409);
  }

  let signupId: string;
  try {
    const signup = await store().createSignup({
      email,
      city_id: city.id,
      postcode_id: postcodeId,
      hometown_id: hometown.id,
      attempt_id: pass.id,
      confirmed_at: EMAIL_ENABLED ? null : new Date().toISOString(),
    });
    signupId = signup.id;
  } catch (e) {
    await store().releaseAttemptClaim(pass.id);
    throw e;
  }
  jar.delete(PASS_COOKIE);
  // Lets the map say how far other cities are from yours ("a un Alicante–Murcia de ti").
  // (Next URL-encodes cookie values itself, so pass plain JSON.)
  jar.set(YO_COOKIE, JSON.stringify({
    ciudad: city.name, lat: city.lat, lng: city.lng, region: asComunidad(hometown.admin1_name),
  } satisfies Yo), { path: "/", maxAge: YO_MAX_AGE, sameSite: "lax", secure: process.env.NODE_ENV === "production" });

  if (!EMAIL_ENABLED) return json({ status: "confirmed" });

  const token = sign({ kind: "confirm", id: signupId }, 7 * 24 * 3600);
  const m = confirmEmail(`${config.siteUrl}/api/confirmar?token=${token}`);
  await sendEmail(email, m.subject, m.html, m.text);
  return json({ status: "check-email" });
}
