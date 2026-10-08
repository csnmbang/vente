"use client";

import Link from "next/link";
import { useState } from "react";
import type { PlaceOption } from "@/app/api/places/route";
import PlacePicker from "@/components/PlacePicker";
import { contarPaisanos, PROVINCIAS } from "@/content/provincias";

type Paisanos = { provincia: string; otros: number };
type Done = { status: "check-email" | "confirmed"; email: string; paisanos?: Paisanos };

/** "Ya hay 14 murcianos en Vente." / "Eres la primera persona de Murcia en Vente." */
function lineaPaisanos({ provincia, otros }: Paisanos): string {
  if (otros > 0) return `Ya hay ${contarPaisanos(provincia, otros)} en Vente.`;
  return `Eres la primera persona de ${PROVINCIAS[provincia]?.nombre ?? "tu provincia"} en Vente.`;
}

export default function SignupForm({ emailEnabled, demo }: { emailEnabled: boolean; demo: boolean }) {
  const [email, setEmail] = useState("");
  const [city, setCity] = useState<PlaceOption | null>(null);
  const [postcode, setPostcode] = useState("");
  const [hometown, setHometown] = useState<PlaceOption | null>(null);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!city) return setError("Dinos en qué ciudad vives.");
    if (!hometown) return setError("Dinos de qué pueblo o ciudad de España eres.");
    setSending(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          cityId: city.id,
          postcode: postcode.trim() || null,
          hometownId: hometown.id,
          website: form.get("website"), // honeypot
        }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setDone({ status: data.status, email, paisanos: data.paisanos });
    } catch {
      setError("Se ha perdido la conexión. Vuelve a intentarlo.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return done.status === "check-email" ? (
      <div className="mt-5 rounded-xl bg-amarillo p-4">
        <p className="text-lg font-extrabold">Último paso: confirma tu correo</p>
        <p className="mt-1">
          Te hemos enviado un enlace a <strong>{done.email}</strong>. Al pulsarlo se abre el mapa
          y apareces en él. Si no lo ves, revisa la carpeta de spam.
        </p>
        {done.paisanos && <p className="mt-2 font-bold">{lineaPaisanos(done.paisanos)}</p>}
      </div>
    ) : (
      <div className="mt-5 rounded-xl bg-amarillo p-4">
        <p className="text-lg font-extrabold">Ya estás en el mapa</p>
        <Link href="/chat" className="btn btn-blanco mt-3 w-full">
          Entrar en el chat de tu ciudad
        </Link>
        {done.paisanos && <p className="mt-1 font-bold">{lineaPaisanos(done.paisanos)}</p>}
        <Link href="/mapa" className="btn btn-rojo mt-3 w-full">
          Ver el mapa
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block font-bold">
          Tu correo
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="input"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <PlacePicker
        label="¿Dónde vives ahora?"
        placeholder="Londres, Berlín, Miami…"
        scope="abroad"
        value={city}
        onChange={setCity}
      />

      {city?.hasPostcodes && (
        <div>
          <label htmlFor="postcode" className="mb-1 block font-bold">
            Código postal <span className="font-normal text-gris">(opcional)</span>
          </label>
          <input
            id="postcode"
            className="input"
            placeholder="Ej.: 33125, E8, D02…"
            autoComplete="postal-code"
            value={postcode}
            maxLength={12}
            onChange={(e) => setPostcode(e.target.value)}
          />
          <p className="mt-1 text-sm text-gris">
            Sirve para mostrarte en tu zona y no en el centro de la ciudad. Guardamos solo la
            zona, nunca tu calle.
          </p>
        </div>
      )}

      <PlacePicker
        label="¿De dónde eres?"
        placeholder="Tu pueblo o ciudad en España"
        scope="es"
        value={hometown}
        onChange={setHometown}
      />

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label>
          No rellenes esto <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          required
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 h-5 w-5 accent-[var(--rojo)]"
        />
        <span>
          He leído la{" "}
          <Link href="/privacidad" className="underline" target="_blank">
            política de privacidad
          </Link>{" "}
          y quiero salir en el mapa.
        </span>
      </label>

      {error && <p className="rounded-xl bg-rojo/10 p-3 font-bold text-rojo-oscuro">{error}</p>}

      <button type="submit" disabled={sending} className="btn btn-rojo w-full">
        {sending ? "Enviando…" : "Apuntarme"}
      </button>

      {demo && (
        <p className="text-center text-xs text-gris">
          Modo demo: los datos no se guardan{emailEnabled ? "" : " y no se envían correos"}.
        </p>
      )}
    </form>
  );
}
