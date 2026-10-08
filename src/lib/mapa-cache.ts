import "server-only";
import { revalidateTag } from "next/cache";

/** Cache tag for the map counts (see /api/map). */
export const MAPA_TAG = "mapa";

/** Someone appeared or left: drop the cached counts so the next visit is fresh. */
export function refrescarMapa() {
  revalidateTag(MAPA_TAG, { expire: 0 });
}
