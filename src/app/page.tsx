import Link from "next/link";

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

      <div className="card mt-8 bg-white p-5">
        <p className="font-display text-xl font-bold">Primero, el test</p>
        <p className="mt-1 text-gris">
          10 preguntas sobre crecer en España, con 5 segundos para cada una. Con 8 aciertos
          puedes apuntarte al mapa.
        </p>
        <Link href="/quiz" className="btn btn-rojo mt-5 w-full">
          Empezar el test
        </Link>
      </div>

      <Link href="/mapa" className="btn btn-blanco mt-4 w-full">
        Ver el mapa
      </Link>

      <footer className="mt-auto pt-10 text-center text-sm text-gris">
        <Link href="/privacidad" className="underline">
          Privacidad
        </Link>
      </footer>
    </main>
  );
}
