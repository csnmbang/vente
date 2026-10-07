import type { Metadata } from "next";
import Link from "next/link";
import Quiz from "./Quiz";

export const metadata: Metadata = { title: "El test · Vente" };

export default function QuizPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-8 pt-6">
      <Link href="/" className="font-display text-xl font-extrabold text-rojo">
        Vente
      </Link>
      <div className="mt-6">
        <Quiz />
      </div>
    </main>
  );
}
