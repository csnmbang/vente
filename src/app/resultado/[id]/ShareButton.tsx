"use client";

import { useState } from "react";

export default function ShareButton({ score }: { score: number }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    const text = `He sacado ${score}/10 en el test de Vente.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Vente pa'cá", text, url });
      } catch {
        // cancelled
      }
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4">
      <button onClick={share} className="btn btn-blanco w-full">
        {copied ? "Enlace copiado" : "Compartir"}
      </button>
    </div>
  );
}
