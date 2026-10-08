import "server-only";
import { quienSoy } from "./sesion";
import { store, type ChatMessage, type Signup } from "./store";

export const CHAT = {
  /** One chat covers everyone living this close to your city (e.g. Miami + Miami Gardens). */
  areaKm: 40,
  maxLength: 500,
  perDay: 50,
  /** Messages loaded when you open the chat. */
  history: 100,
} as const;

/** What the browser gets: nickname, pueblo and text. Never the email or id. */
export type MensajePublico = {
  id: number;
  alias: string;
  pueblo: string;
  /** Where the author lives, when it isn't your own city ("en Miami Gardens"). */
  ciudad: string | null;
  texto: string;
  hora: string;
  mio: boolean;
};

export type Zona = { ciudad: string; ids: number[]; nombres: Map<number, string> };

export const publico = (m: ChatMessage, yo: Signup, zona: Zona): MensajePublico => ({
  id: m.id,
  alias: m.alias ?? "Anónimo",
  pueblo: m.pueblo,
  ciudad: m.city_id === yo.city_id ? null : (zona.nombres.get(m.city_id) ?? null),
  texto: m.body,
  hora: m.created_at,
  mio: m.signup_id === yo.id,
});

// Cities near each city barely change: remember them per server instance.
const zonas = new Map<number, Zona>();

/** Your chat area: your city plus every city abroad within CHAT.areaKm. */
export async function zonaDe(yo: Signup): Promise<Zona> {
  const cached = zonas.get(yo.city_id);
  if (cached) return cached;
  const city = await store().getPlace(yo.city_id);
  const near = city ? await store().citiesNear(city.lat, city.lng, CHAT.areaKm) : [];
  const nombres = new Map(near.map((c) => [c.id, c.name]));
  nombres.set(yo.city_id, city?.name ?? "tu ciudad");
  // Name the chat after the biggest city around ("Londres", not "Wembley").
  const mayor = near.reduce((a, b) => (b.population > a.population ? b : a), {
    name: city?.name ?? "tu ciudad",
    population: city?.population ?? 0,
  });
  const zona = { ciudad: mayor.name, ids: [...nombres.keys()], nombres };
  zonas.set(yo.city_id, zona);
  return zona;
}

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

