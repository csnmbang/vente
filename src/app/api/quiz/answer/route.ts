import { cookies } from "next/headers";
import { z } from "zod";
import { QUIZ } from "@/lib/config";
import { sign, verify } from "@/lib/crypto";
import { isCorrect, PASS_COOKIE, publicQuestion, QUIZ_COOKIE } from "@/lib/quiz";
import { fail, json } from "@/lib/request";
import { store } from "@/lib/store";

const Body = z.object({
  index: z.number().int().min(0),
  choice: z.number().int().min(0).max(3).nullable(), // null = ran out of time
});

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail("Respuesta no válida.");
  const { index, choice } = body.data;

  const jar = await cookies();
  const session = verify<{ id: string }>(jar.get(QUIZ_COOKIE)?.value, "quiz");
  if (!session) return fail("El test ha caducado. Empieza uno nuevo.", 401);

  const attempt = await store().getAttempt(session.id);
  if (!attempt || attempt.status !== "in_progress") return fail("Este test ya está terminado.", 409);
  if (attempt.current_index !== index) return fail("Esa pregunta ya pasó.", 409);

  // The clock runs on the server: late answers count as wrong.
  const elapsed = Date.now() - new Date(attempt.current_served_at).getTime();
  const onTime = elapsed <= QUIZ.seconds * 1000 + QUIZ.graceMs;
  const correct = onTime && isCorrect(attempt, index, choice);

  const results = [...attempt.results, correct];
  const correctCount = attempt.correct_count + (correct ? 1 : 0);
  const done = index + 1 >= attempt.question_ids.length;
  const now = new Date().toISOString();

  const updated = await store().advanceAttempt(attempt.id, index, {
    results,
    correct_count: correctCount,
    current_index: index + 1,
    current_served_at: now,
    ...(done && {
      status: correctCount >= QUIZ.passMark ? "passed" : "failed",
      finished_at: now,
    }),
  });
  if (!updated) return fail("Esa pregunta ya pasó.", 409);

  if (!done) {
    return json({ correct, late: !onTime, next: publicQuestion(updated, index + 1) });
  }

  // The quiz cookie stays until it expires: it marks you as the owner of
  // this result, so only you see which questions you missed.
  if (updated.status === "passed") {
    // Unlocks one sign-up for the next 30 minutes.
    jar.set(PASS_COOKIE, sign({ kind: "pass", id: updated.id }, 1800), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 1800,
    });
  }
  return json({ correct, late: !onTime, done: true, resultId: updated.id });
}
