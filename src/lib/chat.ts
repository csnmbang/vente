import "server-only";
import { quienSoy } from "./sesion";
import { store, type ChatMessage, type Signup } from "./store";

export const CHAT = {
  maxLength: 500,
  perDay: 50,
  /** Messages loaded when you open the chat. */
  history: 100,
} as const;

/** What the browser gets: nickname, pueblo and text. Never the email or id. */
export type MensajePublico = { id: number; alias: string; pueblo: string; texto: string; hora: string; mio: boolean };

export const publico = (m: ChatMessage, yo: Signup): MensajePublico => ({
  id: m.id,
  alias: m.alias ?? "Anónimo",
  pueblo: m.pueblo,
  texto: m.body,
  hora: m.created_at,
  mio: m.signup_id === yo.id,
});

/** Why someone can't chat yet (or "ok"). */
export type EstadoChat = "sin-sesion" | "sin-confirmar" | "expulsado" | "sin-alias" | "ok";

export async function estadoChat(): Promise<{ estado: EstadoChat; yo: Signup | null }> {
  const yo = await quienSoy();
  if (!yo) return { estado: "sin-sesion", yo };
  if (!yo.confirmed_at) return { estado: "sin-confirmar", yo };
  if (yo.banned_at) return { estado: "expulsado", yo };
  if (!yo.alias) return { estado: "sin-alias", yo };
  return { estado: "ok", yo };
}

// Text only: no links (spam, scams). Catches "http", "www." and bare domains.
const ENLACE = /(https?:\/\/|www\.|\b[\w-]+\.(com|es|net|org|io|me|co|app|ly|link|info|xyz|site|online|shop)\b)/i;
export const tieneEnlace = (texto: string) => ENLACE.test(texto);

export async function ciudadDe(yo: Signup) {
  return (await store().getPlace(yo.city_id))?.name ?? "tu ciudad";
}
