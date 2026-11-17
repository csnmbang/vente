import { claveValida } from "@/lib/admin";
import { EMAIL_ENABLED } from "@/lib/config";
import { invitacionEmail, sendEmail } from "@/lib/email";
import { crearInvitacion } from "@/lib/invitacion";
import { store } from "@/lib/store";

/** Owner-only: email an entry link to someone who asked, or dismiss the request. */
export async function POST(req: Request) {
  const clave = new URL(req.url).searchParams.get("clave") ?? "";
  if (!claveValida(clave)) return new Response("Not found", { status: 404 });
  const form = await req.formData();
  const id = String(form.get("id"));
  const back = `/admin?clave=${encodeURIComponent(clave)}`;

  if (form.get("accion") === "descartar") {
    await store().deleteSolicitud({ id });
    return Response.redirect(new URL(back, req.url), 303);
  }

  const s = await store().getSolicitud(id);
  if (!s) return Response.redirect(new URL(back, req.url), 303);
  const { token, link } = await crearInvitacion();
  // Without email (local dev), show the link in the box so it can be tried.
  if (!EMAIL_ENABLED) {
    return Response.redirect(new URL(`${back}&invitacion=${encodeURIComponent(token)}`, req.url), 303);
  }
  const m = invitacionEmail(link);
  await sendEmail(s.email, m.subject, m.html, m.text);
  await store().markSolicitudSent(id);
  return Response.redirect(new URL(`${back}&enviado=1`, req.url), 303);
}
