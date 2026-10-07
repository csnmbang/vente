/**
 * Checks src/content/rutas.ts after editing:
 *   npm run check:rutas
 * Prints every route with its computed distance (shortest first), flags
 * coordinates outside Spain, walks that are too long, and comunidades with
 * too few routes. Exits non-zero on errors.
 */
import { COMUNIDADES } from "../src/content/rutas";
import { distanciaEnRuta, rutasConKm } from "../src/lib/rutas";

const rutas = rutasConKm().sort((a, b) => a.km - b.km);
const errores: string[] = [];

// Peninsula, Balearics, Canaries, Ceuta and Melilla all fit in this box.
const enEspana = (p: { lat: number; lng: number }) =>
  p.lat > 27.5 && p.lat < 44 && p.lng > -18.5 && p.lng < 4.5;

for (const r of rutas) {
  const nombre = `${r.a.nombre}–${r.b.nombre}`;
  console.log(`${r.km.toFixed(2).padStart(8)} km  ${r.modo.padEnd(6)} ${nombre}`);
  if (!enEspana(r.a) || !enEspana(r.b)) errores.push(`Fuera de España: ${nombre}`);
  if (r.modo === "pie" && r.km > 6) errores.push(`Paseo de ${r.km.toFixed(1)} km, ¿coordenadas mal?: ${nombre}`);
  if (r.km < 0.05) errores.push(`Los dos extremos están en el mismo sitio: ${nombre}`);
}

for (const c of COMUNIDADES) {
  const n = rutas.filter((r) => r.regiones.includes(c)).length;
  if (n < 3) errores.push(`${c} solo tiene ${n} rutas (mínimo 3)`);
}

console.log("\nEjemplos:");
for (const km of [0.1, 0.8, 3, 20, 75, 300, 500, 1300, 1750, 2500, 4000, 9000]) {
  console.log(`${String(km).padStart(6)} km → ${distanciaEnRuta(km).texto}`);
}

if (errores.length) {
  console.error(`\n${errores.length} problema(s):\n- ${errores.join("\n- ")}`);
  process.exit(1);
}
console.log(`\n${rutas.length} rutas, todo bien.`);
