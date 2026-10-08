import { z } from "zod";
import { CHAT, estadoChat, publico, tieneEnlace, zonaDe } from "@/lib/chat";
import { fail, json } from "@/lib/request";
import { store } from "@/lib/store";

/** GET ?after=ID: your city's chat (only new messages when `after` is given). */
export async function GET(req: Request) {
  const { estado, yo } = await estadoChat();
  if (estado !== "ok" || !yo) return json({ estado });
  const after = Number(new URL(req.url).searchParams.get("after")) || null;
  const zona = await zonaDe(yo);
  const mensajes = await store().chatMessages(zona.ids, after, CHAT.history);
  return json({
    estado,
    ciudad: zona.ciudad,
    alias: yo.alias,
    mensajes: mensajes.map((m) => publico(m, yo, zona)),
  });
}

const Body = z.object({ texto: z.string().trim().min(1).max(CHAT.maxLength) });

export async function POST(req: Request) {
  const { estado, yo } = await estadoChat();
  if (estado !== "ok" || !yo) return fail("No puedes escribir en el chat.", 403);

  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail(`El mensaje tiene que tener entre 1 y ${CHAT.maxLength} caracteres.`);
  if (tieneEnlace(body.data.texto)) return fail("Por ahora no se pueden mandar enlaces.");

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  if ((await store().countMessagesSince(yo.id, since)) >= CHAT.perDay) {
    return fail(`Has llegado al límite de ${CHAT.perDay} mensajes por día. Vuelve mañana.`, 429);
  }

  await store().addMessage(yo.city_id, yo.id, body.data.texto);
  return json({ ok: true });
}
