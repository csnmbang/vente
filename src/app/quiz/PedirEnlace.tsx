"use client";

import { useState } from "react";

/** For people with no tries left: leave an email and the owner sends an entry link. */
export default function PedirEnlace() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/solicitud", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMsg(res.ok ? { ok: true, text: "Recibido. Te mandaremos el enlace a ese correo." } : { ok: false, text: data.error });
    } catch {
      setMsg({ ok: false, text: "Se ha perdido la conexión. Vuelve a intentarlo." });
    } finally {
      setBusy(false);
    }
  }

  if (msg?.ok) return <p className="mt-4 rounded-xl bg-amarillo p-4 font-bold">{msg.text}</p>;

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 text-left">
      <p>¿Eres de aquí y no te ha salido? Déjanos tu correo y te mandamos un enlace para entrar.</p>
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
        {busy ? "Enviando…" : "Pedir enlace"}
      </button>
      {msg && <p className="font-bold text-rojo">{msg.text}</p>}
    </form>
  );
}
