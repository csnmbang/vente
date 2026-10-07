/**
 * Loads place and postcode data into Supabase. Run once after creating the
 * database (and again whenever data/places.csv changes):
 *
 *   npm run import:geo
 *
 * Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Downloads the GeoNames postcode file (~20 MB) if data/raw/ doesn't have it.
 * Safe to re-run: rows are upserted.
 *
 * Data © GeoNames (geonames.org), CC BY 4.0.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { postcodeArea, POSTCODE_EXCLUDED } from "../src/lib/geo";

process.loadEnvFile?.(path.join(__dirname, "..", ".env.local"));
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const ROOT = path.join(__dirname, "..");
const RAW = path.join(ROOT, "data", "raw");
const BATCH = 1000;

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

async function upsert(table: string, rows: object[], onConflict: string) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await db.from(table).upsert(rows.slice(i, i + BATCH), { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
    process.stdout.write(`\r${table}: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
  }
  process.stdout.write("\n");
}

async function importPlaces() {
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(ROOT, "data", "places.csv")),
    crlfDelay: Infinity,
  });
  const rows: object[] = [];
  let header = true;
  for await (const line of rl) {
    if (header) { header = false; continue; }
    const [id, name, cc, a1code, a1name, a2name, lat, lng, pop, search, abroad, muni] = parseCsvLine(line);
    rows.push({
      id: Number(id), name, country_code: cc, admin1_code: a1code || null,
      admin1_name: a1name || null, admin2_name: a2name || null,
      lat: Number(lat), lng: Number(lng), population: Number(pop), search,
      is_abroad: abroad === "true", is_es_municipio: muni === "true",
    });
  }
  await upsert("cities", rows, "id");
}

async function importPostcodes() {
  const txt = path.join(RAW, "postal", "allCountries.txt");
  if (!fs.existsSync(txt)) {
    fs.mkdirSync(RAW, { recursive: true });
    const zip = path.join(RAW, "postal-allCountries.zip");
    console.log("Descargando códigos postales de GeoNames…");
    execFileSync("curl", ["-sSfL", "-o", zip, "https://download.geonames.org/export/zip/allCountries.zip"]);
    execFileSync("unzip", ["-oq", zip, "-d", path.join(RAW, "postal")]);
  }

  // Collapse to postcode *areas* and average their coordinates.
  const areas = new Map<string, { cc: string; pc: string; place: string; lat: number; lng: number; n: number }>();
  const rl = readline.createInterface({ input: fs.createReadStream(txt), crlfDelay: Infinity });
  for await (const line of rl) {
    const f = line.split("\t");
    const cc = f[0];
    if (POSTCODE_EXCLUDED.has(cc) || !f[9] || !f[10]) continue;
    const pc = postcodeArea(cc, f[1]);
    if (!pc) continue;
    const key = `${cc}:${pc}`;
    const a = areas.get(key);
    if (a) { a.lat += Number(f[9]); a.lng += Number(f[10]); a.n++; }
    else areas.set(key, { cc, pc, place: f[2], lat: Number(f[9]), lng: Number(f[10]), n: 1 });
  }
  const rows = [...areas.values()].map((a) => ({
    country_code: a.cc, postcode: a.pc, place_name: a.place,
    lat: +(a.lat / a.n).toFixed(5), lng: +(a.lng / a.n).toFixed(5),
  }));
  await upsert("postcodes", rows, "country_code,postcode");
}

(async () => {
  await importPlaces();
  await importPostcodes();
  console.log("¡Listo! Datos geográficos cargados.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
