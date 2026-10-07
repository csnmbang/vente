import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { DEMO } from "@/lib/config";
import { store } from "@/lib/store";

export type MapData = {
  cities: { id: number; name: string; lat: number; lng: number; people: number }[];
  zones: { id: string; label: string | null; city: string; lat: number; lng: number; people: number }[];
};

/** Public aggregate counts for the map. Never individual people. */
export async function GET() {
  if (DEMO) {
    await connection(); // local demo: always fresh
    return Response.json(await loadMapData());
  }
  return Response.json(await cachedMapData());
}

async function cachedMapData() {
  "use cache";
  cacheLife("minutes");
  return loadMapData();
}

async function loadMapData(): Promise<MapData> {
  const [cities, zones] = await Promise.all([store().cityCounts(), store().zoneCounts()]);
  return {
    cities: cities.map((c) => ({ id: c.city_id, name: c.name, lat: c.lat, lng: c.lng, people: c.people })),
    zones: zones.map((z) => ({
      id: z.zone_id, label: z.label, city: z.city_name, lat: z.lat, lng: z.lng, people: z.people,
    })),
  };
}
