import "server-only";
import { hashEmail } from "./crypto";
import { clientIpHash } from "./request";
import { store } from "./store";

/** Emails a connection can trigger per day from the "send me a link" forms. */
const POR_CONEXION = 5;
/** Emails one address can receive per day from those forms (no inbox flooding). */
const POR_CORREO = 3;

/**
 * Checks and records one email from "Ya estoy apuntado" or "Borrar mis datos".
 * Returns false when over the limit. Counts every request, whether or not the
 * address is on Vente, so the limit doesn't reveal who's signed up.
 */
export async function puedeMandarCorreo(email: string): Promise<boolean> {
  const ipHash = await clientIpHash();
  const emailHash = hashEmail(email);
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  try {
    const [porIp, porCorreo] = await Promise.all([
      store().countEmailSends({ ipHash }, since),
      store().countEmailSends({ emailHash }, since),
    ]);
    if (porIp >= POR_CONEXION || porCorreo >= POR_CORREO) return false;
    await store().recordEmailSend(ipHash, emailHash);
  } catch (e) {
    // If the limits table is missing (migration 0004 not run), don't block people.
    console.error("Límite de correos no disponible:", e);
  }
  return true;
}
