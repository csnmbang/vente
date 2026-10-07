import { COMUNIDADES, type Comunidad } from "@/content/rutas";

/**
 * The reader's own city and home region, for "a un Alicante–Murcia de ti".
 * Kept in a plain cookie in the reader's browser: set at sign-up, or picked
 * on the map by visitors. Holds no email or id, only public place data.
 */
export type Yo = { ciudad: string; lat: number; lng: number; region: Comunidad | null };

export const YO_COOKIE = "vente_yo";
export const YO_MAX_AGE = 365 * 24 * 3600;

export function encodeYo(yo: Yo): string {
  return encodeURIComponent(JSON.stringify(yo));
}

export function decodeYo(raw: string | undefined | null): Yo | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    if (typeof v.ciudad !== "string" || typeof v.lat !== "number" || typeof v.lng !== "number") return null;
    return { ciudad: v.ciudad, lat: v.lat, lng: v.lng, region: asComunidad(v.region) };
  } catch {
    return null;
  }
}

export function asComunidad(v: unknown): Comunidad | null {
  return (COMUNIDADES as readonly unknown[]).includes(v) ? (v as Comunidad) : null;
}

/** Browser only. */
export function readYo(): Yo | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${YO_COOKIE}=([^;]*)`));
  return decodeYo(match?.[1]);
}

/** Browser only. */
export function writeYo(yo: Yo) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${YO_COOKIE}=${encodeYo(yo)}; Path=/; Max-Age=${YO_MAX_AGE}; SameSite=Lax${secure}`;
}
