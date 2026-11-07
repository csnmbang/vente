import type { Metadata } from "next";
import { connection } from "next/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DEMO, EMAIL_ENABLED, QUIZ } from "@/lib/config";
import { verify } from "@/lib/crypto";
import { chancesUsed, CONTACT_EMAIL, esInvitacion, PASS_COOKIE, questionText, QUIZ_COOKIE } from "@/lib/quiz";
import { store } from "@/lib/store";
import { verdict } from "@/lib/verdict";
import ShareButton from "./ShareButton";
import SignupForm from "./SignupForm";

const UUID = /^[0-9a-f-]{36}$/i;

export async function generateMetadata({
  params,
}: PageProps<"/resultado/[id]">): Promise<Metadata> {
  const { id } = await params;
  const attempt = UUID.test(id) ? await store().getAttempt(id) : null;
  if (!attempt || attempt.status === "in_progress" || esInvitacion(attempt)) return { title: "Vente" };
  const title = `He sacado ${attempt.correct_count}/${attempt.question_ids.length} en Vente`;
  return {
    title,
    description: "Haz el test y ponte en el mapa de los españoles por el mundo.",
    openGraph: { title, description: "Haz el test y ponte en el mapa de los españoles por el mundo." },
  };
}

export default function ResultPage({ params }: PageProps<"/resultado/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-5">
      <Suspense fallback={<div className="card h-[26rem] animate-pulse bg-rojo/40" />}>
        <Result params={params} />
      </Suspense>
    </main>
  );
}

async function Result({ params }: { params: Promise<{ id: string }> }) {
  await connection(); // per-request: reads cookies and checks token expiry
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const attempt = await store().getAttempt(id);
  if (!attempt || attempt.status === "in_progress") notFound();

  const jar = await cookies();
  const isOwner = verify<{ id: string }>(jar.get(QUIZ_COOKIE)?.value, "quiz")?.id === id;
  const pass = verify<{ id: string }>(jar.get(PASS_COOKIE)?.value, "pass");
  const canSignUp = isOwner && attempt.status === "passed" && !attempt.signup_used && pass?.id === id;

  // Entry link from /admin: no score to show, only the sign-up.
  if (esInvitacion(attempt)) {
    if (!isOwner) notFound();
    return (
      <>
        <p className="font-display text-xl font-extrabold text-rojo">Vente</p>
        {canSignUp ? (
          <section className="card mt-6 p-5">
            <h1 className="font-display text-2xl font-extrabold">Te damos la bienvenida</h1>
            <p className="mt-1 text-gris">
              Escribe tu correo para ver el mapa y aparecer en él. Guardamos tu correo, tu ciudad, tu zona de código postal si la pones y tu pueblo.
              Nunca tu dirección.
            </p>
            <SignupForm emailEnabled={EMAIL_ENABLED} demo={DEMO} />
          </section>
        ) : (
          <p className="mt-6 rounded-xl bg-amarillo p-4 font-bold">
            {attempt.signup_used
              ? "Ya te apuntaste con este enlace."
              : "Han pasado más de 30 minutos. Vuelve a abrir el enlace que te mandamos."}
          </p>
        )}
        <Link href="/mapa" className="btn btn-blanco mt-4 w-full">
          Ver el mapa
        </Link>
      </>
    );
  }

  const score = attempt.correct_count;
  const total = attempt.question_ids.length;
  const v = verdict(score, total);
  const missed = attempt.question_ids.filter((_, i) => !attempt.results[i]);
  const quedan = isOwner && attempt.status === "failed" ? Math.max(0, QUIZ.maxChances - (await chancesUsed())) : 0;

  return (
    <>
      {/* The bit people screenshot. */}
      <section className="card relative overflow-hidden bg-rojo p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amarillo opacity-90" />
        <p className="relative font-display text-xl font-extrabold">Vente</p>
        <p className="relative mt-8 text-lg font-bold">He sacado</p>
        <p className="relative font-display text-[7.5rem] font-extrabold leading-none tracking-tight">
          {score}
          <span className="text-5xl opacity-80">/{total}</span>
        </p>
        <p className="relative mt-2 text-2xl font-extrabold leading-tight">{v}</p>
        <div className="relative mt-8 flex items-end justify-between">
          <p className="font-display text-2xl font-extrabold text-amarillo">Vente pa&apos;cá</p>
          <p className="text-sm font-bold opacity-90">vengavente.com</p>
        </div>
      </section>

      <ShareButton score={score} total={total} />

      {isOwner && missed.length > 0 && (
        <section className="mt-6">
          <h2 className="font-display text-xl font-extrabold">
            Preguntas falladas ({missed.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {missed.map((qid) => (
              <li key={qid} className="rounded-xl border-2 border-tinta bg-white px-4 py-3">
                {questionText(qid)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {canSignUp && (
        <section className="card mt-8 p-5">
          <h2 className="font-display text-2xl font-extrabold">Aprobado. Desbloquea el mapa</h2>
          <p className="mt-1 text-gris">
            Escribe tu correo para ver el mapa siempre y aparecer en él. Guardamos tu correo, tu ciudad, tu zona de código postal si la pones y tu pueblo.
            Nunca tu dirección.
          </p>
          <SignupForm emailEnabled={EMAIL_ENABLED} demo={DEMO} />
        </section>
      )}

      {isOwner && attempt.status === "passed" && !canSignUp && (
        <p className="mt-8 rounded-xl bg-amarillo p-4 font-bold">
          {attempt.signup_used
            ? "Ya te apuntaste con este test."
            : "Han pasado más de 30 minutos desde el test. Repítelo para apuntarte."}
        </p>
      )}

      {isOwner && attempt.status === "failed" && (
        <div className="card mt-8 p-5">
          <p className="font-bold">
            Necesitas {QUIZ.passMark} de {QUIZ.questions} aciertos para apuntarte.{" "}
            {quedan > 0
              ? `Te queda ${quedan} ${quedan === 1 ? "intento" : "intentos"}.`
              : "Ya has usado tus intentos. Si eres de aquí y crees que es un error, escríbenos."}
          </p>
          {quedan > 0 ? (
            <Link href="/quiz" className="btn btn-rojo mt-4 w-full">
              Repetir el test
            </Link>
          ) : (
            <a href={`mailto:${CONTACT_EMAIL}?subject=Vente%3A%20el%20test`} className="btn btn-rojo mt-4 w-full">
              Escribir a {CONTACT_EMAIL}
            </a>
          )}
        </div>
      )}

      {!isOwner && (
        <Link href="/quiz" className="btn btn-rojo mt-6 w-full">
          Hacer el test
        </Link>
      )}

      <Link href="/mapa" className="btn btn-blanco mt-4 w-full">
        Ver el mapa
      </Link>
    </>
  );
}
