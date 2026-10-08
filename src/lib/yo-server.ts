import "server-only";
import { cookies } from "next/headers";
import { iniciarSesion } from "./sesion";
import { store, type Signup } from "./store";
import { origen, YO_COOKIE, YO_MAX_AGE, type Yo } from "./yo";

/** Remember on this device that this person is on Vente (city, province, confirmed or not). */
export async function recordarApuntado(signup: Signup, confirmado: boolean) {
  await iniciarSesion(signup.id);
  const [city, hometown] = await Promise.all([store().getPlace(signup.city_id), store().getPlace(signup.hometown_id)]);
  if (!city) return;
  const yo: Yo = {
    ciudad: city.name, lat: city.lat, lng: city.lng, ...origen(hometown?.admin2_name),
    apuntado: true, confirmado,
  };
  (await cookies()).set(YO_COOKIE, JSON.stringify(yo), {
    path: "/", maxAge: YO_MAX_AGE, sameSite: "lax", secure: process.env.NODE_ENV === "production",
  });
}
