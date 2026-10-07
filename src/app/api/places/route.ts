import type { NextRequest } from "next/server";
import postcodeCountries from "@/content/postcode-countries.json";
import { countryName, normalizeText } from "@/lib/geo";
import { json } from "@/lib/request";
import { store } from "@/lib/store";

const WITH_POSTCODES = new Set<string>(postcodeCountries);

export type PlaceOption = {
  id: number;
  name: string;
  detail: string;
  countryCode: string;
  hasPostcodes: boolean;
};

/** Search box backend: ?q=lond&scope=abroad (where you live) | es (hometown). */
export async function GET(req: NextRequest) {
  const q = normalizeText(req.nextUrl.searchParams.get("q") ?? "").slice(0, 60);
  const scope = req.nextUrl.searchParams.get("scope") === "es" ? "es" : "abroad";
  if (q.length < 2) return json({ places: [] });

  // Fetch a wider net by population, then put names that start with what
  // you typed first ("miami" → Miami before Fort Wayne's old alias).
  const rank = (name: string) => {
    const n = normalizeText(name);
    return n.startsWith(q) ? 0 : n.split(" ").some((w) => w.startsWith(q)) ? 1 : 2;
  };
  const places = (await store().searchPlaces(q, scope, 40))
    .map((p, i) => ({ p, i, r: rank(p.name) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, 8)
    .map(({ p }) => p);
  const options: PlaceOption[] = places.map((p) => ({
    id: p.id,
    name: p.name,
    detail:
      scope === "es"
        ? [p.admin2_name?.replace(/^Provincia de /, ""), p.admin1_name].filter(Boolean).join(", ")
        : [p.admin1_name, countryName(p.country_code)].filter(Boolean).join(", "),
    countryCode: p.country_code,
    hasPostcodes: WITH_POSTCODES.has(p.country_code),
  }));
  return json({ places: options });
}
