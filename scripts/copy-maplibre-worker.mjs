// MapLibre's web worker can't be bundled by Turbopack, so we serve it as a
// static file from public/. Runs on every `npm install` (also on Vercel).
import fs from "node:fs";

fs.mkdirSync("public/maplibre", { recursive: true });
fs.copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
  "public/maplibre/maplibre-gl-worker.mjs",
);
