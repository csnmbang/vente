"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DeleteConfirm() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<"idle" | "busy" | "done" | string>("idle");

  async function confirm() {
    setState("busy");
    const res = await fetch("/api/borrar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setState(res.ok ? "done" : data.error);
  }

  if (state === "done") {
    return (
      <div className="card p-6">
        <p className="text-4xl">👋</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold">Borrado. Te echaremos de menos.</h1>
        <p className="mt-2">Tu correo y tu zona ya no están en Vente. Si algún día vuelves, aquí seguimos.</p>
        <Link href="/" className="btn btn-blanco mt-6 w-full">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h1 className="font-display text-2xl font-extrabold">¿Borramos tus datos?</h1>
      <p className="mt-2">
        Desaparecen tu correo, tu ciudad, tu código postal y tu pueblo, y dejas de contar en el
        mapa. No se puede deshacer.
      </p>
      {!token && <p className="mt-4 font-bold text-rojo">Falta el enlace del correo.</p>}
      {state !== "idle" && state !== "busy" && <p className="mt-4 font-bold text-rojo">{state}</p>}
      <button
        onClick={confirm}
        disabled={!token || state === "busy"}
        className="btn btn-rojo mt-6 w-full"
      >
        {state === "busy" ? "Borrando…" : "Sí, bórralo todo"}
      </button>
    </div>
  );
}
