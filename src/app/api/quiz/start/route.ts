import { cookies } from "next/headers";
import { QUIZ } from "@/lib/config";
import { sign } from "@/lib/crypto";
import { drawQuiz, publicQuestion, QUIZ_COOKIE } from "@/lib/quiz";
import { clientIpHash, fail, json } from "@/lib/request";
import { store } from "@/lib/store";

export async function POST() {
  const ipHash = await clientIpHash();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  if ((await store().countAttemptsSince(ipHash, since)) >= QUIZ.attemptsPerDay) {
    return fail("Has usado todos los intentos de hoy. Puedes volver a intentarlo mañana.", 429);
  }

  const attempt = await store().createAttempt({
    ...drawQuiz(),
    ip_hash: ipHash,
    current_served_at: new Date().toISOString(),
  });

  (await cookies()).set(QUIZ_COOKIE, sign({ kind: "quiz", id: attempt.id }, 3600), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 3600,
  });

  return json({ question: publicQuestion(attempt, 0) });
}
