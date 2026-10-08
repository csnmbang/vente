"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function EntrarForm() {
  const router = useRouter();
  const caducado = useSearchParams().has("caducado");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(
    caducado ? { ok: false, text: "Ese enlace ha caducado. Pide otro." } : null,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/entrar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === "unlocked") return router.push("/mapa");
      setMsg(
        res.ok
          ? { ok: true, text: "Si ese correo está apuntado, te acaba de llegar un enlace. Ábrelo en este móvil." }
          : { ok: false, text: data.error },
      );
    } catch {
      setMsg({ ok: false, text: "Se ha perdido la conexión. Vuelve a intentarlo." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-3">
      <input
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        className="input"
        placeholder="tucorreo@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button disabled={busy} className="btn btn-rojo w-full">
        {busy ? "Enviando…" : "Mandarme el enlace"}
      </button>
      {msg && <p className={msg.ok ? "font-bold" : "font-bold text-rojo"}>{msg.text}</p>}
    </form>
  );
}
