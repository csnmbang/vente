import "server-only";

/**
 * Vente quiz questions. EDIT FREELY.
 *
 * The aim: a Spaniard answers in under 5 seconds without thinking; someone
 * who didn't grow up in Spain needs to look it up.
 *
 * Rules:
 * - `id` must be unique and should never change once live (results pages
 *   refer to questions by id). To retire a question, delete it.
 * - 2–4 `options`. `answer` is the exact text of the correct option.
 *   Option order is shuffled for each player, so write them in any order.
 * - Keep questions short: people have 5 seconds on a phone.
 *
 * This file is server-only: the answers never reach the browser.
 */

export type Question = {
  id: string;
  category: "comida" | "cole" | "tele" | "refranes" | "tradiciones";
  question: string;
  options: string[];
  answer: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "mas-cuento-que",
    category: "refranes",
    question: "Tienes más cuento que…",
    options: ["Calleja", "Cervantes", "Pinocho", "Lola Flores"],
    answer: "Calleja",
  },
  {
    id: "cuadernos-verano",
    category: "cole",
    question: "Los cuadernillos de cuentas y caligrafía del verano eran los…",
    options: ["Rubio", "Anaya", "Santillana", "Milan"],
    answer: "Rubio",
  },
  {
    id: "bocata-calamares",
    category: "comida",
    question: "El bocata de calamares es típico de…",
    options: ["Madrid", "Sevilla", "Bilbao", "Valencia"],
    answer: "Madrid",
  },
  {
    id: "quien-madruga",
    category: "refranes",
    question: "A quien madruga…",
    options: ["Dios le ayuda", "le dan pan", "se le hace tarde", "no le pilla el toro"],
    answer: "Dios le ayuda",
  },
  {
    id: "mas-chulo-que",
    category: "refranes",
    question: "Más chulo que un…",
    options: ["Ocho", "Siete", "Cuatro", "Pino"],
    answer: "Ocho",
  },
  {
    id: "estar-en-babia",
    category: "refranes",
    question: "Si «estás en Babia», estás…",
    options: ["Despistado", "De vacaciones", "Sin un duro", "De resaca"],
    answer: "Despistado",
  },
  {
    id: "san-ildefonso",
    category: "tradiciones",
    question: "Los niños de San Ildefonso cantan…",
    options: [
      "Los números de la Lotería de Navidad",
      "Villancicos en Nochebuena",
      "El himno en la Moncloa",
      "Las campanadas",
    ],
    answer: "Los números de la Lotería de Navidad",
  },
  {
    id: "saber-y-ganar",
    category: "tele",
    question: "¿Quién lleva media vida presentando «Saber y ganar»?",
    options: ["Jordi Hurtado", "Carlos Sobera", "Matías Prats", "Arturo Valls"],
    answer: "Jordi Hurtado",
  },
  {
    id: "no-hay-mal",
    category: "refranes",
    question: "No hay mal que por bien…",
    options: ["no venga", "no se vaya", "no llegue", "no acabe"],
    answer: "no venga",
  },
  {
    id: "ponerse-las-botas",
    category: "refranes",
    question: "«Ponerse las botas» es…",
    options: [
      "Comer muchísimo",
      "Irse de excursión",
      "Ponerse a currar",
      "Enfadarse",
    ],
    answer: "Comer muchísimo",
  },
  {
    id: "campanadas-sol",
    category: "tradiciones",
    question: "Las campanadas de la tele salen desde…",
    options: ["La Puerta del Sol", "La Plaza Mayor", "Cibeles", "La Plaza de España"],
    answer: "La Puerta del Sol",
  },
  {
    id: "hacer-novillos",
    category: "cole",
    question: "«Hacer novillos» es…",
    options: ["Faltar a clase", "Ir a los toros", "Hacer los deberes", "Ligar"],
    answer: "Faltar a clase",
  },
  {
    id: "simpson-hora",
    category: "tele",
    question: "¿A qué hora ponían Los Simpson en Antena 3?",
    options: ["A las 12h", "A las 13h", "A las 14h", "A las 15h"],
    answer: "A las 14h",
  },
  {
    id: "kojak",
    category: "comida",
    question: "Un Kojak era…",
    options: ["Un chupa-chups con chicle dentro", "Un helado de palo", "Un chicle de fresa", "Un bollo de chocolate"],
    answer: "Un chupa-chups con chicle dentro",
  },
  {
    id: "fistro-pecador",
    category: "tele",
    question: "«¡Fistro pecador de la pradera!» lo decía…",
    options: ["Chiquito de la Calzada", "Martes y Trece", "Paco Martínez Soria", "Los Morancos"],
    answer: "Chiquito de la Calzada",
  },
  {
    id: "quinto-pino",
    category: "refranes",
    question: "Estar en el quinto pino es estar…",
    options: ["Muy lejos", "Muy borracho", "En el monte", "En las nubes"],
    answer: "Muy lejos",
  },
  {
    id: "montepinar",
    category: "tele",
    question: "La urbanización de «La que se avecina» es…",
    options: ["Mirador de Montepinar", "Desengaño 21", "Los Robles", "Santa Justa"],
    answer: "Mirador de Montepinar",
  },
  {
    id: "tuenti",
    category: "tele",
    question: "Antes de Instagram, estábamos todos en…",
    options: ["Tuenti", "Hi5", "Myspace", "Facebook"],
    answer: "Tuenti",
  },
  {
    id: "gol-mundial-2010",
    category: "tradiciones",
    question: "¿Quién marcó el gol de la final del Mundial 2010?",
    options: ["Iniesta", "Villa", "Torres", "Xavi"],
    answer: "Iniesta",
  },
  {
    id: "hacendado",
    category: "comida",
    question: "La marca blanca de Mercadona es…",
    options: ["Hacendado", "Milbona", "Aliada", "Carrefour Classic"],
    answer: "Hacendado",
  },
  {
    id: "despues-de-sexto",
    category: "cole",
    question: "Después de 6º de primaria empezabas…",
    options: ["1º de la ESO", "1º de bachillerato", "7º de EGB", "7º de primaria"],
    answer: "1º de la ESO",
  },
];

// Fail fast on a bad edit (runs once when the server loads this file).
const seen = new Set<string>();
for (const q of QUESTIONS) {
  if (seen.has(q.id)) throw new Error(`Pregunta repetida: ${q.id}`);
  seen.add(q.id);
  if (q.options.length < 2 || q.options.length > 4)
    throw new Error(`La pregunta ${q.id} necesita entre 2 y 4 opciones`);
  if (!q.options.includes(q.answer))
    throw new Error(`La respuesta de ${q.id} no está entre las opciones`);
}

export const QUESTIONS_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
