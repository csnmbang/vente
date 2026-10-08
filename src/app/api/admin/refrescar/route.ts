import { claveValida } from "@/lib/admin";
import { refrescarMapa } from "@/lib/mapa-cache";

/** Owner-only: drop the cached map counts (e.g. after editing rows in Supabase by hand). */
export async function POST(req: Request) {
  const clave = new URL(req.url).searchParams.get("clave") ?? "";
  if (!claveValida(clave)) return new Response("Not found", { status: 404 });
  refrescarMapa();
  return Response.redirect(new URL(`/admin?clave=${encodeURIComponent(clave)}&ok=1`, req.url), 303);
}
