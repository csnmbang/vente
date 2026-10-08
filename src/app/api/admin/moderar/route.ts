import { claveValida } from "@/lib/admin";
import { store } from "@/lib/store";

/** Owner-only: hide a reported message, or ban its author from the chat. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const clave = url.searchParams.get("clave") ?? "";
  if (!claveValida(clave)) return new Response("Not found", { status: 404 });
  const form = await req.formData();
  const accion = form.get("accion");
  if (accion === "ocultar") await store().hideMessage(Number(form.get("id")));
  if (accion === "expulsar") {
    await store().banSignup(String(form.get("autor")));
    await store().hideMessage(Number(form.get("id")));
  }
  return Response.redirect(new URL(`/admin?clave=${encodeURIComponent(clave)}`, req.url), 303);
}
