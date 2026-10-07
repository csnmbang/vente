import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "./config";

const hmac = (data: string) =>
  createHmac("sha256", config.appSecret).update(data).digest("base64url");

/** One-way hash of an IP so we can rate-limit without storing the IP. */
export const hashIp = (ip: string) => hmac(`ip:${ip}`);

/** Signed, expiring token: `<payload>.<signature>`, URL-safe. */
export function sign(payload: Record<string, unknown>, ttlSeconds: number): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }),
  ).toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function verify<T extends Record<string, unknown>>(
  token: string | undefined,
  kind: string,
): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(hmac(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (data.kind !== kind || typeof data.exp !== "number") return null;
    if (data.exp < Date.now() / 1000) return null;
    return data as T;
  } catch {
    return null;
  }
}
