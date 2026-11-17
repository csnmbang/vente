import "server-only";
import { config } from "./config";
import { sign } from "./crypto";
import { INVITE_DAYS } from "./quiz";
import { store } from "./store";

/**
 * A one-person entry link that skips the test. It's a passed attempt with no
 * questions, so the normal sign-up (one per passed attempt) does the rest.
 */
export async function crearInvitacion(): Promise<{ token: string; link: string }> {
  const now = new Date().toISOString();
  const attempt = await store().createAttempt({
    ip_hash: null,
    question_ids: [],
    option_orders: [],
    current_served_at: now,
  });
  await store().advanceAttempt(attempt.id, 0, { status: "passed", finished_at: now });
  const token = sign({ kind: "invite", id: attempt.id }, INVITE_DAYS * 24 * 3600);
  return { token, link: `${config.siteUrl}/api/invitacion?token=${encodeURIComponent(token)}` };
}
