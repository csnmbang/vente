import type { Comunidad } from "./rutas";

/**
 * Spanish provinces: display name, comunidad and demonym ("3 murcianos").
 * EDIT FREELY: names and demonyms are only text.
 *
 * Keys are the province names exactly as they appear in our place data
 * (GeoNames), so don't change the keys.
 * `gentilicio` is [singular, plural]. When there's no common one, use null
 * and the app says "3 de Las Palmas".
 */
export type Provincia = {
  nombre: string;
  comunidad: Comunidad;
  gentilicio: [string, string] | null;
};

export const PROVINCIAS: Record<string, Provincia> = {
  "Almería": { nombre: "Almería", comunidad: "Andalucía", gentilicio: ["almeriense", "almerienses"] },
  "Provincia de Cádiz": { nombre: "Cádiz", comunidad: "Andalucía", gentilicio: ["gaditano", "gaditanos"] },
  "Province of Córdoba": { nombre: "Córdoba", comunidad: "Andalucía", gentilicio: ["cordobés", "cordobeses"] },
  "Provincia de Granada": { nombre: "Granada", comunidad: "Andalucía", gentilicio: ["granadino", "granadinos"] },
  "Provincia de Huelva": { nombre: "Huelva", comunidad: "Andalucía", gentilicio: ["onubense", "onubenses"] },
  "Provincia de Jaén": { nombre: "Jaén", comunidad: "Andalucía", gentilicio: ["jienense", "jienenses"] },
  "Provincia de Málaga": { nombre: "Málaga", comunidad: "Andalucía", gentilicio: ["malagueño", "malagueños"] },
  "Provincia de Sevilla": { nombre: "Sevilla", comunidad: "Andalucía", gentilicio: ["sevillano", "sevillanos"] },

  "Provincia de Huesca": { nombre: "Huesca", comunidad: "Aragón", gentilicio: ["oscense", "oscenses"] },
  "Provincia de Teruel": { nombre: "Teruel", comunidad: "Aragón", gentilicio: ["turolense", "turolenses"] },
  "Provincia de Zaragoza": { nombre: "Zaragoza", comunidad: "Aragón", gentilicio: ["zaragozano", "zaragozanos"] },

  "Province of Asturias": { nombre: "Asturias", comunidad: "Asturias", gentilicio: ["asturiano", "asturianos"] },

  "Illes Balears": { nombre: "Islas Baleares", comunidad: "Islas Baleares", gentilicio: ["balear", "baleares"] },

  "Provincia de Las Palmas": { nombre: "Las Palmas", comunidad: "Canarias", gentilicio: null },
  "Provincia de Santa Cruz de Tenerife": { nombre: "Santa Cruz de Tenerife", comunidad: "Canarias", gentilicio: null },

  "Provincia de Cantabria": { nombre: "Cantabria", comunidad: "Cantabria", gentilicio: ["cántabro", "cántabros"] },

  "Provincia de Ávila": { nombre: "Ávila", comunidad: "Castilla y León", gentilicio: ["abulense", "abulenses"] },
  "Provincia de Burgos": { nombre: "Burgos", comunidad: "Castilla y León", gentilicio: ["burgalés", "burgaleses"] },
  "Provincia de León": { nombre: "León", comunidad: "Castilla y León", gentilicio: ["leonés", "leoneses"] },
  "Provincia de Palencia": { nombre: "Palencia", comunidad: "Castilla y León", gentilicio: ["palentino", "palentinos"] },
  "Provincia de Salamanca": { nombre: "Salamanca", comunidad: "Castilla y León", gentilicio: ["salmantino", "salmantinos"] },
  "Provincia de Segovia": { nombre: "Segovia", comunidad: "Castilla y León", gentilicio: ["segoviano", "segovianos"] },
  "Provincia de Soria": { nombre: "Soria", comunidad: "Castilla y León", gentilicio: ["soriano", "sorianos"] },
  "Provincia de Valladolid": { nombre: "Valladolid", comunidad: "Castilla y León", gentilicio: ["vallisoletano", "vallisoletanos"] },
  "Provincia de Zamora": { nombre: "Zamora", comunidad: "Castilla y León", gentilicio: ["zamorano", "zamoranos"] },

  "Provincia de Albacete": { nombre: "Albacete", comunidad: "Castilla-La Mancha", gentilicio: ["albaceteño", "albaceteños"] },
  "Provincia de Ciudad Real": { nombre: "Ciudad Real", comunidad: "Castilla-La Mancha", gentilicio: ["ciudadrealeño", "ciudadrealeños"] },
  "Provincia de Cuenca": { nombre: "Cuenca", comunidad: "Castilla-La Mancha", gentilicio: ["conquense", "conquenses"] },
  "Provincia de Guadalajara": { nombre: "Guadalajara", comunidad: "Castilla-La Mancha", gentilicio: ["guadalajareño", "guadalajareños"] },
  "Province of Toledo": { nombre: "Toledo", comunidad: "Castilla-La Mancha", gentilicio: ["toledano", "toledanos"] },

  "Província de Barcelona": { nombre: "Barcelona", comunidad: "Cataluña", gentilicio: ["barcelonés", "barceloneses"] },
  "Província de Girona": { nombre: "Girona", comunidad: "Cataluña", gentilicio: ["gerundense", "gerundenses"] },
  "Província de Lleida": { nombre: "Lleida", comunidad: "Cataluña", gentilicio: ["leridano", "leridanos"] },
  "Província de Tarragona": { nombre: "Tarragona", comunidad: "Cataluña", gentilicio: ["tarraconense", "tarraconenses"] },

  "Provincia de Alicante": { nombre: "Alicante", comunidad: "Comunidad Valenciana", gentilicio: ["alicantino", "alicantinos"] },
  "Província de Castelló": { nombre: "Castellón", comunidad: "Comunidad Valenciana", gentilicio: ["castellonense", "castellonenses"] },
  "Província de València": { nombre: "Valencia", comunidad: "Comunidad Valenciana", gentilicio: ["valenciano", "valencianos"] },

  "Provincia de Badajoz": { nombre: "Badajoz", comunidad: "Extremadura", gentilicio: ["pacense", "pacenses"] },
  "Provincia de Cáceres": { nombre: "Cáceres", comunidad: "Extremadura", gentilicio: ["cacereño", "cacereños"] },

  "Provincia da Coruña": { nombre: "A Coruña", comunidad: "Galicia", gentilicio: ["coruñés", "coruñeses"] },
  "Provincia de Lugo": { nombre: "Lugo", comunidad: "Galicia", gentilicio: ["lucense", "lucenses"] },
  "Provincia de Ourense": { nombre: "Ourense", comunidad: "Galicia", gentilicio: ["orensano", "orensanos"] },
  "Provincia de Pontevedra": { nombre: "Pontevedra", comunidad: "Galicia", gentilicio: ["pontevedrés", "pontevedreses"] },

  "Provincia de Madrid": { nombre: "Madrid", comunidad: "Comunidad de Madrid", gentilicio: ["madrileño", "madrileños"] },

  "Murcia": { nombre: "Murcia", comunidad: "Región de Murcia", gentilicio: ["murciano", "murcianos"] },

  "Provincia de Navarra": { nombre: "Navarra", comunidad: "Navarra", gentilicio: ["navarro", "navarros"] },

  "Araba / Álava": { nombre: "Álava", comunidad: "País Vasco", gentilicio: ["alavés", "alaveses"] },
  "Bizkaia": { nombre: "Bizkaia", comunidad: "País Vasco", gentilicio: ["vizcaíno", "vizcaínos"] },
  "Gipuzkoa": { nombre: "Gipuzkoa", comunidad: "País Vasco", gentilicio: ["guipuzcoano", "guipuzcoanos"] },

  "Provincia de La Rioja": { nombre: "La Rioja", comunidad: "La Rioja", gentilicio: ["riojano", "riojanos"] },

  "Ceuta": { nombre: "Ceuta", comunidad: "Ceuta", gentilicio: ["ceutí", "ceutíes"] },
  "Melilla": { nombre: "Melilla", comunidad: "Melilla", gentilicio: ["melillense", "melillenses"] },
};

/** "3 murcianos", "1 murciano", "2 de Las Palmas". */
export function contarPaisanos(clave: string, n: number): string {
  const p = PROVINCIAS[clave];
  if (!p) return `${n} de ${clave}`;
  if (!p.gentilicio) return `${n} de ${p.nombre}`;
  return `${n} ${n === 1 ? p.gentilicio[0] : p.gentilicio[1]}`;
}

/** Every province sorted by name, for pickers. */
export function provinciasParaElegir(): { clave: string; nombre: string; comunidad: Comunidad }[] {
  return Object.entries(PROVINCIAS)
    .map(([clave, p]) => ({ clave, nombre: p.nombre, comunidad: p.comunidad }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
