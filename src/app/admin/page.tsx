import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PROVINCIAS } from "@/content/provincias";
import { claveValida } from "@/lib/admin";
import { store } from "@/lib/store";

export const metadata: Metadata = { title: "Admin · Vente", robots: { index: false, follow: false } };

/** Private numbers for the owner: vengavente.com/admin?clave=ADMIN_KEY */
export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-12 pt-6">
      <Suspense fallback={<p>Cargando…</p>}>
        <Panel searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

/** "carmen@gmail.com" → "ca•••@gmail.com" */
function ocultar(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}•••@${domain}`;
}

const hace24h = () => new Date(Date.now() - 24 * 3600 * 1000).toISOString();

const hora = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

async function Panel({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const { clave } = await searchParams;
  if (!claveValida(clave)) notFound();

  const [s, cities, reportados] = await Promise.all([
    store().adminStats(hace24h()),
    store().cityCounts(),
    store().reportedMessages(),
  ]);
  const moderar = `/api/admin/moderar?clave=${encodeURIComponent(String(clave))}`;
  const places = new Map(
    (await Promise.all(
      [...new Set(s.recent.flatMap((r) => [r.city_id, r.hometown_id]))].map((id) => store().getPlace(id)),
    ))
      .filter((p) => p !== null)
      .map((p) => [p.id, p]),
  );
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "–");

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Vente en números</h1>
      <p className="text-gris">Las visitas están en Vercel → Analytics.</p>
      <form method="post" action={`/api/admin/refrescar?clave=${encodeURIComponent(String(clave))}`} className="mt-3">
        <button className="btn btn-blanco min-h-0 w-full py-2 text-base">Actualizar el mapa</button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Dato titulo="Tests (24 h)" valor={s.attempts.day} detalle={`${s.attempts.passedDay} aprobados`} />
        <Dato titulo="Altas (24 h)" valor={s.signups.day} />
        <Dato titulo="Tests en total" valor={s.attempts.total} detalle={`aprueba el ${pct(s.attempts.passedTotal, s.attempts.total)}`} />
        <Dato titulo="Correos en total" valor={s.signups.total} detalle={`${s.signups.confirmed} confirmados`} />
      </div>

      <h2 className="mt-8 font-display text-xl font-extrabold">
        Mensajes reportados {reportados.length > 0 && `(${reportados.length})`}
      </h2>
      <ul className="mt-2 divide-y divide-tinta/10 rounded-xl border-2 border-tinta bg-white">
        {reportados.length === 0 && <li className="p-3 text-gris">Ninguno.</li>}
        {reportados.map((m) => (
          <li key={m.id} className="p-3 text-sm">
            <p className="whitespace-pre-wrap">«{m.body}»</p>
            <p className="mt-1 text-gris">
              {m.alias ?? "Sin apodo"} · chat de {m.city} · {hora(m.created_at)} · {m.reports}{" "}
              {m.reports === 1 ? "reporte" : "reportes"}
            </p>
            <form method="post" action={moderar} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="autor" value={m.signup_id} />
              <button name="accion" value="ocultar" className="btn btn-blanco min-h-0 flex-1 py-1 text-sm">
                Ocultar mensaje
              </button>
              <button name="accion" value="expulsar" className="btn btn-rojo min-h-0 flex-1 py-1 text-sm">
                Expulsar del chat
              </button>
            </form>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-display text-xl font-extrabold">Últimas altas</h2>
      <ul className="mt-2 divide-y divide-tinta/10 rounded-xl border-2 border-tinta bg-white">
        {s.recent.length === 0 && <li className="p-3 text-gris">Todavía ninguna.</li>}
        {s.recent.map((r) => {
          const pueblo = places.get(r.hometown_id);
          return (
            <li key={r.created_at + r.email} className="p-3 text-sm">
              <strong>{places.get(r.city_id)?.name ?? "?"}</strong> · de {pueblo?.name ?? "?"}
              {pueblo?.admin2_name && ` (${PROVINCIAS[pueblo.admin2_name]?.nombre ?? pueblo.admin2_name})`}
              <span className="block text-gris">
                {ocultar(r.email)} · {hora(r.created_at)} · {r.confirmed_at ? "confirmado" : "sin confirmar"}
              </span>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-8 font-display text-xl font-extrabold">Ciudades (confirmados)</h2>
      <ul className="mt-2 rounded-xl border-2 border-tinta bg-white p-3 text-sm">
        {cities.length === 0 && <li className="text-gris">Todavía ninguna.</li>}
        {cities
          .sort((a, b) => b.people - a.people)
          .slice(0, 15)
          .map((c) => (
            <li key={c.city_id} className="flex justify-between py-0.5">
              <span>{c.name}</span>
              <strong>{c.people}</strong>
            </li>
          ))}
      </ul>
    </>
  );
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: number; detalle?: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-gris">{titulo}</p>
      <p className="font-display text-4xl font-extrabold">{valor}</p>
      {detalle && <p className="text-sm">{detalle}</p>}
    </div>
  );
}
