import { z } from "zod";
import { quienSoy } from "@/lib/sesion";
import { fail, json } from "@/lib/request";
import { store } from "@/lib/store";

// Letters (with accents), numbers, spaces, dots, dashes and underscores.
const Body = z.object({ alias: z.string().trim().min(2).max(24).regex(/^[\p{L}\p{N} ._-]+$/u) });

export async function POST(req: Request) {
  const yo = await quienSoy();
  if (!yo?.confirmed_at || yo.banned_at) return fail("No puedes entrar en el chat.", 403);
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail("Usa entre 2 y 24 letras o números.");
  await store().setAlias(yo.id, body.data.alias);
  return json({ ok: true });
}
