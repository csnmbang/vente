"use client";

import { useState } from "react";

export default function DeleteRequest() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/borrar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setBusy(false);
    setMsg(
      res.ok
        ? { ok: true, text: "Si ese correo está apuntado, te acaba de llegar un enlace para borrarlo. Caduca en 24 horas." }
        : { ok: false, text: data.error },
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <input
        type="email"
        required
        className="input"
        placeholder="El correo con el que te apuntaste"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button disabled={busy} className="btn btn-blanco w-full">
        {busy ? "Enviando…" : "Mándame el enlace para borrar"}
      </button>
      {msg && <p className={msg.ok ? "font-bold" : "font-bold text-rojo"}>{msg.text}</p>}
    </form>
  );
}
