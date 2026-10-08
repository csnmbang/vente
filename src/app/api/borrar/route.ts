import { z } from "zod";
import { config, EMAIL_ENABLED } from "@/lib/config";
import { sign, verify } from "@/lib/crypto";
import { deleteEmail, sendEmail } from "@/lib/email";
import { fail, json } from "@/lib/request";
import { refrescarMapa } from "@/lib/mapa-cache";
import { store } from "@/lib/store";

const Body = z.union([
  // Step 1: "send me a deletion link"
  z.object({ email: z.string().trim().toLowerCase().email().max(254) }),
  // Step 2: the link's token, confirmed with a button press
  z.object({ token: z.string().max(500) }),
]);

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail("Revisa el correo.");

  if ("token" in body.data) {
    const t = verify<{ id: string }>(body.data.token, "delete");
    if (!t) return fail("El enlace ha caducado. Pide otro.", 410);
    await store().deleteSignup(t.id);
    refrescarMapa();
    return json({ deleted: true });
  }

  if (!EMAIL_ENABLED) {
    return fail(`Ahora mismo no podemos mandar correos. Escríbenos a ${process.env.NEXT_PUBLIC_CONTACT_EMAIL}.`, 503);
  }
  // Same answer whether or not the email exists, so nobody can check who's in.
  const signup = await store().findSignupByEmail(body.data.email);
  if (signup) {
    const token = sign({ kind: "delete", id: signup.id }, 24 * 3600);
    const m = deleteEmail(`${config.siteUrl}/borrar?token=${encodeURIComponent(token)}`);
    await sendEmail(signup.email, m.subject, m.html, m.text);
  }
  return json({ sent: true });
}
