"use client";

import { useState } from "react";
import type { PlaceOption } from "@/app/api/places/route";
import PlacePicker from "@/components/PlacePicker";
import { contarPaisanos, PROVINCIAS, provinciasParaElegir } from "@/content/provincias";
import { COMUNIDADES } from "@/content/rutas";
import { haversineKm } from "@/lib/geo";
import { distanciaEnRuta } from "@/lib/rutas";
import { origen, writeYo, type Yo } from "@/lib/yo";

type City = { name: string; lat: number; lng: number; people: number; provincias: Record<string, number> };

// Closer than this to the reader's city centre counts as their own city.
const MISMA_CIUDAD_KM = 3;

/**
 * People from the reader's province in a city, not counting the reader
 * themselves when they signed up from this city.
 */
export function paisanosEn(yo: Yo | null, c: { lat: number; lng: number; provincias: Record<string, number> }): number {
  if (!yo?.provincia) return 0;
  const n = c.provincias[yo.provincia] ?? 0;
  return yo.apuntado && haversineKm(yo, c) < MISMA_CIUDAD_KM ? Math.max(0, n - 1) : n;
}

/** "a un Alicante–Murcia de ti", or null for the reader's own city. */
export function distanciaDesde(yo: Yo, p: { lat: number; lng: number }): string | null {
  const km = haversineKm(yo, p);
  return km < MISMA_CIUDAD_KM ? null : distanciaEnRuta(km, yo.region).texto;
}

/** Bottom-of-map panel: your city, the nearest cities with Spaniards, and the picker. */
export default function YoPanel({
  yo,
  cities,
  onChange,
}: {
  yo: Yo | null;
  cities: City[];
  onChange: (yo: Yo) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing || !yo) {
    return editing ? (
      <ElegirCiudad
        onCancel={() => setEditing(false)}
        onSave={(next) => {
          writeYo(next);
          onChange(next);
          setEditing(false);
        }}
      />
    ) : (
      <button onClick={() => setEditing(true)} className="w-full text-left font-bold underline">
        Elige tu ciudad para ver a qué distancia está cada sitio
      </button>
    );
  }

  const cercanas = cities
    .map((c) => ({ ...c, km: haversineKm(yo, c) }))
    .filter((c) => c.km >= MISMA_CIUDAD_KM)
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);

  // Cities with people from your province, most first.
  const conPaisanos = yo.provincia
    ? cities
        .map((c) => ({ name: c.name, n: paisanosEn(yo, c) }))
        .filter((c) => c.n > 0)
        .sort((a, b) => b.n - a.n)
    : [];

  return (
    <div>
      <p>
        Tu ciudad: <strong>{yo.ciudad}</strong>{" "}
        <button onClick={() => setEditing(true)} className="text-gris underline">
          Cambiar
        </button>
      </p>
      {cercanas.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {cercanas.map((c) => (
            <li key={c.name}>
              <strong>{c.name}</strong> está {distanciaEnRuta(c.km, yo.region).texto}
            </li>
          ))}
        </ul>
      )}
      {yo.provincia && (
        <p className="mt-1">
          {conPaisanos.length > 0 ? (
            <>
              <span className="mr-1 inline-block h-3 w-3 rounded-full border-2 border-amarillo bg-rojo align-middle" />
              {conPaisanos
                .slice(0, 3)
                .map((c) => `${contarPaisanos(yo.provincia!, c.n)} en ${c.name}`)
                .join(", ")}
              {conPaisanos.length > 3 && ` y en ${conPaisanos.length - 3} ciudades más`}
            </>
          ) : (
            `Todavía no hay nadie de ${PROVINCIAS[yo.provincia]?.nombre ?? "tu provincia"} en el mapa.`
          )}
        </p>
      )}
    </div>
  );
}

function ElegirCiudad({ onSave, onCancel }: { onSave: (yo: Yo) => void; onCancel: () => void }) {
  const [city, setCity] = useState<PlaceOption | null>(null);
  const [provincia, setProvincia] = useState("");

  return (
    <div className="space-y-3">
      <PlacePicker
        label="¿Dónde vives?"
        placeholder="Londres, Berlín, Miami…"
        scope="abroad"
        value={city}
        onChange={setCity}
        dropUp
      />
      <div>
        <label htmlFor="provincia" className="mb-1 block font-bold">
          ¿De qué provincia eres?
        </label>
        <select
          id="provincia"
          className="input"
          value={provincia}
          onChange={(e) => setProvincia(e.target.value)}
        >
          <option value="">Prefiero no decirlo</option>
          {COMUNIDADES.map((c) => (
            <optgroup key={c} label={c}>
              {provinciasParaElegir()
                .filter((p) => p.comunidad === c)
                .map((p) => (
                  <option key={p.clave} value={p.clave}>
                    {p.nombre}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>
      <p className="text-xs text-gris">Se guarda solo en tu navegador.</p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="btn btn-blanco min-h-0 flex-1 py-2 text-base">
          Cancelar
        </button>
        <button
          disabled={!city}
          onClick={() =>
            city && onSave({ ciudad: city.name, lat: city.lat, lng: city.lng, ...origen(provincia) })
          }
          className="btn btn-rojo min-h-0 flex-1 py-2 text-base"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
