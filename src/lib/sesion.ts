import "server-only";
import { cookies } from "next/headers";
import { sign, verify } from "./crypto";
import { store, type Signup } from "./store";

/**
 * Who is using Vente on this device: set when you sign up, click the
 * confirmation link or use "Ya estoy apuntado". Signed, so it can't be
 * forged; it holds only the sign-up id.
 */
const SESION_COOKIE = "vente_sesion";
const MAX_AGE = 365 * 24 * 3600;

export async function iniciarSesion(signupId: string) {
  (await cookies()).set(SESION_COOKIE, sign({ kind: "sesion", id: signupId }, MAX_AGE), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** The signed-in person, or null (no cookie, expired, or their data was deleted). */
export async function quienSoy(): Promise<Signup | null> {
  const t = verify<{ id: string }>((await cookies()).get(SESION_COOKIE)?.value, "sesion");
  return t ? store().getSignup(t.id) : null;
}
