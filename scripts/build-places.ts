/**
 * Builds data/places.csv (committed) from GeoNames dumps in data/raw/.
 * Only needed when refreshing place data; the import script reads the CSV.
 *
 *   cd data/raw && curl -O https://download.geonames.org/export/dump/{cities15000.zip,ES.zip,admin1CodesASCII.txt,admin2Codes.txt,alternateNamesV2.zip}
 *   unzip cities15000.zip; unzip ES.zip; unzip alternateNamesV2.zip alternateNamesV2.txt
 *   curl -o postal-allCountries.zip https://download.geonames.org/export/zip/allCountries.zip && unzip postal-allCountries.zip -d postal
 *   npx tsx scripts/build-places.ts
 *
 * Data © GeoNames (geonames.org), CC BY 4.0.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { normalizeText, postcodeArea, POSTCODE_EXCLUDED } from "../src/lib/geo";

const RAW = path.join(__dirname, "..", "data", "raw");
const OUT = path.join(__dirname, "..", "data", "places.csv");
const OUT_PC_COUNTRIES = path.join(__dirname, "..", "src", "content", "postcode-countries.json");

// GeoNames ES admin1 code → comunidad autónoma, in Spanish.
const ES_REGIONS: Record<string, string> = {
  "51": "Andalucía", "52": "Aragón", "34": "Asturias", "07": "Islas Baleares",
  "53": "Canarias", "39": "Cantabria", "55": "Castilla y León",
  "54": "Castilla-La Mancha", "56": "Cataluña", "60": "Comunidad Valenciana",
  "57": "Extremadura", "58": "Galicia", "29": "Comunidad de Madrid",
  "31": "Región de Murcia", "32": "Navarra", "59": "País Vasco",
  "27": "La Rioja", CE: "Ceuta", ML: "Melilla",
};

type Place = {
  id: number; name: string; country: string; admin1Code: string;
  admin1Name: string; admin2Name: string; lat: number; lng: number;
  population: number; names: Set<string>; esNames: string[]; abroad: boolean; municipio: boolean;
};

const lines = (file: string) =>
  readline.createInterface({ input: fs.createReadStream(path.join(RAW, file)), crlfDelay: Infinity });

// "Rosario, El" → "El Rosario"; "Hospitalet de Llobregat, L'" → "L'Hospitalet de Llobregat"
function flipArticle(name: string): string {
  const m = name.match(/^(.*), (El|La|Los|Las|L'|Els|Les|Es|Sa|Ses|A|O|Os|As)$/);
  if (!m) return name;
  return m[2].endsWith("'") ? `${m[2]}${m[1]}` : `${m[2]} ${m[1]}`;
}

async function main() {
  const places = new Map<number, Place>();

  // admin1 names (English) + their geonameids, to translate below.
  const admin1 = new Map<string, { name: string; gid: number }>();
  for await (const l of lines("admin1CodesASCII.txt")) {
    const [code, name, , gid] = l.split("\t");
    admin1.set(code, { name, gid: Number(gid) });
  }
  const admin2 = new Map<string, string>();
  for await (const l of lines("admin2Codes.txt")) {
    const [code, name] = l.split("\t");
    if (code.startsWith("ES.")) admin2.set(code, name);
  }

  // Cities over 15k people outside Spain: "where you live now".
  for await (const l of lines("cities15000.txt")) {
    const f = l.split("\t");
    if (f[8] === "ES") continue;
    const id = Number(f[0]);
    places.set(id, {
      id, name: f[1], country: f[8], admin1Code: f[10],
      admin1Name: admin1.get(`${f[8]}.${f[10]}`)?.name ?? "", admin2Name: "",
      lat: Number(f[4]), lng: Number(f[5]), population: Number(f[14]) || 0,
      names: new Set([f[1], f[2], ...f[3].split(",")].filter(Boolean)),
      esNames: [], abroad: true, municipio: false,
    });
  }

  // Every Spanish municipio (GeoNames ADM3): hometowns.
  for await (const l of lines("ES.txt")) {
    const f = l.split("\t");
    if (f[7] !== "ADM3") continue;
    const id = Number(f[0]);
    const flipped = flipArticle(f[1]);
    const name = flipped[0].toUpperCase() + flipped.slice(1);
    places.set(id, {
      id, name, country: "ES", admin1Code: f[10],
      admin1Name: ES_REGIONS[f[10]] ?? "", admin2Name: admin2.get(`ES.${f[10]}.${f[11]}`) ?? "",
      lat: Number(f[4]), lng: Number(f[5]), population: Number(f[14]) || 0,
      names: new Set([name, f[1], f[2], ...f[3].split(",")].filter(Boolean)),
      esNames: [], abroad: false, municipio: true,
    });
  }

  // Spanish names: "London" → "Londres", "England" → "Inglaterra".
  const admin1Gids = new Map<number, string>();
  for (const [code, a] of admin1) admin1Gids.set(a.gid, code);
  const esName = new Map<number, { name: string; score: number }>();
  for await (const l of lines("alternateNamesV2.txt")) {
    const f = l.split("\t");
    if (f[2] !== "es") continue;
    const gid = Number(f[1]);
    if (!places.has(gid) && !admin1Gids.has(gid)) continue;
    if (f[6] === "1" || f[7] === "1") continue; // colloquial / historic
    places.get(gid)?.esNames.push(f[3]);
    const score = (f[4] === "1" ? 2 : 0) + (f[5] === "1" ? 1 : 0);
    const prev = esName.get(gid);
    if (!prev || score > prev.score) esName.set(gid, { name: f[3], score });
  }
  const admin1Es = new Map<string, string>();
  for (const [gid, code] of admin1Gids) {
    const es = esName.get(gid);
    if (es) admin1Es.set(code, es.name);
  }
  for (const p of places.values()) {
    if (p.abroad) {
      const es = esName.get(p.id);
      if (es) p.name = es.name;
      p.admin1Name = admin1Es.get(`${p.country}.${p.admin1Code}`) ?? p.admin1Name;
    }
  }

  // Write CSV.
  const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const out = fs.createWriteStream(OUT);
  out.write("id,name,country_code,admin1_code,admin1_name,admin2_name,lat,lng,population,search,is_abroad,is_es_municipio\n");
  for (const p of [...places.values()].sort((a, b) => a.id - b.id)) {
    // Search text: Latin-script names only, de-duplicated, capped.
    const search = [...new Set([p.name, ...p.esNames, ...p.names].map(normalizeText))]
      .filter((n) => n && /^[a-z0-9' -]+$/.test(n) && !/^\d+$/.test(n))
      .slice(0, 12)
      .join("|");
    out.write([
      p.id, q(p.name), p.country, q(p.admin1Code), q(p.admin1Name), q(p.admin2Name),
      p.lat.toFixed(5), p.lng.toFixed(5), p.population, q(search), p.abroad, p.municipio,
    ].join(",") + "\n");
  }
  out.end();

  // Which countries have postcode data (so the form only asks where useful).
  // Only countries with real coverage (≥ 50 postcode areas).
  const areas = new Map<string, Set<string>>();
  for await (const l of lines("postal/allCountries.txt")) {
    const [c, pc] = l.split("\t");
    if (POSTCODE_EXCLUDED.has(c)) continue;
    if (!areas.has(c)) areas.set(c, new Set());
    areas.get(c)!.add(postcodeArea(c, pc));
  }
  const pcCountries = new Set([...areas].filter(([, s]) => s.size >= 50).map(([c]) => c));
  fs.writeFileSync(OUT_PC_COUNTRIES, JSON.stringify([...pcCountries].sort()) + "\n");

  const all = [...places.values()];
  console.log(
    `places: ${all.length} (abroad ${all.filter((p) => p.abroad).length}, municipios ${all.filter((p) => p.municipio).length}); postcode countries: ${pcCountries.size}`,
  );
}

main();
