import "server-only";

/** True when running locally without Supabase: data lives in memory. */
export const DEMO = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;

if (DEMO && process.env.VERCEL_ENV === "production") {
  throw new Error("Faltan las claves de Supabase en producción");
}

export const config = {
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  appSecret:
    process.env.APP_SECRET ||
    (DEMO ? "demo-secret-only-for-local-dev" : missing("APP_SECRET")),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  resendKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Vente <hola@vengavente.com>",
};

/** Confirmation and deletion emails are only sent when Resend is set up. */
export const EMAIL_ENABLED = Boolean(config.resendKey);

export const QUIZ = {
  questions: 5,
  seconds: 5,
  graceMs: 2000, // network slack on mobile + the short feedback flash
  passMark: 4, // out of `questions`
  /** Tries that didn't pass (failed or abandoned). After this, people write to us. */
  maxChances: 2,
} as const;

export const SIGNUPS_PER_IP_PER_DAY = 3;

function missing(name: string): never {
  throw new Error(`Falta la variable de entorno ${name}`);
}
