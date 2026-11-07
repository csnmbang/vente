import { cookies } from "next/headers";
import { sign, verify } from "@/lib/crypto";
import { PASS_COOKIE, QUIZ_COOKIE } from "@/lib/quiz";
import { store } from "@/lib/store";

/**
 * The entry link from /admin: acts as if you'd just passed the test, then
 * shows the sign-up form. Opening it again within its 7 days restarts the
 * 30-minute sign-up window; it only ever allows one sign-up.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const t = verify<{ id: string }>(token, "invite");
  const attempt = t ? await store().getAttempt(t.id) : null;
  if (!attempt) return Response.redirect(new URL("/invitacion-caducada", req.url), 303);

  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  jar.set(QUIZ_COOKIE, sign({ kind: "quiz", id: attempt.id }, 3600), {
    httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 3600,
  });
  if (!attempt.signup_used) {
    jar.set(PASS_COOKIE, sign({ kind: "pass", id: attempt.id }, 1800), {
      httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 1800,
    });
  }
  return Response.redirect(new URL(`/resultado/${attempt.id}`, req.url), 303);
}
