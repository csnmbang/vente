import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { normalizeText } from "../geo";
import type {
  Attempt, CityCount, Place, Postcode, Signup, Store, ZoneCount,
} from "./types";

/**
 * DEMO MODE ONLY (local dev without Supabase keys). Everything lives in
 * memory and is lost on restart. Seeded with fake sign-ups so the map has
 * something to show.
 */

type DemoState = {
  places: Map<number, Place & { search: string }>;
  postcodes: Map<string, Postcode>;
  attempts: Map<string, Attempt>;
  signups: Map<string, Signup & { ip_hash: string | null }>;
};

const g = globalThis as unknown as { __venteDemo?: DemoState };

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function loadPlaces() {
  const file = path.join(process.cwd(), "data", "places.csv");
  const places = new Map<number, Place & { search: string }>();
  const lines = fs.readFileSync(file, "utf8").split("\n").slice(1);
  for (const line of lines) {
    if (!line) continue;
    const [id, name, cc, , a1, a2, lat, lng, pop, search, abroad, muni] = parseCsvLine(line);
    places.set(Number(id), {
      id: Number(id), name, country_code: cc, admin1_name: a1 || null,
      admin2_name: a2 || null, lat: Number(lat), lng: Number(lng),
      population: Number(pop), search, is_abroad: abroad === "true",
      is_es_municipio: muni === "true",
    });
  }
  return places;
}

// Fake people for the demo map: [city, country, people, postcode areas].
const SEED: [string, string, number, string[]][] = [
  ["Londres", "GB", 38, ["E8", "SW9", "N1", "SE15", "W2"]],
  ["Berlín", "DE", 21, ["10115", "10245", "12043"]],
  ["París", "FR", 17, ["75011", "75018"]],
  ["Dublín", "IE", 14, ["D08", "D02"]],
  ["Miami", "US", 12, ["33125", "33130", "33131"]],
  ["Doral", "US", 3, []],
  ["Nueva York", "US", 11, ["11211", "10027"]],
  ["Ámsterdam", "NL", 9, ["1012", "1053"]],
  ["Múnich", "DE", 8, []],
  ["Bruselas", "BE", 7, []],
  ["Zúrich", "CH", 5, []],
  ["Lisboa", "PT", 6, ["1200"]],
  ["Ciudad de México", "MX", 9, []],
  ["Buenos Aires", "AR", 4, []],
  ["Edimburgo", "GB", 4, []],
  ["Mánchester", "GB", 5, []],
  ["Copenhague", "DK", 3, []],
  ["Estocolmo", "SE", 2, []],
  ["Sídney", "AU", 6, []],
  ["Toronto", "CA", 4, ["M6J"]],
  ["Los Ángeles", "US", 3, []],
  ["Bogotá", "CO", 2, []],
  ["Milán", "IT", 3, []],
  ["Reikiavik", "IS", 1, []],
];

function seed(state: DemoState) {
  const byName = new Map<string, Place>();
  for (const p of state.places.values()) {
    const key = `${p.country_code}:${normalizeText(p.name)}`;
    if (p.is_abroad && !byName.has(key)) byName.set(key, p);
  }
  const hometowns = [...state.places.values()].filter((p) => p.is_es_municipio && p.population > 50000);
  let n = 0;
  for (const [name, cc, people, zones] of SEED) {
    const city = byName.get(`${cc}:${normalizeText(name)}`);
    if (!city) continue;
    for (let i = 0; i < people; i++) {
      // Most seeded people get a postcode area, the rest stay at city level.
      const zone = zones.length && i % 4 !== 3 ? zones[i % zones.length] : null;
      const pc = zone ? demoPostcode(state, cc, zone, city) : null;
      const id = randomUUID();
      state.signups.set(id, {
        id, email: `demo${n++}@example.com`, city_id: city.id, postcode_id: pc?.id ?? null,
        hometown_id: hometowns[(n * 7919) % hometowns.length].id, attempt_id: randomUUID(),
        confirmed_at: new Date().toISOString(), created_at: new Date().toISOString(), ip_hash: null,
      });
    }
  }
}

/** Demo stand-in for the postcodes table: a stable point near the city. */
function demoPostcode(state: DemoState, cc: string, area: string, near: Place): Postcode {
  const key = `${cc}:${area}`;
  const existing = state.postcodes.get(key);
  if (existing) return existing;
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const pc: Postcode = {
    id: state.postcodes.size + 1, country_code: cc, postcode: area, place_name: near.name,
    lat: near.lat + (((h & 0xff) / 255) - 0.5) * 0.12,
    lng: near.lng + ((((h >> 8) & 0xff) / 255) - 0.5) * 0.18,
  };
  state.postcodes.set(key, pc);
  return pc;
}

function state(): DemoState {
  if (!g.__venteDemo) {
    g.__venteDemo = { places: loadPlaces(), postcodes: new Map(), attempts: new Map(), signups: new Map() };
    seed(g.__venteDemo);
  }
  return g.__venteDemo;
}

const stripSearch = (p: Place & { search: string }): Place => {
  const { search, ...rest } = p;
  void search;
  return rest;
};

export function memoryStore(): Store & {
  demoPostcode(cc: string, area: string, near: Place): Postcode;
} {
  return {
    demoPostcode: (cc, area, near) => demoPostcode(state(), cc, area, near),

    async searchPlaces(query, scope, limit) {
      const out: (Place & { search: string })[] = [];
      for (const p of state().places.values()) {
        if (scope === "abroad" ? !p.is_abroad : !p.is_es_municipio) continue;
        if (p.search.includes(query)) out.push(p);
      }
      return out.sort((a, b) => b.population - a.population).slice(0, limit).map(stripSearch);
    },

    async getPlace(id) {
      const p = state().places.get(id);
      return p ? stripSearch(p) : null;
    },

    async findPostcode(cc, area) {
      return state().postcodes.get(`${cc}:${area}`) ?? null;
    },

    async countAttemptsSince(ipHash, since) {
      return [...state().attempts.values()].filter((a) => a.ip_hash === ipHash && a.created_at >= since).length;
    },

    async createAttempt(a) {
      const attempt: Attempt = {
        ...a, id: randomUUID(), results: [], current_index: 0, correct_count: 0,
        status: "in_progress", signup_used: false, created_at: new Date().toISOString(), finished_at: null,
      };
      state().attempts.set(attempt.id, attempt);
      return attempt;
    },

    async getAttempt(id) {
      return state().attempts.get(id) ?? null;
    },

    async advanceAttempt(id, expectedIndex, patch) {
      const a = state().attempts.get(id);
      if (!a || a.current_index !== expectedIndex || a.status !== "in_progress") return null;
      Object.assign(a, patch);
      return a;
    },

    async claimAttemptForSignup(id) {
      const a = state().attempts.get(id);
      if (!a || a.status !== "passed" || a.signup_used) return false;
      a.signup_used = true;
      return true;
    },

    async releaseAttemptClaim(id) {
      const a = state().attempts.get(id);
      if (a) a.signup_used = false;
    },

    async countSignupsSince(ipHash, since) {
      return [...state().signups.values()].filter((s) => {
        const a = state().attempts.get(s.attempt_id);
        return a?.ip_hash === ipHash && s.created_at >= since;
      }).length;
    },

    async findSignupByEmail(email) {
      const e = email.toLowerCase();
      return [...state().signups.values()].find((s) => s.email.toLowerCase() === e) ?? null;
    },

    async getSignup(id) {
      return state().signups.get(id) ?? null;
    },

    async createSignup(s) {
      const row = { ...s, id: randomUUID(), created_at: new Date().toISOString(), ip_hash: null };
      state().signups.set(row.id, row);
      return row;
    },

    async confirmSignup(id) {
      const s = state().signups.get(id);
      if (s && !s.confirmed_at) s.confirmed_at = new Date().toISOString();
    },

    async deleteSignup(id) {
      state().signups.delete(id);
    },

    async cityCounts() {
      const counts = new Map<number, number>();
      for (const s of state().signups.values()) {
        if (s.confirmed_at) counts.set(s.city_id, (counts.get(s.city_id) ?? 0) + 1);
      }
      return [...counts].map(([id, people]): CityCount => {
        const c = state().places.get(id)!;
        return { city_id: id, name: c.name, country_code: c.country_code, lat: c.lat, lng: c.lng, people };
      });
    },

    async zoneCounts() {
      const zones = new Map<string, ZoneCount>();
      const pcById = new Map([...state().postcodes.values()].map((p) => [p.id, p]));
      for (const s of state().signups.values()) {
        if (!s.confirmed_at) continue;
        const city = state().places.get(s.city_id)!;
        const pc = s.postcode_id ? pcById.get(s.postcode_id) : null;
        const key = pc ? `p${pc.id}` : `c${city.id}`;
        const z = zones.get(key) ?? {
          zone_id: key, label: pc?.postcode ?? null, city_name: city.name,
          lat: pc?.lat ?? city.lat, lng: pc?.lng ?? city.lng, people: 0,
        };
        z.people++;
        zones.set(key, z);
      }
      return [...zones.values()];
    },
  };
}
