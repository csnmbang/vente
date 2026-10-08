import "server-only";
import { timingSafeEqual } from "node:crypto";

/** True only for the owner's ADMIN_KEY (constant-time comparison). */
export function claveValida(clave: unknown): boolean {
  const real = process.env.ADMIN_KEY;
  if (!real || typeof clave !== "string") return false;
  const a = Buffer.from(clave);
  const b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}
