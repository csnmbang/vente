import { z } from "zod";
import { QUIZ } from "@/lib/config";
import { puedeMandarCorreo } from "@/lib/limite-correos";
import { chancesUsed } from "@/lib/quiz";
import { fail, json } from "@/lib/request";
import { store } from "@/lib/store";

const Body = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

/** "No me ha salido": someone with no tries left leaves an email to get an entry link. */
export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return fail("Revisa el correo.");
  if ((await chancesUsed()) < QUIZ.maxChances) return fail("Todavía te quedan intentos.", 403);
  if (!(await puedeMandarCorreo(body.data.email))) {
    return fail("Lo has pedido demasiadas veces hoy. Inténtalo mañana.", 429);
  }
  await store().addSolicitud(body.data.email);
  return json({ ok: true });
}
