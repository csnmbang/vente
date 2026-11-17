"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Question = {
  index: number;
  total: number;
  seconds: number;
  text: string;
  options: string[];
};

type Phase =
  | { kind: "intro" }
  // One untimed-scoring warm-up so the first real try isn't spent learning the format.
  | { kind: "practice"; picked: number | null; done: boolean }
  | { kind: "question"; q: Question }
  // Tapped, waiting for the server: show the choice straight away.
  | { kind: "checking"; q: Question; picked: number | null }
  | { kind: "feedback"; q: Question; picked: number | null; correct: boolean }
  | { kind: "error"; message: string; contacto?: boolean };

const FEEDBACK_MS = 400;

// Answered in the browser on purpose: it doesn't count and isn't secret.
const PRACTICE = { text: "¿Cuál es la capital de España?", options: ["Sevilla", "Madrid", "Bilbao", "Zaragoza"], answer: 1 };

export default function Quiz({ passMark, seconds }: { passMark: number; seconds: number }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const sending = useRef(false);

  async function start() {
    setLoading(true);
    const res = await fetch("/api/quiz/start", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    // 429 = no tries left: offer to write to us.
    if (!res.ok) return setPhase({ kind: "error", message: data.error, contacto: res.status === 429 });
    setScore(0);
    setPhase({ kind: "question", q: data.question });
  }

  // Stable, so the practice timer doesn't restart on re-renders.
  const pickPractice = useCallback(
    (picked: number | null) => setPhase({ kind: "practice", picked, done: true }),
    [],
  );

  const answer = useCallback(
    async (q: Question, choice: number | null) => {
      if (sending.current) return;
      sending.current = true;
      setPhase({ kind: "checking", q, picked: choice });
      try {
        const res = await fetch("/api/quiz/answer", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ index: q.index, choice }),
        });
        const data = await res.json();
        if (!res.ok) return setPhase({ kind: "error", message: data.error });

        if (data.correct) setScore((s) => s + 1);
        navigator.vibrate?.(data.correct ? 30 : [60, 40, 60]);
        setPhase({ kind: "feedback", q, picked: choice, correct: data.correct });
        await new Promise((r) => setTimeout(r, FEEDBACK_MS));

        if (data.done) router.push(`/resultado/${data.resultId}`);
        else setPhase({ kind: "question", q: data.next });
      } catch {
        setPhase({ kind: "error", message: "Se ha perdido la conexión. Vuelve a intentarlo." });
      } finally {
        sending.current = false;
      }
    },
    [router],
  );

  if (phase.kind === "intro") {
    return (
      <div className="card p-6">
        <h1 className="font-display text-3xl font-extrabold">El test</h1>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-lg">
          <li>5 preguntas, {seconds} segundos cada una.</li>
          <li>Necesitas {passMark} aciertos para apuntarte al mapa.</li>
          <li>Si se acaba el tiempo, cuenta como fallo.</li>
          <li>Tienes 2 intentos.</li>
        </ul>
        <button
          onClick={() => setPhase({ kind: "practice", picked: null, done: false })}
          className="btn btn-rojo mt-6 w-full"
        >
          Empezar
        </button>
      </div>
    );
  }

  if (phase.kind === "practice") {
    return (
      <Practice
        seconds={seconds}
        phase={phase}
        onPick={pickPractice}
        onStart={start}
        loading={loading}
      />
    );
  }

  if (phase.kind === "error") {
    return (
      <div className="card p-6 text-center">
        <p className="text-lg font-bold">{phase.message}</p>
        {phase.contacto && (
          <a href="mailto:hola@vengavente.com?subject=Vente%3A%20el%20test" className="btn btn-rojo mt-6 w-full">
            Escribir a hola@vengavente.com
          </a>
        )}
        <Link href="/" className="btn btn-blanco mt-4 w-full">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return <QuestionCard phase={phase} score={score} onAnswer={answer} />;
}

function QuestionCard({
  phase,
  score,
  onAnswer,
}: {
  phase: Extract<Phase, { kind: "question" | "checking" | "feedback" }>;
  score: number;
  onAnswer: (q: Question, choice: number | null) => void;
}) {
  const { q } = phase;
  const locked = phase.kind !== "question";

  // Out of time → send "no answer". The server checks the time anyway.
  useEffect(() => {
    if (phase.kind !== "question") return;
    const t = setTimeout(() => onAnswer(q, null), q.seconds * 1000);
    return () => clearTimeout(t);
  }, [phase.kind, q, onAnswer]);

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-bold">
        <span>
          Pregunta {q.index + 1} de {q.total}
        </span>
        <span className="rounded-full bg-tinta px-3 py-1 text-white">Aciertos: {score}</span>
      </div>

      {/* Countdown bar: restarts for every question via key. */}
      <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-tinta bg-white">
        <div
          key={q.index}
          className={`h-full origin-left bg-rojo ${locked ? "scale-x-0" : "animate-countdown"}`}
          style={{ animationDuration: `${q.seconds}s` }}
        />
      </div>

      <h2 className="mt-6 min-h-[5.5rem] font-display text-[1.75rem] font-extrabold leading-tight">
        {q.text}
      </h2>

      <div className="mt-4 grid gap-3">
        {q.options.map((opt, i) => {
          let style = "btn-blanco";
          if (phase.kind === "checking" && phase.picked === i) style = "bg-amarillo";
          if (phase.kind === "feedback" && phase.picked === i) {
            style = phase.correct ? "bg-green-500 text-white" : "bg-rojo text-white";
          }
          return (
            <button
              key={`${q.index}-${i}`}
              disabled={locked}
              onClick={() => onAnswer(q, i)}
              className={`btn ${style} w-full justify-start text-left disabled:opacity-100`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <p className="mt-4 h-6 text-center font-bold">
        {phase.kind === "feedback" &&
          (phase.correct ? "Correcto" : phase.picked === null ? "Se acabó el tiempo" : "Fallo")}
      </p>
    </div>
  );
}

function Practice({
  seconds,
  phase,
  onPick,
  onStart,
  loading,
}: {
  seconds: number;
  phase: Extract<Phase, { kind: "practice" }>;
  onPick: (picked: number | null) => void;
  onStart: () => void;
  loading: boolean;
}) {
  const { picked, done } = phase;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => onPick(null), seconds * 1000);
    return () => clearTimeout(t);
  }, [done, seconds, onPick]);

  return (
    <div>
      <p className="rounded-full bg-amarillo px-3 py-1 text-center text-sm font-bold">
        Pregunta de prueba. No cuenta.
      </p>

      <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-tinta bg-white">
        <div
          className={`h-full origin-left bg-rojo ${done ? "scale-x-0" : "animate-countdown"}`}
          style={{ animationDuration: `${seconds}s` }}
        />
      </div>
      <p className="mt-2 text-sm text-gris">La barra es tu tiempo. Toca una respuesta antes de que se acabe.</p>

      <h2 className="mt-6 font-display text-[1.75rem] font-extrabold leading-tight">{PRACTICE.text}</h2>

      <div className="mt-4 grid gap-3">
        {PRACTICE.options.map((opt, i) => {
          let style = "btn-blanco";
          if (done && picked === i) style = i === PRACTICE.answer ? "bg-green-500 text-white" : "bg-rojo text-white";
          return (
            <button
              key={i}
              disabled={done}
              onClick={() => onPick(i)}
              className={`btn ${style} w-full justify-start text-left disabled:opacity-100`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {done && (
        <>
          <p className="mt-4 text-center font-bold">
            {picked === null
              ? "Se acabó el tiempo. En el test contaría como fallo."
              : picked === PRACTICE.answer
                ? "Correcto. Así funciona."
                : "Fallo. En el test contaría como fallo."}{" "}
            Ahora empieza el test de verdad.
          </p>
          <button onClick={onStart} disabled={loading} className="btn btn-rojo mt-4 w-full">
            {loading ? "Preparando…" : "Empezar el test"}
          </button>
        </>
      )}
    </div>
  );
}
