import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/quiz";

export const metadata: Metadata = { title: "Enlace caducado · Vente", robots: { index: false } };

/** Where an expired or broken entry link from /admin lands. */
export default function InvitacionCaducada() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-10 pt-10">
      <Link href="/" className="font-display text-xl font-extrabold text-rojo">
        Vente
      </Link>
      <div className="card mt-6 p-5">
        <h1 className="font-display text-2xl font-extrabold">Este enlace ha caducado</h1>
        <p className="mt-1 text-gris">
          Los enlaces de entrada duran 7 días. Escríbenos y te mandamos otro.
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-rojo mt-5 w-full">
          Escribir a {CONTACT_EMAIL}
        </a>
      </div>
    </main>
  );
}
