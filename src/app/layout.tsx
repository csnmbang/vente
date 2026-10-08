import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Vente · Vente pa'cá",
  description:
    "El mapa de los españoles que viven fuera de España.",
  openGraph: {
    title: "Vente pa'cá",
    description: "El mapa de los españoles que viven fuera de España.",
    locale: "es_ES",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e5322d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-ES" className={`${bricolage.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col">
        {children}
        {/* Cookie-free visit counts (Vercel → Analytics). */}
        <Analytics />
      </body>
    </html>
  );
}
