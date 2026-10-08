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
        La comunidad de los españoles que vivimos fuera.
      </p>

      {/* Depends on who's visiting, so it streams in after the static part. */}
      <Suspense fallback={<div className="mt-6 h-[26rem]" />}>
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
      {/* What you get, before asking for anything. */}
      <ul className="mt-6 space-y-3 text-lg leading-snug">
        <li className="flex gap-3">
          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rojo" />
          Mira dónde viven los españoles de tu ciudad.
        </li>
        <li className="flex gap-3">
          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rojo" />
          Habla con los de tu zona en el chat.
        </li>
        <li className="flex gap-3">
          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rojo" />
          Encuentra a gente de tu provincia y de tu pueblo.
        </li>
      </ul>

      <div className="card mt-8 bg-white p-5">
        <p className="font-display text-xl font-bold">¿Eres de aquí de verdad?</p>
        <p className="mt-1 text-gris">
          Para que solo entren españoles, primero 5 preguntas rápidas. Tardas 25 segundos.
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
