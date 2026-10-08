import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { config, EMAIL_ENABLED } from "@/lib/config";
import { sign, verify } from "@/lib/crypto";
import { loginEmail, sendEmail } from "@/lib/email";
import { refrescarMapa } from "@/lib/mapa-cache";
import { unlockMap } from "@/lib/quiz";
import { fail, json } from "@/lib/request";
import { store, type Signup } from "@/lib/store";
import { recordarApuntado } from "@/lib/yo-server";

/**
 * "Ya estoy apuntado": people already on Vente get a link by email that
 * opens the map on a new device, without repeating the quiz. Only the
 * owner of the email can use it, and the answer is the same whether or
 * not the email exists, so nobody can check who is on Vente.
 */

const Body = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail("Revisa el correo.");
  const signup = await store().findSignupByEmail(body.data.email);

  if (!EMAIL_ENABLED) {
    // Local development only: no emails, so let existing people straight in.
    if (!signup) return fail("Ese correo no está apuntado.", 404);
    await entrar(signup);
    return json({ status: "unlocked" });
  }

  if (signup) {
    const token = sign({ kind: "entrar", id: signup.id }, 24 * 3600);
    const m = loginEmail(`${config.siteUrl}/api/entrar?token=${encodeURIComponent(token)}`);
    await sendEmail(signup.email, m.subject, m.html, m.text);
  }
  return json({ status: "check-email" });
}

/** The link in the email lands here. */
export async function GET(req: NextRequest) {
  const t = verify<{ id: string }>(req.nextUrl.searchParams.get("token") ?? undefined, "entrar");
  const signup = t ? await store().getSignup(t.id) : null;
  if (!signup) redirect("/entrar?caducado=1");
  // Clicking a link sent to the address proves it's theirs.
  if (!signup.confirmed_at) {
    await store().confirmSignup(signup.id);
    refrescarMapa();
  }
  await entrar(signup);
  redirect("/mapa");
}

/** Open the map and remember the person on this device. */
async function entrar(signup: Signup) {
  await unlockMap();
  await recordarApuntado(signup, true);
}
