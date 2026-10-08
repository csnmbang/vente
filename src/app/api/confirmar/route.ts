import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { verify } from "@/lib/crypto";
import { refrescarMapa } from "@/lib/mapa-cache";
import { unlockMap } from "@/lib/quiz";
import { store } from "@/lib/store";
import { recordarApuntado } from "@/lib/yo-server";

/** The link in the confirmation email lands here. */
export async function GET(req: NextRequest) {
  const token = verify<{ id: string }>(req.nextUrl.searchParams.get("token") ?? undefined, "confirm");
  if (!token) redirect("/mapa?confirmacion=caducada");
  const signup = await store().getSignup(token.id);
  if (!signup) redirect("/mapa?confirmacion=caducada");
  await store().confirmSignup(signup.id);
  refrescarMapa();
  await unlockMap(); // in case they open the email on another device
  await recordarApuntado(signup, true);
  redirect("/mapa?bienvenida=1");
}
