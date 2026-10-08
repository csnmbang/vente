"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EstadoChat, MensajePublico } from "@/lib/chat";

// How often we ask for new messages while the chat is open.
const POLL_MS = 4000;
const MAX_LENGTH = 500;

type Respuesta = { estado: EstadoChat; ciudad?: string; alias?: string; mensajes?: MensajePublico[] };

const hora = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Chat() {
  const [estado, setEstado] = useState<EstadoChat | "cargando">("cargando");
  const [ciudad, setCiudad] = useState("");
  const [mensajes, setMensajes] = useState<MensajePublico[]>([]);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const ultimo = useRef<number | null>(null);
  const abajo = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    const after = ultimo.current;
    const res = await fetch(`/api/chat${after ? `?after=${after}` : ""}`, { cache: "no-store" });
    const data: Respuesta = await res.json();
    setEstado(data.estado);
    if (data.estado !== "ok" || !data.mensajes) return;
    setCiudad(data.ciudad ?? "");
    if (data.mensajes.length) {
      ultimo.current = data.mensajes[data.mensajes.length - 1].id;
      setMensajes((prev) => (after ? [...prev, ...data.mensajes!] : data.mensajes!));
    }
  }, []);

  // First load, then poll while the page is visible.
  useEffect(() => {
    let parar = false;
    const tick = async () => {
      if (!parar && document.visibilityState === "visible") await cargar().catch(() => {});
    };
    tick();
    const t = setInterval(tick, POLL_MS);
    return () => {
      parar = true;
      clearInterval(t);
    };
  }, [cargar]);

  // Keep the newest message in view.
  useEffect(() => {
    abajo.current?.scrollIntoView({ block: "end" });
  }, [mensajes.length]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setTexto("");
      await cargar();
    } catch {
      setError("Se ha perdido la conexión. Vuelve a intentarlo.");
    } finally {
      setEnviando(false);
    }
  }

  async function reportar(id: number) {
    if (!confirm("¿Reportar este mensaje? Lo revisaremos.")) return;
    await fetch("/api/chat/reportar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    alert("Gracias. Lo revisaremos.");
  }

  if (estado === "cargando") return <Marco><p className="p-6">Cargando el chat…</p></Marco>;
  if (estado === "sin-alias") return <Marco><ElegirAlias onHecho={cargar} /></Marco>;
  if (estado !== "ok") return <Marco><SinAcceso estado={estado} /></Marco>;

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col">
      <header className="flex items-center justify-between border-b-[3px] border-tinta bg-white px-4 py-3">
        <div>
          <Link href="/mapa" className="text-sm font-bold text-gris underline">
            Volver al mapa
          </Link>
          <h1 className="font-display text-2xl font-extrabold leading-tight">{ciudad} y alrededores</h1>
        </div>
        <Link href="/" className="font-display text-xl font-extrabold text-rojo">
          Vente
        </Link>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {mensajes.length === 0 && (
          <p className="mt-10 text-center text-gris">
            Todavía no ha escrito nadie. Empieza tú: preséntate y di de dónde eres.
          </p>
        )}
        {mensajes.map((m) => (
          <div key={m.id} className={m.mio ? "ml-10 text-right" : "mr-10"}>
            {!m.mio && (
              <p className="text-xs font-bold">
                {m.alias}{" "}
                <span className="font-normal text-gris">
                  · de {m.pueblo}
                  {m.ciudad && ` · en ${m.ciudad}`}
                </span>
              </p>
            )}
            <p
              className={`mt-0.5 inline-block whitespace-pre-wrap break-words rounded-2xl border-2 border-tinta px-3 py-2 text-left ${
                m.mio ? "bg-rojo text-white" : "bg-white"
              }`}
            >
              {m.texto}
            </p>
            <p className="mt-0.5 text-[11px] text-gris">
              {hora(m.hora)}
              {!m.mio && (
                <button onClick={() => reportar(m.id)} className="ml-2 underline">
                  Reportar
                </button>
              )}
            </p>
          </div>
        ))}
        <div ref={abajo} />
      </div>

      <form onSubmit={enviar} className="border-t-[3px] border-tinta bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {error && <p className="mb-2 text-sm font-bold text-rojo">{error}</p>}
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Escribe un mensaje"
            value={texto}
            maxLength={MAX_LENGTH}
            onChange={(e) => setTexto(e.target.value)}
            enterKeyHint="send"
          />
          <button disabled={enviando || !texto.trim()} className="btn btn-rojo min-h-0 px-4">
            Enviar
          </button>
        </div>
        <p className="mt-1 text-[11px] text-gris">
          Solo texto, sin enlaces. Los mensajes se pueden reportar.
        </p>
      </form>
    </main>
  );
}

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-10 pt-6">
      <Link href="/" className="font-display text-xl font-extrabold text-rojo">
        Vente
      </Link>
      <div className="card mt-6">{children}</div>
      <p className="mt-6 text-center text-sm">
        <Link href="/mapa" className="underline">
          Volver al mapa
        </Link>
      </p>
    </main>
  );
}

function SinAcceso({ estado }: { estado: Exclude<EstadoChat, "ok" | "sin-alias"> }) {
  const textos = {
    "sin-sesion": {
      titulo: "El chat es para los que están en el mapa",
      cuerpo: "Haz el test y apúntate, o entra con tu correo si ya lo estás.",
    },
    "sin-confirmar": {
      titulo: "Confirma tu correo",
      cuerpo: "Para entrar en el chat tienes que confirmar tu correo con el enlace que te mandamos (mira también en spam).",
    },
    expulsado: {
      titulo: "No puedes entrar en el chat",
      cuerpo: "Tu cuenta no tiene acceso al chat. Si crees que es un error, escríbenos a hola@vengavente.com.",
    },
  }[estado];
  return (
    <div className="p-6">
      <h1 className="font-display text-2xl font-extrabold leading-tight">{textos.titulo}</h1>
      <p className="mt-2">{textos.cuerpo}</p>
      {estado === "sin-sesion" && (
        <>
          <Link href="/quiz" className="btn btn-rojo mt-5 w-full">
            Hacer el test
          </Link>
          <Link href="/entrar" className="btn btn-blanco mt-3 w-full">
            Ya estoy apuntado
          </Link>
        </>
      )}
    </div>
  );
}

function ElegirAlias({ onHecho }: { onHecho: () => void }) {
  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/chat/alias", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ alias }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    onHecho();
  }

  return (
    <form onSubmit={guardar} className="p-6">
      <h1 className="font-display text-2xl font-extrabold leading-tight">¿Cómo quieres que te llamen?</h1>
      <p className="mt-2">
        En el chat se verá tu apodo y tu pueblo, por ejemplo «Carmen · de San Javier». Nunca tu
        correo.
      </p>
      <input
        className="input mt-4"
        placeholder="Tu apodo"
        value={alias}
        minLength={2}
        maxLength={24}
        required
        onChange={(e) => setAlias(e.target.value)}
      />
      {error && <p className="mt-2 font-bold text-rojo">{error}</p>}
      <button className="btn btn-rojo mt-4 w-full">Entrar en el chat</button>
    </form>
  );
}
