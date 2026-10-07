/** The one word under the score on the result card. */
export function verdict(score: number, passMark = 8): string {
  return score >= passMark ? "Aprobado" : "Suspenso";
}
