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
  | { kind: "loading" }
  | { kind: "question"; q: Question }
  | { kind: "feedback"; q: Question; picked: number | null; correct: boolean }
  | { kind: "error"; message: string };

const FEEDBACK_MS = 400;

export default function Quiz() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [score, setScore] = useState(0);
  const sending = useRef(false);

  async function start() {
    setPhase({ kind: "loading" });
    const res = await fetch("/api/quiz/start", { method: "POST" });
    const data = await res.json();
    if (!res.ok) return setPhase({ kind: "error", message: data.error });
    setScore(0);
    setPhase({ kind: "question", q: data.question });
  }

  const answer = useCallback(
    async (q: Question, choice: number | null) => {
      if (sending.current) return;
      sending.current = true;
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

  if (phase.kind === "intro" || phase.kind === "loading") {
    return (
      <div className="card p-6">
        <h1 className="font-display text-3xl font-extrabold">El test</h1>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-lg">
          <li>10 preguntas, 5 segundos cada una.</li>
          <li>Necesitas 8 aciertos para apuntarte al mapa.</li>
          <li>Si se acaba el tiempo, cuenta como fallo.</li>
        </ul>
        <button
          onClick={start}
          disabled={phase.kind === "loading"}
          className="btn btn-rojo mt-6 w-full"
        >
          {phase.kind === "loading" ? "Preparando…" : "Empezar"}
        </button>
      </div>
    );
  }

  if (phase.kind === "error") {
    return (
      <div className="card p-6 text-center">
        <p className="text-lg font-bold">{phase.message}</p>
        <Link href="/" className="btn btn-blanco mt-6 w-full">
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
  phase: Extract<Phase, { kind: "question" | "feedback" }>;
  score: number;
  onAnswer: (q: Question, choice: number | null) => void;
}) {
  const { q } = phase;
  const locked = phase.kind === "feedback";

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
