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
    id: "nochevieja-uvas",
    category: "tradiciones",
    question: "En Nochevieja, con cada campanada te comes…",
    options: ["Una uva", "Una aceituna", "Una almendra", "Una gamba"],
    answer: "Una uva",
  },
  {
    id: "mas-cuento-que",
    category: "refranes",
    question: "Tienes más cuento que…",
    options: ["Calleja", "Cervantes", "Pinocho", "Lola Flores"],
    answer: "Calleja",
  },
  {
    id: "regalos-6-enero",
    category: "tradiciones",
    question: "¿Quién trae los regalos la noche del 5 al 6 de enero?",
    options: ["Los Reyes Magos", "Papá Noel", "La Befana", "El Ratoncito Pérez"],
    answer: "Los Reyes Magos",
  },
  {
    id: "cuadernos-verano",
    category: "cole",
    question: "Los cuadernillos de cuentas y caligrafía del verano eran los…",
    options: ["Rubio", "Anaya", "Santillana", "Milan"],
    answer: "Rubio",
  },
  {
    id: "vamos-a-la-cama",
    category: "tele",
    question: "«Vamos a la cama, que hay que descansar…» lo cantaba…",
    options: ["La familia Telerín", "Barrio Sésamo", "Los Fruittis", "Doraemon"],
    answer: "La familia Telerín",
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
    id: "la-seno",
    category: "cole",
    question: "En el cole, «la seño» era…",
    options: ["La profesora", "La directora", "La conserje", "La del comedor"],
    answer: "La profesora",
  },
  {
    id: "saber-y-ganar",
    category: "tele",
    question: "¿Quién lleva media vida presentando «Saber y ganar»?",
    options: ["Jordi Hurtado", "Carlos Sobera", "Matías Prats", "Arturo Valls"],
    answer: "Jordi Hurtado",
  },
  {
    id: "ruperta",
    category: "tele",
    question: "En el «Un, dos, tres», la Ruperta era…",
    options: ["Una calabaza", "Un pato", "Una vaca", "Un dragón"],
    answer: "Una calabaza",
  },
  {
    id: "calimocho",
    category: "comida",
    question: "Un calimocho es…",
    options: [
      "Vino tinto con cola",
      "Vino con gaseosa",
      "Cerveza con limón",
      "Sidra con zumo",
    ],
    answer: "Vino tinto con cola",
  },
  {
    id: "una-de-bravas",
    category: "comida",
    question: "Si pides «una de bravas», te traen…",
    options: ["Patatas", "Gambas", "Croquetas", "Alitas"],
    answer: "Patatas",
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
    id: "espinete",
    category: "tele",
    question: "Espinete, de «Barrio Sésamo», era…",
    options: ["Un erizo", "Un oso", "Un topo", "Un perro"],
    answer: "Un erizo",
  },
  {
    id: "hacer-novillos",
    category: "cole",
    question: "«Hacer novillos» es…",
    options: ["Faltar a clase", "Ir a los toros", "Hacer los deberes", "Ligar"],
    answer: "Faltar a clase",
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
