/**
 * Reference routes for telling distances the Spanish way:
 * "a un Alicante–Murcia de ti". EDIT FREELY.
 *
 * Each route is two places in Spain with their coordinates. Distances are
 * never written here: the app computes them in a straight line from the
 * coordinates, so a route only has to be correct about *where* its ends are.
 *
 * - `modo` changes the wording: "pie" → "un paseo de Sol a Cibeles",
 *   "coche" → "un Alicante–Murcia", "ave" → "un AVE Madrid–Sevilla",
 *   "ferry" → "un ferry Barcelona–Palma", "avion" → "un vuelo Madrid–Tenerife".
 * - For walks ("pie") write names with their article ("la Giralda"), so the
 *   sentence reads naturally. For the rest, just the place name.
 * - `regiones`: the comunidad(es) the route belongs to. Readers from those
 *   regions get it first when two routes are about the same length.
 * - `famosa`: known all over Spain. Preferred after the reader's own region.
 * - `frase` (optional): custom wording, singular and plural, when "A–B"
 *   doesn't sound right.
 *
 * Coordinates: Spanish municipios from GeoNames, landmarks from
 * OpenStreetMap. To add one, right-click the spot on openstreetmap.org and
 * choose "Show address" to copy its coordinates. Then run
 * `npm run check:rutas` to see the computed distances and catch mistakes.
 */

export const COMUNIDADES = [
  "Andalucía", "Aragón", "Asturias", "Islas Baleares", "Canarias", "Cantabria",
  "Castilla y León", "Castilla-La Mancha", "Cataluña", "Comunidad Valenciana",
  "Extremadura", "Galicia", "Comunidad de Madrid", "Región de Murcia", "Navarra",
  "País Vasco", "La Rioja", "Ceuta", "Melilla",
] as const;

export type Comunidad = (typeof COMUNIDADES)[number];

export type Lugar = { nombre: string; lat: number; lng: number };

export type Ruta = {
  modo: "pie" | "coche" | "ave" | "ferry" | "avion";
  a: Lugar;
  b: Lugar;
  regiones: Comunidad[];
  famosa?: boolean;
  frase?: [singular: string, plural: string];
};

export const RUTAS: Ruta[] = [
  // Andalucía
  {
    modo: "pie",
    a: { nombre: "la Giralda", lat: 37.38621, lng: -5.99256 },
    b: { nombre: "la Plaza de España", lat: 37.37697, lng: -5.98694 },
    regiones: ["Andalucía"], famosa: true,
  },
  {
    modo: "pie",
    a: { nombre: "la Mezquita", lat: 37.87903, lng: -4.77945 },
    b: { nombre: "el Puente Romano", lat: 37.87665, lng: -4.77796 },
    regiones: ["Andalucía"],
  },
  {
    modo: "pie",
    a: { nombre: "la Alhambra", lat: 37.17726, lng: -3.58962 },
    b: { nombre: "el Mirador de San Nicolás", lat: 37.18104, lng: -3.59266 },
    regiones: ["Andalucía"],
  },
  {
    modo: "pie",
    a: { nombre: "calle Larios", lat: 36.71967, lng: -4.42160 },
    b: { nombre: "La Malagueta", lat: 36.71644, lng: -4.41094 },
    regiones: ["Andalucía"],
  },
  {
    modo: "pie",
    a: { nombre: "la Catedral de Cádiz", lat: 36.52895, lng: -6.29532 },
    b: { nombre: "La Caleta", lat: 36.52848, lng: -6.30650 },
    regiones: ["Andalucía"],
  },
  {
    modo: "coche",
    a: { nombre: "Sevilla", lat: 37.39141, lng: -5.95918 },
    b: { nombre: "Dos Hermanas", lat: 37.25217, lng: -5.95985 },
    regiones: ["Andalucía"],
  },
  {
    modo: "coche",
    a: { nombre: "Málaga", lat: 36.75854, lng: -4.39717 },
    b: { nombre: "Torremolinos", lat: 36.62387, lng: -4.50458 },
    regiones: ["Andalucía"],
  },
  {
    modo: "coche",
    a: { nombre: "Cádiz", lat: 36.50088, lng: -6.26843 },
    b: { nombre: "Jerez", lat: 36.69687, lng: -6.13277 },
    regiones: ["Andalucía"],
  },
  {
    modo: "coche",
    a: { nombre: "Marbella", lat: 36.51443, lng: -4.88604 },
    b: { nombre: "Estepona", lat: 36.44543, lng: -5.12739 },
    regiones: ["Andalucía"],
  },
  {
    modo: "coche",
    a: { nombre: "Granada", lat: 37.18863, lng: -3.59078 },
    b: { nombre: "Málaga", lat: 36.75854, lng: -4.39717 },
    regiones: ["Andalucía"],
  },
  {
    modo: "ave",
    a: { nombre: "Sevilla", lat: 37.39141, lng: -5.95918 },
    b: { nombre: "Córdoba", lat: 37.90448, lng: -4.77768 },
    regiones: ["Andalucía"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "Almería", lat: 36.87557, lng: -2.34230 },
    b: { nombre: "Granada", lat: 37.18863, lng: -3.59078 },
    regiones: ["Andalucía"],
  },
  {
    modo: "coche",
    a: { nombre: "Huelva", lat: 37.25820, lng: -6.92932 },
    b: { nombre: "Sevilla", lat: 37.39141, lng: -5.95918 },
    regiones: ["Andalucía"],
  },
  {
    modo: "coche",
    a: { nombre: "Jaén", lat: 37.82585, lng: -3.73316 },
    b: { nombre: "Granada", lat: 37.18863, lng: -3.59078 },
    regiones: ["Andalucía"],
  },
  {
    modo: "ferry",
    a: { nombre: "Algeciras", lat: 36.10549, lng: -5.45284 },
    b: { nombre: "Ceuta", lat: 35.88682, lng: -5.31738 },
    regiones: ["Andalucía", "Ceuta"], famosa: true,
  },

  // Aragón
  {
    modo: "pie",
    a: { nombre: "el Pilar", lat: 41.65677, lng: -0.87852 },
    b: { nombre: "la Aljafería", lat: 41.65649, lng: -0.89666 },
    regiones: ["Aragón"],
  },
  {
    modo: "coche",
    a: { nombre: "Zaragoza", lat: 41.64829, lng: -0.88303 },
    b: { nombre: "Huesca", lat: 42.14838, lng: -0.41253 },
    regiones: ["Aragón"],
  },
  {
    modo: "coche",
    a: { nombre: "Zaragoza", lat: 41.64829, lng: -0.88303 },
    b: { nombre: "Teruel", lat: 40.36334, lng: -1.08938 },
    regiones: ["Aragón"],
  },
  {
    modo: "coche",
    a: { nombre: "Huesca", lat: 42.14838, lng: -0.41253 },
    b: { nombre: "Jaca", lat: 42.57605, lng: -0.54094 },
    regiones: ["Aragón"],
  },
  {
    modo: "ave",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Zaragoza", lat: 41.64829, lng: -0.88303 },
    regiones: ["Aragón", "Comunidad de Madrid"],
  },

  // Asturias
  {
    modo: "pie",
    a: { nombre: "la Catedral de Oviedo", lat: 43.36252, lng: -5.84329 },
    b: { nombre: "el Campo San Francisco", lat: 43.36117, lng: -5.85068 },
    regiones: ["Asturias"],
  },
  {
    modo: "coche",
    a: { nombre: "Oviedo", lat: 43.35796, lng: -5.87339 },
    b: { nombre: "Gijón", lat: 43.52931, lng: -5.67732 },
    regiones: ["Asturias"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "Gijón", lat: 43.52931, lng: -5.67732 },
    b: { nombre: "Avilés", lat: 43.56667, lng: -5.93333 },
    regiones: ["Asturias"],
  },
  {
    modo: "coche",
    a: { nombre: "Cangas de Onís", lat: 43.32841, lng: -5.07175 },
    b: { nombre: "Covadonga", lat: 43.30886, lng: -5.05352 },
    regiones: ["Asturias"],
  },
  {
    modo: "coche",
    a: { nombre: "Oviedo", lat: 43.35796, lng: -5.87339 },
    b: { nombre: "León", lat: 42.57357, lng: -5.56716 },
    regiones: ["Asturias", "Castilla y León"],
  },

  // Islas Baleares
  {
    modo: "pie",
    a: { nombre: "la Catedral de Palma", lat: 39.56747, lng: 2.64817 },
    b: { nombre: "la Plaza Mayor de Palma", lat: 39.57138, lng: 2.65173 },
    regiones: ["Islas Baleares"],
  },
  {
    modo: "coche",
    a: { nombre: "Palma", lat: 39.56951, lng: 2.64745 },
    b: { nombre: "Inca", lat: 39.71868, lng: 2.90588 },
    regiones: ["Islas Baleares"],
  },
  {
    modo: "coche",
    a: { nombre: "Ibiza", lat: 38.90894, lng: 1.43577 },
    b: { nombre: "Sant Antoni", lat: 38.98183, lng: 1.30136 },
    regiones: ["Islas Baleares"],
  },
  {
    modo: "ferry",
    a: { nombre: "Palma", lat: 39.56951, lng: 2.64745 },
    b: { nombre: "Ibiza", lat: 38.90894, lng: 1.43577 },
    regiones: ["Islas Baleares"],
  },
  {
    modo: "ferry",
    a: { nombre: "Palma", lat: 39.56951, lng: 2.64745 },
    b: { nombre: "Mahón", lat: 39.88811, lng: 4.26330 },
    regiones: ["Islas Baleares"],
  },
  {
    modo: "ferry",
    a: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    b: { nombre: "Palma", lat: 39.56951, lng: 2.64745 },
    regiones: ["Islas Baleares", "Cataluña"], famosa: true,
  },
  {
    modo: "ferry",
    a: { nombre: "Dénia", lat: 38.82771, lng: 0.06777 },
    b: { nombre: "Ibiza", lat: 38.90894, lng: 1.43577 },
    regiones: ["Islas Baleares", "Comunidad Valenciana"],
  },

  // Canarias
  {
    modo: "pie",
    a: { nombre: "la Plaza de España", lat: 28.46707, lng: -16.24671 },
    b: { nombre: "el Auditorio", lat: 28.45607, lng: -16.25124 },
    regiones: ["Canarias"],
  },
  {
    modo: "pie",
    a: { nombre: "Las Canteras", lat: 28.13955, lng: -15.43663 },
    b: { nombre: "el Parque Santa Catalina", lat: 28.14054, lng: -15.43076 },
    regiones: ["Canarias"],
  },
  {
    modo: "coche",
    a: { nombre: "Santa Cruz", lat: 28.53924, lng: -16.20302 },
    b: { nombre: "La Laguna", lat: 28.50910, lng: -16.29962 },
    regiones: ["Canarias"],
  },
  {
    modo: "coche",
    a: { nombre: "Las Palmas", lat: 28.11654, lng: -15.43898 },
    b: { nombre: "Telde", lat: 27.97780, lng: -15.41367 },
    regiones: ["Canarias"],
  },
  {
    modo: "coche",
    a: { nombre: "Puerto de la Cruz", lat: 28.41046, lng: -16.54623 },
    b: { nombre: "La Orotava", lat: 28.31932, lng: -16.54762 },
    regiones: ["Canarias"],
  },
  {
    modo: "ferry",
    a: { nombre: "Tenerife", lat: 28.53924, lng: -16.20302 },
    b: { nombre: "Gran Canaria", lat: 28.11654, lng: -15.43898 },
    regiones: ["Canarias"], famosa: true,
  },
  {
    modo: "avion",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Tenerife", lat: 28.53924, lng: -16.20302 },
    regiones: ["Canarias", "Comunidad de Madrid"], famosa: true,
  },
  {
    modo: "avion",
    a: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    b: { nombre: "Gran Canaria", lat: 28.11654, lng: -15.43898 },
    regiones: ["Canarias", "Cataluña"], famosa: true,
  },
  {
    modo: "avion",
    a: { nombre: "Girona", lat: 41.98246, lng: 2.83081 },
    b: { nombre: "El Hierro", lat: 27.79857, lng: -17.93483 },
    regiones: ["Canarias", "Cataluña"], famosa: true,
  },

  // Cantabria
  {
    modo: "pie",
    a: { nombre: "El Sardinero", lat: 43.47733, lng: -3.78715 },
    b: { nombre: "La Magdalena", lat: 43.46922, lng: -3.76608 },
    regiones: ["Cantabria"],
  },
  {
    modo: "coche",
    a: { nombre: "Santander", lat: 43.47225, lng: -3.81994 },
    b: { nombre: "Torrelavega", lat: 43.34458, lng: -4.05110 },
    regiones: ["Cantabria"],
  },
  {
    modo: "coche",
    a: { nombre: "Santander", lat: 43.47225, lng: -3.81994 },
    b: { nombre: "Comillas", lat: 43.37834, lng: -4.30004 },
    regiones: ["Cantabria"],
  },
  {
    modo: "coche",
    a: { nombre: "Bilbao", lat: 43.26035, lng: -2.93341 },
    b: { nombre: "Santander", lat: 43.47225, lng: -3.81994 },
    regiones: ["Cantabria", "País Vasco"],
  },

  // Castilla y León
  {
    modo: "pie",
    a: { nombre: "la Plaza Mayor de Salamanca", lat: 40.96503, lng: -5.66406 },
    b: { nombre: "la Catedral de Salamanca", lat: 40.96058, lng: -5.66598 },
    regiones: ["Castilla y León"],
  },
  {
    modo: "pie",
    a: { nombre: "la Plaza Mayor de Valladolid", lat: 41.65206, lng: -4.72855 },
    b: { nombre: "el Campo Grande", lat: 41.64526, lng: -4.73236 },
    regiones: ["Castilla y León"],
  },
  {
    modo: "pie",
    a: { nombre: "el Acueducto", lat: 40.94361, lng: -4.10930 },
    b: { nombre: "el Alcázar de Segovia", lat: 40.95248, lng: -4.13218 },
    regiones: ["Castilla y León"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "Valladolid", lat: 41.65230, lng: -4.72854 },
    b: { nombre: "Salamanca", lat: 40.95597, lng: -5.68022 },
    regiones: ["Castilla y León"],
  },
  {
    modo: "coche",
    a: { nombre: "Burgos", lat: 42.34997, lng: -3.68221 },
    b: { nombre: "Valladolid", lat: 41.65230, lng: -4.72854 },
    regiones: ["Castilla y León"],
  },
  {
    modo: "coche",
    a: { nombre: "León", lat: 42.57357, lng: -5.56716 },
    b: { nombre: "Ponferrada", lat: 42.50253, lng: -6.57195 },
    regiones: ["Castilla y León"],
  },
  {
    modo: "coche",
    a: { nombre: "Ávila", lat: 40.66864, lng: -4.66064 },
    b: { nombre: "Segovia", lat: 40.90194, lng: -4.18299 },
    regiones: ["Castilla y León"],
  },
  {
    modo: "ave",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Valladolid", lat: 41.65230, lng: -4.72854 },
    regiones: ["Castilla y León", "Comunidad de Madrid"],
  },

  // Castilla-La Mancha
  {
    modo: "pie",
    a: { nombre: "la Catedral de Toledo", lat: 39.85691, lng: -4.02427 },
    b: { nombre: "el Puente de San Martín", lat: 39.85668, lng: -4.03413 },
    regiones: ["Castilla-La Mancha"],
  },
  {
    modo: "coche",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Toledo", lat: 39.86765, lng: -4.00988 },
    regiones: ["Castilla-La Mancha", "Comunidad de Madrid"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "Albacete", lat: 38.97386, lng: -1.85307 },
    b: { nombre: "Cuenca", lat: 40.07492, lng: -2.13615 },
    regiones: ["Castilla-La Mancha"],
  },
  {
    modo: "coche",
    a: { nombre: "Ciudad Real", lat: 38.95542, lng: -3.98099 },
    b: { nombre: "Puertollano", lat: 38.63995, lng: -4.09159 },
    regiones: ["Castilla-La Mancha"],
  },
  {
    modo: "coche",
    a: { nombre: "Guadalajara", lat: 40.64362, lng: -3.17188 },
    b: { nombre: "Alcalá de Henares", lat: 40.49940, lng: -3.34017 },
    regiones: ["Castilla-La Mancha", "Comunidad de Madrid"],
  },
  {
    modo: "coche",
    a: { nombre: "Talavera", lat: 39.96054, lng: -4.83319 },
    b: { nombre: "Toledo", lat: 39.86765, lng: -4.00988 },
    regiones: ["Castilla-La Mancha"],
  },

  // Cataluña
  {
    modo: "pie",
    a: { nombre: "plaza Cataluña", lat: 41.38774, lng: 2.17046 },
    b: { nombre: "la Sagrada Familia", lat: 41.40350, lng: 2.17443 },
    regiones: ["Cataluña"], famosa: true,
  },
  {
    modo: "pie",
    a: { nombre: "las Ramblas", lat: 41.38774, lng: 2.17046 },
    b: { nombre: "Colón", lat: 41.37580, lng: 2.17777 },
    regiones: ["Cataluña"], famosa: true, frase: ["un paseo por las Ramblas", "paseos por las Ramblas"],
  },
  {
    modo: "coche",
    a: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    b: { nombre: "Badalona", lat: 41.44826, lng: 2.24842 },
    regiones: ["Cataluña"],
  },
  {
    modo: "coche",
    a: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    b: { nombre: "Sabadell", lat: 41.54878, lng: 2.10137 },
    regiones: ["Cataluña"],
  },
  {
    modo: "coche",
    a: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    b: { nombre: "Sitges", lat: 41.23561, lng: 1.80828 },
    regiones: ["Cataluña"],
  },
  {
    modo: "coche",
    a: { nombre: "Girona", lat: 41.98246, lng: 2.83081 },
    b: { nombre: "Figueres", lat: 42.26432, lng: 2.96176 },
    regiones: ["Cataluña"],
  },
  {
    modo: "coche",
    a: { nombre: "Tarragona", lat: 41.12386, lng: 1.26639 },
    b: { nombre: "Reus", lat: 41.15552, lng: 1.10533 },
    regiones: ["Cataluña"],
  },
  {
    modo: "coche",
    a: { nombre: "Lleida", lat: 41.63077, lng: 0.59561 },
    b: { nombre: "Tarragona", lat: 41.12386, lng: 1.26639 },
    regiones: ["Cataluña"],
  },
  {
    modo: "ave",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    regiones: ["Cataluña", "Comunidad de Madrid"], famosa: true,
  },

  // Comunidad Valenciana
  {
    modo: "pie",
    a: { nombre: "la plaza del Ayuntamiento", lat: 39.47065, lng: -0.37683 },
    b: { nombre: "la Ciudad de las Artes", lat: 39.45576, lng: -0.35255 },
    regiones: ["Comunidad Valenciana"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "Valencia", lat: 39.45612, lng: -0.35457 },
    b: { nombre: "Torrent", lat: 39.42591, lng: -0.49690 },
    regiones: ["Comunidad Valenciana"],
  },
  {
    modo: "coche",
    a: { nombre: "Alicante", lat: 38.35323, lng: -0.48134 },
    b: { nombre: "Elche", lat: 38.26905, lng: -0.70797 },
    regiones: ["Comunidad Valenciana"],
  },
  {
    modo: "coche",
    a: { nombre: "Benidorm", lat: 38.54371, lng: -0.12049 },
    b: { nombre: "Altea", lat: 38.59836, lng: -0.05210 },
    regiones: ["Comunidad Valenciana"],
  },
  {
    modo: "coche",
    a: { nombre: "Valencia", lat: 39.45612, lng: -0.35457 },
    b: { nombre: "Castellón", lat: 39.99290, lng: -0.05768 },
    regiones: ["Comunidad Valenciana"],
  },
  {
    modo: "coche",
    a: { nombre: "Alicante", lat: 38.35323, lng: -0.48134 },
    b: { nombre: "Murcia", lat: 37.94399, lng: -1.16364 },
    regiones: ["Comunidad Valenciana", "Región de Murcia"], famosa: true,
  },
  {
    modo: "ave",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Valencia", lat: 39.45612, lng: -0.35457 },
    regiones: ["Comunidad Valenciana", "Comunidad de Madrid"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    b: { nombre: "Valencia", lat: 39.45612, lng: -0.35457 },
    regiones: ["Comunidad Valenciana", "Cataluña"],
  },

  // Extremadura
  {
    modo: "pie",
    a: { nombre: "el Teatro Romano", lat: 38.91531, lng: -6.33834 },
    b: { nombre: "el Puente Romano de Mérida", lat: 38.91328, lng: -6.35078 },
    regiones: ["Extremadura"],
  },
  {
    modo: "coche",
    a: { nombre: "Trujillo", lat: 39.53218, lng: -5.96142 },
    b: { nombre: "Cáceres", lat: 39.42823, lng: -6.43782 },
    regiones: ["Extremadura"],
  },
  {
    modo: "coche",
    a: { nombre: "Cáceres", lat: 39.42823, lng: -6.43782 },
    b: { nombre: "Mérida", lat: 38.97398, lng: -6.41296 },
    regiones: ["Extremadura"],
  },
  {
    modo: "coche",
    a: { nombre: "Badajoz", lat: 38.88676, lng: -6.96671 },
    b: { nombre: "Mérida", lat: 38.97398, lng: -6.41296 },
    regiones: ["Extremadura"],
  },
  {
    modo: "coche",
    a: { nombre: "Plasencia", lat: 40.01244, lng: -6.14341 },
    b: { nombre: "Cáceres", lat: 39.42823, lng: -6.43782 },
    regiones: ["Extremadura"],
  },
  {
    modo: "coche",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Badajoz", lat: 38.88676, lng: -6.96671 },
    regiones: ["Extremadura", "Comunidad de Madrid"],
  },

  // Galicia
  {
    modo: "pie",
    a: { nombre: "la Catedral de Santiago", lat: 42.88040, lng: -8.54463 },
    b: { nombre: "la Alameda", lat: 42.87787, lng: -8.54947 },
    regiones: ["Galicia"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "Vigo", lat: 42.20365, lng: -8.72296 },
    b: { nombre: "Pontevedra", lat: 42.42241, lng: -8.61925 },
    regiones: ["Galicia"],
  },
  {
    modo: "coche",
    a: { nombre: "A Coruña", lat: 43.37126, lng: -8.41880 },
    b: { nombre: "Santiago", lat: 42.88024, lng: -8.54736 },
    regiones: ["Galicia"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "A Coruña", lat: 43.37126, lng: -8.41880 },
    b: { nombre: "Lugo", lat: 43.00263, lng: -7.49944 },
    regiones: ["Galicia"],
  },
  {
    modo: "coche",
    a: { nombre: "Ourense", lat: 42.35088, lng: -7.90211 },
    b: { nombre: "Vigo", lat: 42.20365, lng: -8.72296 },
    regiones: ["Galicia"],
  },
  {
    modo: "coche",
    a: { nombre: "Finisterre", lat: 42.92240, lng: -9.26653 },
    b: { nombre: "Cabo de Creus", lat: 42.29068, lng: 3.28045 },
    regiones: ["Galicia", "Cataluña"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "A Coruña", lat: 43.37126, lng: -8.41880 },
    b: { nombre: "Cádiz", lat: 36.50088, lng: -6.26843 },
    regiones: ["Galicia", "Andalucía"],
  },

  // Comunidad de Madrid
  {
    modo: "pie",
    a: { nombre: "Sol", lat: 40.41686, lng: -3.70388 },
    b: { nombre: "la Plaza Mayor", lat: 40.41539, lng: -3.70700 },
    regiones: ["Comunidad de Madrid"], famosa: true,
  },
  {
    modo: "pie",
    a: { nombre: "Sol", lat: 40.41686, lng: -3.70388 },
    b: { nombre: "Cibeles", lat: 40.41942, lng: -3.69254 },
    regiones: ["Comunidad de Madrid"], famosa: true,
  },
  {
    modo: "pie",
    a: { nombre: "Sol", lat: 40.41686, lng: -3.70388 },
    b: { nombre: "el Bernabéu", lat: 40.45304, lng: -3.68820 },
    regiones: ["Comunidad de Madrid"], famosa: true,
  },
  {
    modo: "pie",
    a: { nombre: "Cibeles", lat: 40.41942, lng: -3.69254 },
    b: { nombre: "el Palacio de Cristal", lat: 40.41360, lng: -3.68206 },
    regiones: ["Comunidad de Madrid"],
  },
  {
    modo: "coche",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Getafe", lat: 40.29463, lng: -3.65978 },
    regiones: ["Comunidad de Madrid"],
  },
  {
    modo: "coche",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Alcalá de Henares", lat: 40.49940, lng: -3.34017 },
    regiones: ["Comunidad de Madrid"],
  },
  {
    modo: "ave",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Sevilla", lat: 37.39141, lng: -5.95918 },
    regiones: ["Comunidad de Madrid", "Andalucía"], famosa: true,
  },

  // Región de Murcia
  {
    modo: "pie",
    a: { nombre: "la Catedral de Murcia", lat: 37.98407, lng: -1.12864 },
    b: { nombre: "la Plaza de las Flores", lat: 37.98464, lng: -1.13313 },
    regiones: ["Región de Murcia"],
  },
  {
    modo: "coche",
    a: { nombre: "Murcia", lat: 37.94399, lng: -1.16364 },
    b: { nombre: "Molina de Segura", lat: 38.09564, lng: -1.19860 },
    regiones: ["Región de Murcia"],
  },
  {
    modo: "coche",
    a: { nombre: "Murcia", lat: 37.94399, lng: -1.16364 },
    b: { nombre: "Cartagena", lat: 37.60400, lng: -0.93397 },
    regiones: ["Región de Murcia"],
  },
  {
    modo: "coche",
    a: { nombre: "Cartagena", lat: 37.60400, lng: -0.93397 },
    b: { nombre: "La Manga", lat: 37.64592, lng: -0.71747 },
    regiones: ["Región de Murcia"],
  },
  {
    modo: "coche",
    a: { nombre: "Murcia", lat: 37.94399, lng: -1.16364 },
    b: { nombre: "Lorca", lat: 37.61909, lng: -1.70230 },
    regiones: ["Región de Murcia"],
  },

  // Navarra
  {
    modo: "pie",
    a: { nombre: "el encierro", lat: 42.81882, lng: -1.64517 },
    b: { nombre: "la Plaza de Toros", lat: 42.81591, lng: -1.63900 },
    regiones: ["Navarra"], famosa: true, frase: ["un encierro de San Fermín", "encierros de San Fermín"],
  },
  {
    modo: "coche",
    a: { nombre: "Pamplona", lat: 42.81276, lng: -1.64432 },
    b: { nombre: "Tudela", lat: 42.07440, lng: -1.63728 },
    regiones: ["Navarra"],
  },
  {
    modo: "coche",
    a: { nombre: "Pamplona", lat: 42.81276, lng: -1.64432 },
    b: { nombre: "Logroño", lat: 42.46712, lng: -2.44541 },
    regiones: ["Navarra", "La Rioja"],
  },
  {
    modo: "coche",
    a: { nombre: "Pamplona", lat: 42.81276, lng: -1.64432 },
    b: { nombre: "San Sebastián", lat: 43.29181, lng: -1.98851 },
    regiones: ["Navarra", "País Vasco"],
  },
  {
    modo: "coche",
    a: { nombre: "Pamplona", lat: 42.81276, lng: -1.64432 },
    b: { nombre: "Estella", lat: 42.66252, lng: -2.02519 },
    regiones: ["Navarra"],
  },

  // País Vasco
  {
    modo: "pie",
    a: { nombre: "el Guggenheim", lat: 43.26843, lng: -2.93406 },
    b: { nombre: "el Casco Viejo", lat: 43.25901, lng: -2.92269 },
    regiones: ["País Vasco"], famosa: true,
  },
  {
    modo: "pie",
    a: { nombre: "La Concha", lat: 43.31770, lng: -1.98637 },
    b: { nombre: "el Peine del Viento", lat: 43.32169, lng: -2.00555 },
    regiones: ["País Vasco"],
  },
  {
    modo: "coche",
    a: { nombre: "Bilbao", lat: 43.26035, lng: -2.93341 },
    b: { nombre: "Getxo", lat: 43.35553, lng: -3.01569 },
    regiones: ["País Vasco"],
  },
  {
    modo: "coche",
    a: { nombre: "Bilbao", lat: 43.26035, lng: -2.93341 },
    b: { nombre: "San Sebastián", lat: 43.29181, lng: -1.98851 },
    regiones: ["País Vasco"], famosa: true,
  },
  {
    modo: "coche",
    a: { nombre: "Bilbao", lat: 43.26035, lng: -2.93341 },
    b: { nombre: "Vitoria", lat: 42.84627, lng: -2.67225 },
    regiones: ["País Vasco"],
  },
  {
    modo: "coche",
    a: { nombre: "Irún", lat: 43.31864, lng: -1.77373 },
    b: { nombre: "Algeciras", lat: 36.10549, lng: -5.45284 },
    regiones: ["País Vasco", "Andalucía"], famosa: true,
  },

  // La Rioja
  {
    modo: "pie",
    a: { nombre: "la calle Laurel", lat: 42.46550, lng: -2.44916 },
    b: { nombre: "el Espolón", lat: 42.46471, lng: -2.44557 },
    regiones: ["La Rioja"],
  },
  {
    modo: "coche",
    a: { nombre: "Logroño", lat: 42.46712, lng: -2.44541 },
    b: { nombre: "Haro", lat: 42.58770, lng: -2.85585 },
    regiones: ["La Rioja"],
  },
  {
    modo: "coche",
    a: { nombre: "Logroño", lat: 42.46712, lng: -2.44541 },
    b: { nombre: "Calahorra", lat: 42.30787, lng: -1.95262 },
    regiones: ["La Rioja"],
  },
  {
    modo: "coche",
    a: { nombre: "Logroño", lat: 42.46712, lng: -2.44541 },
    b: { nombre: "Burgos", lat: 42.34997, lng: -3.68221 },
    regiones: ["La Rioja", "Castilla y León"],
  },

  // Ceuta
  {
    modo: "pie",
    a: { nombre: "la Plaza de África", lat: 35.88857, lng: -5.31666 },
    b: { nombre: "el Parque Marítimo", lat: 35.89004, lng: -5.30864 },
    regiones: ["Ceuta"],
  },
  {
    modo: "pie",
    a: { nombre: "la Plaza de África", lat: 35.88857, lng: -5.31666 },
    b: { nombre: "el Monte Hacho", lat: 35.89693, lng: -5.28674 },
    regiones: ["Ceuta"],
  },

  // Melilla
  {
    modo: "pie",
    a: { nombre: "Melilla la Vieja", lat: 35.29403, lng: -2.93359 },
    b: { nombre: "la Plaza de España", lat: 35.29219, lng: -2.93792 },
    regiones: ["Melilla"],
  },
  {
    modo: "ferry",
    a: { nombre: "Melilla", lat: 35.29187, lng: -2.94090 },
    b: { nombre: "Málaga", lat: 36.75854, lng: -4.39717 },
    regiones: ["Melilla", "Andalucía"],
  },
  {
    modo: "ferry",
    a: { nombre: "Melilla", lat: 35.29187, lng: -2.94090 },
    b: { nombre: "Almería", lat: 36.87557, lng: -2.34230 },
    regiones: ["Melilla", "Andalucía"],
  },
  {
    modo: "avion",
    a: { nombre: "Madrid", lat: 40.48935, lng: -3.68275 },
    b: { nombre: "Melilla", lat: 35.29187, lng: -2.94090 },
    regiones: ["Melilla", "Comunidad de Madrid"],
  },

  // Cataluña
  {
    modo: "coche",
    a: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    b: { nombre: "Sevilla", lat: 37.39141, lng: -5.95918 },
    regiones: ["Cataluña", "Andalucía"], famosa: true,
  },

  // País Vasco
  {
    modo: "coche",
    a: { nombre: "Bilbao", lat: 43.26035, lng: -2.93341 },
    b: { nombre: "Málaga", lat: 36.75854, lng: -4.39717 },
    regiones: ["País Vasco", "Andalucía"],
  },

  // Cataluña
  {
    modo: "coche",
    a: { nombre: "Barcelona", lat: 41.39942, lng: 2.12804 },
    b: { nombre: "Santiago", lat: 42.88024, lng: -8.54736 },
    regiones: ["Cataluña", "Galicia"],
  },];
