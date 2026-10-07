import "server-only";
import { randomInt } from "node:crypto";
import { QUESTIONS, QUESTIONS_BY_ID } from "@/content/questions";
import { QUIZ } from "./config";
import type { Attempt } from "./store";

export const QUIZ_COOKIE = "vente_quiz";
export const PASS_COOKIE = "vente_pass";

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Draw the questions for a new attempt, with each one's options shuffled. */
export function drawQuiz() {
  const picked = shuffle(QUESTIONS).slice(0, QUIZ.questions);
  return {
    question_ids: picked.map((q) => q.id),
    option_orders: picked.map((q) => shuffle(q.options.map((_, i) => i))),
  };
}

/** What the browser sees: the question and options, never the answer. */
export function publicQuestion(attempt: Attempt, index: number) {
  const q = QUESTIONS_BY_ID.get(attempt.question_ids[index]);
  if (!q) throw new Error(`Pregunta desconocida: ${attempt.question_ids[index]}`);
  return {
    index,
    total: attempt.question_ids.length,
    seconds: QUIZ.seconds,
    text: q.question,
    options: attempt.option_orders[index].map((i) => q.options[i]),
  };
}

export type PublicQuestion = ReturnType<typeof publicQuestion>;

export function isCorrect(attempt: Attempt, index: number, choice: number | null): boolean {
  if (choice === null) return false;
  const q = QUESTIONS_BY_ID.get(attempt.question_ids[index]);
  const original = attempt.option_orders[index]?.[choice];
  return q !== undefined && original !== undefined && q.options[original] === q.answer;
}

export function questionText(id: string): string {
  return QUESTIONS_BY_ID.get(id)?.question ?? "(pregunta retirada)";
}
