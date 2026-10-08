import { z } from "zod";
import { estadoChat } from "@/lib/chat";
import { fail, json } from "@/lib/request";
import { store } from "@/lib/store";

const Body = z.object({ id: z.number().int().positive() });

/** Report a message. The owner reviews reports on /admin. */
export async function POST(req: Request) {
  const { estado, yo } = await estadoChat();
  if (estado !== "ok" || !yo) return fail("No puedes reportar.", 403);
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail("Mensaje no válido.");
  await store().reportMessage(body.data.id, yo.id);
  return json({ ok: true });
}
