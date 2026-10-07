import "server-only";
import { headers } from "next/headers";
import { hashIp } from "./crypto";

/** Hashed client IP (Vercel sets x-forwarded-for). Never stored raw. */
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return hashIp(ip);
}

export const json = (data: unknown, status = 200) => Response.json(data, { status });

export const fail = (message: string, status = 400) => json({ error: message }, status);
