"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Map as MlMap } from "maplibre-gl";
import type { MapData } from "@/app/api/map/route";

// OpenFreeMap: OSM-based vector tiles, free, no API key.
const STYLE = "https://tiles.openfreemap.org/styles/positron";
// Below this zoom we show one dot per city; above it, postcode zones.
const ZONE_ZOOM = 8;

const plural = (n: number) => `${n} ${n === 1 ? "español" : "españoles"}`;

export default function WorldMap() {
  const container = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MapData | null>(null);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Read once from the URL on arrival from the confirmation email.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (params.has("bienvenida")) setBanner("¡Ya estás en el mapa! Bienvenido/a a la familia 🎉");
    else if (params.has("confirmacion"))
      setBanner("Ese enlace ha caducado. Vuelve a hacer el test para apuntarte.");
  }, []);

  useEffect(() => {
    let map: MlMap | undefined;
    let cancelled = false;

    (async () => {
      const [maplibregl, res] = await Promise.all([
        import("maplibre-gl"),
        fetch("/api/map"),
      ]);
      const d: MapData = await res.json();
      if (cancelled || !container.current) return;
      maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      setData(d);

      const m = new maplibregl.Map({
        container: container.current,
        style: STYLE,
        center: [-3, 40],
        zoom: 1.6,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
      });
      map = m;
      if (process.env.NODE_ENV === "development") Object.assign(window, { __venteMap: m });
      m.touchZoomRotate.disableRotation();

      m.on("load", () => {
        const map = m;
        // Base map labels in Spanish where OSM has them ("Noruega", not "Norway").
        for (const layer of map.getStyle().layers) {
          if (layer.type === "symbol" && map.getLayoutProperty(layer.id, "text-field")) {
            map.setLayoutProperty(layer.id, "text-field", [
              "coalesce", ["get", "name:es"], ["get", "name:latin"], ["get", "name"],
            ]);
          }
        }
        map.addSource("cities", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: d.cities.map((c) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [c.lng, c.lat] },
              properties: { name: c.name, people: c.people },
            })),
          },
        });
        map.addSource("zones", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: d.zones.map((z) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [z.lng, z.lat] },
              properties: { label: z.label ?? "", city: z.city, people: z.people },
            })),
          },
        });

        // Zoomed out: one dot per city, sized by how many people.
        map.addLayer({
          id: "city-dots",
          type: "circle",
          source: "cities",
          maxzoom: ZONE_ZOOM,
          layout: { "circle-sort-key": ["get", "people"] }, // big cities on top
          paint: {
            "circle-color": "#e5322d",
            "circle-opacity": 0.9,
            "circle-stroke-color": "#1d1424",
            "circle-stroke-width": 2,
            "circle-radius": ["interpolate", ["linear"], ["sqrt", ["get", "people"]], 1, 8, 10, 30, 30, 56],
          },
        });
        map.addLayer({
          id: "city-labels",
          type: "symbol",
          source: "cities",
          maxzoom: ZONE_ZOOM,
          layout: {
            "text-field": ["to-string", ["get", "people"]],
            "text-font": ["Noto Sans Bold"],
            "text-size": ["interpolate", ["linear"], ["sqrt", ["get", "people"]], 1, 10, 10, 16],
            "symbol-sort-key": ["-", 0, ["get", "people"]], // bigger counts win label collisions
          },
          paint: { "text-color": "#ffffff" },
        });

        // Zoomed in: soft blobs per postcode area, light red (1) → very dark red (100+).
        map.addLayer({
          id: "zone-glow",
          type: "circle",
          source: "zones",
          minzoom: ZONE_ZOOM,
          paint: {
            "circle-color": [
              "interpolate", ["linear"], ["get", "people"],
              1, "#ffb4ae", 5, "#f47a72", 20, "#e5322d", 50, "#b3201b", 100, "#6e0c09",
            ],
            "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 8, 18, 12, 60, 15, 240],
            "circle-blur": 0.55,
            "circle-opacity": 0.75,
          },
        });
        map.addLayer({
          id: "zone-labels",
          type: "symbol",
          source: "zones",
          minzoom: ZONE_ZOOM,
          layout: {
            "text-field": ["to-string", ["get", "people"]],
            "text-font": ["Noto Sans Bold"],
            "text-size": 14,
            "symbol-sort-key": ["-", 0, ["get", "people"]],
          },
          paint: { "text-color": "#1d1424", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
        });

        const popup = new maplibregl.Popup({ closeButton: false, offset: 12 });
        map.on("click", "city-dots", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const p = f.properties as { name: string; people: number };
          popup
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${escapeHtml(p.name)}</strong><br>${plural(p.people)}`)
            .addTo(map);
        });
        map.on("click", "zone-glow", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const p = f.properties as { label: string; city: string; people: number };
          const where = p.label ? `${escapeHtml(p.label)} · ${escapeHtml(p.city)}` : escapeHtml(p.city);
          popup.setLngLat(e.lngLat).setHTML(`<strong>${where}</strong><br>${plural(p.people)}`).addTo(map);
        });
        for (const layer of ["city-dots", "zone-glow"]) {
          map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
        }
        map.on("zoomend", () => setZoomedIn(map.getZoom() >= ZONE_ZOOM));
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  const total = data?.cities.reduce((n, c) => n + c.people, 0) ?? 0;

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {/* MapLibre's CSS sets position:relative on the map element, so it gets a wrapper. */}
      <div className="absolute inset-0 bg-[#f2efe9]">
        <div ref={container} className="h-full w-full" />
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 p-3">
        <div className="card pointer-events-auto mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div>
            <Link href="/" className="font-display text-xl font-extrabold text-rojo">
              Vente
            </Link>
            <p className="text-sm font-bold">
              {data
                ? total
                  ? `${plural(total)} en ${data.cities.length} ${data.cities.length === 1 ? "ciudad" : "ciudades"}`
                  : "Aún no hay nadie… ¡estrénalo tú!"
                : "Cargando el mapa…"}
            </p>
          </div>
          <Link href="/quiz" className="btn btn-rojo min-h-0 px-4 py-2 text-base">
            Ponte
          </Link>
        </div>
        {banner && (
          <div className="pointer-events-auto mx-auto mt-2 max-w-md rounded-xl border-[3px] border-tinta bg-amarillo p-3 font-bold">
            {banner}
            <button onClick={() => setBanner(null)} className="float-right ml-2" aria-label="Cerrar">
              ✕
            </button>
          </div>
        )}
      </header>

      {/* Sits above MapLibre's attribution button. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="card mx-auto max-w-md px-4 py-2 text-sm">
          {zoomedIn ? (
            <div className="flex items-center gap-2">
              <span>1</span>
              <span className="h-3 flex-1 rounded-full bg-gradient-to-r from-[#ffb4ae] via-[#e5322d] to-[#6e0c09]" />
              <span>100+</span>
              <span className="ml-1 text-gris">por código postal</span>
            </div>
          ) : (
            <p>Cada punto es una ciudad. Acércate para verlo por código postal 🔍</p>
          )}
        </div>
      </div>
    </main>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
