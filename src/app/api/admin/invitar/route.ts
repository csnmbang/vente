import { claveValida } from "@/lib/admin";
import { sign } from "@/lib/crypto";
import { INVITE_DAYS } from "@/lib/quiz";
import { store } from "@/lib/store";

/**
 * Owner-only: make a one-person entry link for someone who wrote in after
 * failing the test. It's a passed attempt with no questions, so the normal
 * sign-up (one per passed attempt) does the rest.
 */
export async function POST(req: Request) {
  const clave = new URL(req.url).searchParams.get("clave") ?? "";
  if (!claveValida(clave)) return new Response("Not found", { status: 404 });

  const now = new Date().toISOString();
  const attempt = await store().createAttempt({
    ip_hash: null,
    question_ids: [],
    option_orders: [],
    current_served_at: now,
  });
  await store().advanceAttempt(attempt.id, 0, { status: "passed", finished_at: now });

  const token = sign({ kind: "invite", id: attempt.id }, INVITE_DAYS * 24 * 3600);
  return Response.redirect(
    new URL(`/admin?clave=${encodeURIComponent(clave)}&invitacion=${encodeURIComponent(token)}`, req.url),
    303,
  );
}
