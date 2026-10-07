import type { Metadata } from "next";
import WorldMap from "./WorldMap";

export const metadata: Metadata = {
  title: "El mapa · Vente",
  description: "Dónde estamos los españoles por el mundo.",
};

export default function MapPage() {
  return <WorldMap />;
}
