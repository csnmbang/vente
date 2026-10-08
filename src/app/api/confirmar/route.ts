import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { verify } from "@/lib/crypto";
import { unlockMap } from "@/lib/quiz";
import { store } from "@/lib/store";

/** The link in the confirmation email lands here. */
export async function GET(req: NextRequest) {
  const token = verify<{ id: string }>(req.nextUrl.searchParams.get("token") ?? undefined, "confirm");
  if (!token) redirect("/mapa?confirmacion=caducada");
  const signup = await store().getSignup(token.id);
  if (!signup) redirect("/mapa?confirmacion=caducada");
  await store().confirmSignup(signup.id);
  await unlockMap(); // in case they open the email on another device
  redirect("/mapa?bienvenida=1");
}
