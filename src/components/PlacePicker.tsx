"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PlaceOption } from "@/app/api/places/route";

/** Type-ahead place search backed by /api/places. Never uses geolocation. */
export default function PlacePicker({
  label,
  placeholder,
  scope,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  scope: "abroad" | "es";
  value: PlaceOption | null;
  onChange: (p: PlaceOption | null) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [fetched, setFetched] = useState<PlaceOption[]>([]);
  const [open, setOpen] = useState(false);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (value || query.trim().length < 2) return;
    const t = setTimeout(async () => {
      abort.current?.abort();
      abort.current = new AbortController();
      try {
        const res = await fetch(`/api/places?scope=${scope}&q=${encodeURIComponent(query)}`, {
          signal: abort.current.signal,
        });
        const data = await res.json();
        setFetched(data.places);
        setOpen(true);
      } catch {
        // superseded by a newer search
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, scope, value]);

  const results = value || query.trim().length < 2 ? [] : fetched;

  if (value) {
    return (
      <div>
        <p className="mb-1 block font-bold">{label}</p>
        <div className="flex min-h-[3.25rem] items-center justify-between rounded-[0.875rem] border-[3px] border-tinta bg-amarillo px-4">
          <span>
            <strong>{value.name}</strong>
            <span className="text-sm"> · {value.detail}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="ml-2 text-sm font-bold underline"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block font-bold">
        {label}
      </label>
      <input
        id={id}
        className="input"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={`${id}-list`}
      />
      {open && results.length > 0 && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-xl border-[3px] border-tinta bg-white shadow-[0_4px_0_var(--tinta)]"
        >
          {results.map((p) => (
            <li key={p.id} role="option" aria-selected={false}>
              <button
                type="button"
                className="block w-full px-4 py-3 text-left active:bg-amarillo"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
              >
                <strong>{p.name}</strong>
                <span className="block text-sm text-gris">{p.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim().length >= 2 && results.length === 0 && (
        <p className="mt-1 text-sm text-gris">
          {scope === "es"
            ? "No lo encontramos. Prueba con el nombre del municipio."
            : "No la encontramos. Prueba con la ciudad grande más cercana."}
        </p>
      )}
    </div>
  );
}
