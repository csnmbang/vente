import { RUTAS, type Comunidad, type Ruta } from "@/content/rutas";
import { haversineKm } from "./geo";

// Runs in the browser too (the map), so no server-only imports here.

type RutaKm = Ruta & { km: number };

const CON_KM: RutaKm[] = RUTAS.map((r) => ({ ...r, km: haversineKm(r.a, r.b) }));
const MAS_CORTA = Math.min(...CON_KM.map((r) => r.km));
const MAS_LARGA = Math.max(...CON_KM.map((r) => r.km));

// Beyond the longest route we count in multiples, but only of long routes:
// "dos Madrid–Tenerife" works, "cuarenta Madrid–Toledo" doesn't.
const MIN_KM_PARA_MULTIPLOS = 500;
// Routes this close in fit to the best one count as a tie, and the tie goes
// to the reader's region, then to famous routes. 0.15 ≈ ±16 % in length.
const EMPATE = 0.15;
const PENALIZACION_POR_VEZ = 0.05;

const NUMEROS = [
  "", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
  "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho",
  "diecinueve", "veinte",
];

export type DistanciaEnRuta = {
  texto: string; // "a un Alicante–Murcia de ti"
  ruta: Ruta | null;
  veces: number;
};

/** Describe a distance in km as a Spanish route, never as a number. */
export function distanciaEnRuta(km: number, region?: Comunidad | null): DistanciaEnRuta {
  if (km < MAS_CORTA * 0.5) return { texto: "a la vuelta de la esquina", ruta: null, veces: 0 };

  const candidatas: { r: RutaKm; veces: number; error: number }[] = [];
  for (const r of CON_KM) {
    let veces = 1;
    if (km > MAS_LARGA * 1.2) {
      if (r.km < MIN_KM_PARA_MULTIPLOS) continue;
      veces = Math.max(2, Math.round(km / r.km));
    }
    // Fewer, longer hops are easier to picture: "dos vuelos" beats "once Barcelona–Sevilla".
    const error = Math.abs(Math.log(km / (veces * r.km))) + PENALIZACION_POR_VEZ * (veces - 1);
    candidatas.push({ r, veces, error });
  }

  const mejorError = Math.min(...candidatas.map((c) => c.error));
  const deCasa = (r: Ruta) => (region && r.regiones.includes(region) ? 0 : 1);
  const [elegida] = candidatas
    .filter((c) => c.error <= mejorError + EMPATE)
    .sort(
      (x, y) =>
        deCasa(x.r) - deCasa(y.r) ||
        Number(!x.r.famosa) - Number(!y.r.famosa) ||
        x.error - y.error,
    );

  return {
    texto: `a ${frase(elegida.r, elegida.veces)} de ti`,
    ruta: elegida.r,
    veces: elegida.veces,
  };
}

function frase(r: Ruta, veces: number): string {
  const n = NUMEROS[veces] ?? String(veces);
  const plural = veces > 1;
  if (r.frase) return plural ? `${n} ${r.frase[1]}` : r.frase[0];

  const tramo = `${r.a.nombre}–${r.b.nombre}`;
  switch (r.modo) {
    case "pie":
      return `${n} ${plural ? "paseos" : "paseo"} ${contraer(`de ${r.a.nombre} a ${r.b.nombre}`)}`;
    case "ave":
      return `${n} AVE ${tramo}`;
    case "ferry":
      return `${n} ${plural ? "ferris" : "ferry"} ${tramo}`;
    case "avion":
      return `${n} ${plural ? "vuelos" : "vuelo"} ${tramo}`;
    default:
      return `${n} ${tramo}`;
  }
}

/** "de el Pilar a el Bernabéu" → "del Pilar al Bernabéu". */
function contraer(s: string): string {
  return s.replace(/\bde el\b/g, "del").replace(/\ba el\b/g, "al");
}

/** Sanity data for `npm run check:rutas`. */
export function rutasConKm(): RutaKm[] {
  return CON_KM;
}
