import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { DEMO } from "@/lib/config";
import { mapUnlocked } from "@/lib/quiz";
import { store } from "@/lib/store";

/** Before unlocking: only the totals, so the locked screen can tease them. */
export type LockedMap = { locked: true; people: number; cities: number };

export type MapData = {
  locked?: false;
  cities: {
    id: number;
    name: string;
    lat: number;
    lng: number;
    people: number;
    /** Where they're from: province key (see src/content/provincias.ts) → count. */
    provincias: Record<string, number>;
  }[];
  zones: { id: string; label: string | null; city: string; lat: number; lng: number; people: number }[];
};

/** Public aggregate counts for the map. Never individual people. */
export async function GET() {
  await connection(); // per-request: depends on the visitor's cookie
  const data = DEMO ? await loadMapData() : await cachedMapData();
  if (await mapUnlocked()) return Response.json(data);
  const locked: LockedMap = {
    locked: true,
    people: data.cities.reduce((n, c) => n + c.people, 0),
    cities: data.cities.length,
  };
  return Response.json(locked);
}

async function cachedMapData() {
  "use cache";
  cacheLife("minutes");
  return loadMapData();
}

async function loadMapData(): Promise<MapData> {
  const [cities, zones, origins] = await Promise.all([
    store().cityCounts(),
    store().zoneCounts(),
    store().cityProvinceCounts(),
  ]);
  const byCity = new Map<number, Record<string, number>>();
  for (const o of origins) {
    const m = byCity.get(o.city_id) ?? {};
    m[o.provincia] = o.people;
    byCity.set(o.city_id, m);
  }
  return {
    cities: cities.map((c) => ({
      id: c.city_id, name: c.name, lat: c.lat, lng: c.lng, people: c.people,
      provincias: byCity.get(c.city_id) ?? {},
    })),
    zones: zones.map((z) => ({
      id: z.zone_id, label: z.label, city: z.city_name, lat: z.lat, lng: z.lng, people: z.people,
    })),
  };
}
