"use client";

import { useState } from "react";
import type { PlaceOption } from "@/app/api/places/route";
import PlacePicker from "@/components/PlacePicker";
import { COMUNIDADES } from "@/content/rutas";
import { haversineKm } from "@/lib/geo";
import { distanciaEnRuta } from "@/lib/rutas";
import { asComunidad, writeYo, type Yo } from "@/lib/yo";

type City = { name: string; lat: number; lng: number; people: number };

// Closer than this to the reader's city centre counts as their own city.
const MISMA_CIUDAD_KM = 3;

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
    </div>
  );
}

function ElegirCiudad({ onSave, onCancel }: { onSave: (yo: Yo) => void; onCancel: () => void }) {
  const [city, setCity] = useState<PlaceOption | null>(null);
  const [region, setRegion] = useState("");

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
        <label htmlFor="region" className="mb-1 block font-bold">
          ¿De qué comunidad eres?
        </label>
        <select
          id="region"
          className="input"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">Prefiero no decirlo</option>
          {COMUNIDADES.map((c) => (
            <option key={c}>{c}</option>
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
            city && onSave({ ciudad: city.name, lat: city.lat, lng: city.lng, region: asComunidad(region) })
          }
          className="btn btn-rojo min-h-0 flex-1 py-2 text-base"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
