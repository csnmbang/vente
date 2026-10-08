import Link from "next/link";
import { Suspense } from "react";
import { zonaDe } from "@/lib/chat";
import { quienSoy } from "@/lib/sesion";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-8 pt-10">
      <p className="text-sm font-bold uppercase tracking-widest text-rojo">
        Españoles por el mundo
      </p>
      <h1 className="mt-2 font-display text-6xl font-extrabold leading-[0.95]">
        Vente
        <br />
        <span className="text-rojo">pa&apos;cá</span>
      </h1>
      <p className="mt-5 text-lg leading-snug">
        Un mapa de los españoles que vivimos fuera. Mira quién hay en tu ciudad y ponte tú
        también.
      </p>

      {/* Depends on who's visiting, so it streams in after the static part. */}
      <Suspense fallback={<div className="mt-8 h-[17rem]" />}>
        <Entrada />
      </Suspense>

      <footer className="mt-auto pt-10 text-center text-sm text-gris">
        <Link href="/privacidad" className="underline">
          Privacidad
        </Link>
      </footer>
    </main>
  );
}

/** Members go straight to the map and chat; everyone else gets the test. */
async function Entrada() {
  const yo = await quienSoy();

  if (yo?.confirmed_at) {
    const zona = await zonaDe(yo);
    return (
      <div className="card mt-8 bg-white p-5">
        <p className="font-display text-xl font-bold">
          {yo.alias ? `Hola, ${yo.alias}. Ya estás dentro.` : "Ya estás dentro."}
        </p>
        <Link href="/mapa" className="btn btn-rojo mt-5 w-full">
          Ver el mapa
        </Link>
        {!yo.banned_at && (
          <Link href="/chat" className="btn btn-blanco mt-3 w-full">
            Chat de {zona.ciudad} y alrededores
          </Link>
        )}
      </div>
    );
  }

  if (yo) {
    return (
      <div className="card mt-8 bg-white p-5">
        <p className="font-display text-xl font-bold">Te falta confirmar tu correo</p>
        <p className="mt-1 text-gris">
          Pulsa el enlace que te mandamos a {yo.email} y se abren el mapa y el chat. Si no lo ves,
          revisa la carpeta de spam.
        </p>
        <Link href="/entrar" className="btn btn-blanco mt-5 w-full">
          Mandármelo otra vez
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="card mt-8 bg-white p-5">
        <p className="font-display text-xl font-bold">Primero, demuestra que eres de aquí</p>
        <p className="mt-1 text-gris">
          5 preguntas que solo sabe quien creció en España, con 5 segundos para cada una.
          Apruebas, dejas tu correo y el mapa es tuyo.
        </p>
        <Link href="/quiz" className="btn btn-rojo mt-5 w-full">
          Empezar el test
        </Link>
        <Link href="/entrar" className="mt-3 block text-center text-sm font-bold underline">
          Ya estoy apuntado
        </Link>
      </div>

      <Link href="/mapa" className="btn btn-blanco mt-4 w-full">
        Ver el mapa
      </Link>
    </>
  );
}
