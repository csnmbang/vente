import "server-only";
import { randomInt } from "node:crypto";
import { QUESTIONS, QUESTIONS_BY_ID } from "@/content/questions";
import { cookies } from "next/headers";
import { QUIZ } from "./config";
import { sign, verify } from "./crypto";
import { clientIpHash } from "./request";
import { store } from "./store";
import type { Attempt } from "./store";

export const QUIZ_COOKIE = "vente_quiz";
export const PASS_COOKIE = "vente_pass";
/** Tries used in this browser that didn't pass. Backs up the per-connection count. */
export const CHANCES_COOKIE = "vente_intentos";
/** Set when someone leaves their email after passing: the map stays open for a year. */
export const MAP_COOKIE = "vente_mapa";
const MAP_MAX_AGE = 365 * 24 * 3600;

export async function unlockMap() {
  (await cookies()).set(MAP_COOKIE, sign({ kind: "mapa" }, MAP_MAX_AGE), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAP_MAX_AGE,
  });
}

export async function mapUnlocked(): Promise<boolean> {
  return verify((await cookies()).get(MAP_COOKIE)?.value, "mapa") !== null;
}

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@vengavente.com";

/** How many tries this person has used without passing (connection or browser, whichever is higher). */
export async function chancesUsed(): Promise<number> {
  const fromBrowser = Number((await cookies()).get(CHANCES_COOKIE)?.value) || 0;
  const fromConnection = await store().countUnpassedAttempts(await clientIpHash());
  return Math.max(fromBrowser, fromConnection);
}

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
