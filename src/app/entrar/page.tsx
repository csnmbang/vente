import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import EntrarForm from "./EntrarForm";

export const metadata: Metadata = { title: "Ya estoy apuntado · Vente" };

export default function EntrarPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-10 pt-6">
      <Link href="/" className="font-display text-xl font-extrabold text-rojo">
        Vente
      </Link>
      <div className="card mt-6 p-6">
        <h1 className="font-display text-3xl font-extrabold leading-tight">Ya estoy apuntado</h1>
        <p className="mt-2">
          Escribe el correo con el que te apuntaste y te mandamos un enlace para ver el mapa en
          este móvil. Sin repetir el test.
        </p>
        <Suspense>
          <EntrarForm />
        </Suspense>
      </div>
    </main>
  );
}
