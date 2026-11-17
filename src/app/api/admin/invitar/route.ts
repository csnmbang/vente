import { claveValida } from "@/lib/admin";
import { crearInvitacion } from "@/lib/invitacion";

/** Owner-only: make an entry link to copy and send by hand. */
export async function POST(req: Request) {
  const clave = new URL(req.url).searchParams.get("clave") ?? "";
  if (!claveValida(clave)) return new Response("Not found", { status: 404 });
  const { token } = await crearInvitacion();
  return Response.redirect(
    new URL(`/admin?clave=${encodeURIComponent(clave)}&invitacion=${encodeURIComponent(token)}`, req.url),
    303,
  );
}
