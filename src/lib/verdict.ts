/** The playful one-liner under the score. */
export function verdict(score: number): { emoji: string; line: string } {
  if (score >= 10) return { emoji: "🐷", line: "Más español que el jamón" };
  if (score === 9) return { emoji: "🥘", line: "De pura cepa, sin discusión" };
  if (score === 8) return { emoji: "🇪🇸", line: "Español de los de verdad" };
  if (score >= 6) return { emoji: "🤏", line: "Casi… ¿seguro que no eres de Andorra?" };
  if (score >= 3) return { emoji: "🧳", line: "Guiri, pero con mucho cariño" };
  return { emoji: "🙈", line: "Tú no has visto un cuadernillo Rubio en tu vida" };
}
