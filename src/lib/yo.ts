import { PROVINCIAS } from "@/content/provincias";
import { COMUNIDADES, type Comunidad } from "@/content/rutas";

/**
 * The reader's own city and home region, for "a un Alicante–Murcia de ti".
 * Kept in a plain cookie in the reader's browser: set at sign-up, or picked
 * on the map by visitors. Holds no email or id, only public place data.
 */
export type Yo = {
  ciudad: string;
  lat: number;
  lng: number;
  /** Home province, as a key of PROVINCIAS. */
  provincia: string | null;
  region: Comunidad | null;
  /** Set when this came from signing up: the reader is one of the people on the map. */
  apuntado?: boolean;
};

/** Home province and its comunidad, from a province key. */
export function origen(provincia: string | null | undefined): Pick<Yo, "provincia" | "region"> {
  const p = provincia ? PROVINCIAS[provincia] : undefined;
  return p ? { provincia: provincia!, region: p.comunidad } : { provincia: null, region: null };
}

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
    const o = origen(v.provincia);
    return {
      ciudad: v.ciudad, lat: v.lat, lng: v.lng, provincia: o.provincia,
      region: o.region ?? asComunidad(v.region), apuntado: v.apuntado === true,
    };
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
