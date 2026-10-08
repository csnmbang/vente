import { cookies } from "next/headers";
import { QUIZ } from "@/lib/config";
import { sign } from "@/lib/crypto";
import { chancesUsed, CHANCES_COOKIE, CONTACT_EMAIL, drawQuiz, publicQuestion, QUIZ_COOKIE } from "@/lib/quiz";
import { clientIpHash, fail, json } from "@/lib/request";
import { store } from "@/lib/store";

export async function POST() {
  const ipHash = await clientIpHash();
  const used = await chancesUsed();
  if (used >= QUIZ.maxChances) {
    return fail(
      `Ya has usado tus ${QUIZ.maxChances} intentos. Si eres de aquí y crees que es un error, escríbenos a ${CONTACT_EMAIL}.`,
      429,
    );
  }

  const attempt = await store().createAttempt({
    ...drawQuiz(),
    ip_hash: ipHash,
    current_served_at: new Date().toISOString(),
  });

  const jar = await cookies();
  // Counts as used until it passes (the answer route resets it on a pass).
  jar.set(CHANCES_COOKIE, String(used + 1), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 365 * 24 * 3600,
  });
  jar.set(QUIZ_COOKIE, sign({ kind: "quiz", id: attempt.id }, 3600), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 3600,
  });

  return json({ question: publicQuestion(attempt, 0) });
}
