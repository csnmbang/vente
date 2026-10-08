/** The grade under the score on the result card, as in Spanish schools. */
export function verdict(score: number, total: number): string {
  score = (score / total) * 10; // school grades are out of 10
  if (score < 5) return "Suspenso";
  if (score <= 6) return "Bien";
  if (score <= 8) return "Notable";
  return "Sobresaliente";
}
