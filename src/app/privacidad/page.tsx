import type { Metadata } from "next";
import Link from "next/link";
import DeleteRequest from "./DeleteRequest";

export const metadata: Metadata = { title: "Privacidad · Vente" };

const RESPONSABLE = "CSN Solutions LLC";
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@vengavente.com";

// Keep this page in sync with what we actually store (see CLAUDE.md).
export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-12 pt-6">
      <Link href="/" className="font-display text-xl font-extrabold text-rojo">
        Vente
      </Link>
      <h1 className="mt-6 font-display text-4xl font-extrabold">Tu privacidad</h1>
      <p className="mt-3 text-lg">
        Guardamos lo mínimo para ponerte en el mapa, y puedes borrarlo cuando quieras.
      </p>

      <Section title="Qué guardamos si te apuntas">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Tu correo</strong>, para confirmar que eres tú y avisarte de novedades de Vente.
          </li>
          <li>
            <strong>La ciudad donde vives</strong>, guardada como el centro de la ciudad.
          </li>
          <li>
            <strong>Tu código postal, si lo pones</strong>. Solo guardamos la zona (por ejemplo{" "}
            <em>E8</em> en Londres o <em>33125</em> en Miami) y su punto central. Nunca tu calle ni
            tu dirección, y nunca usamos la ubicación de tu móvil.
          </li>
          <li>
            <strong>Tu pueblo o ciudad en España</strong>, para saber de dónde somos.
          </li>
        </ul>
      </Section>

      <Section title="Qué se ve en el mapa">
        <p>
          Solo números: cuántas personas hay en cada ciudad y en cada zona de código postal, y en
          cada ciudad cuántas son de cada provincia (por ejemplo, 3 murcianos en Dublín). Tu pueblo
          no se muestra en el mapa. Nunca
          tu nombre, tu correo ni un punto tuyo. Si eres la única persona de Vente en tu código
          postal, en esa zona aparecerá un 1.
        </p>
      </Section>

      <Section title="El chat">
        <p>
          Si entras en el chat de tu ciudad, guardamos tus mensajes y el apodo que elijas. Los ven
          solo las personas apuntadas y confirmadas que viven en tu ciudad o a menos de unos 40
          km, junto a tu apodo, tu pueblo y la ciudad donde vives. Nunca se muestra tu correo. Si alguien reporta un mensaje, lo revisamos y podemos
          ocultarlo o quitarte el acceso al chat. Si borras tus datos, se borran también tus
          mensajes.
        </p>
      </Section>

      <Section title="El test">
        <p>
          Guardamos tus respuestas y tu nota para que funcione el enlace de resultado que
          compartes. Para frenar trampas y spam guardamos también una huella cifrada de tu
          conexión (no tu IP), que borramos a los 7 días.
        </p>
      </Section>

      <Section title="Por qué y cuánto tiempo">
        <p>
          Lo hacemos porque tú nos das tu consentimiento al apuntarte. Guardamos tus datos hasta
          que pidas borrarlos. Si no confirmas tu correo en 7 días, los borramos solos.
        </p>
      </Section>

      <Section title="Quién trata tus datos">
        <p>
          Responsable: {RESPONSABLE} ({CONTACT}). Usamos estos proveedores, con los datos alojados
          en la Unión Europea: Supabase (base de datos, Frankfurt), Vercel (la web) y Resend (los
          correos). El mapa de fondo lo sirve OpenFreeMap, así que tu navegador se conecta a sus
          servidores al verlo. No vendemos ni compartimos tus datos con nadie más. Usamos cookies técnicas para que el test funcione, para contar tus intentos (tienes 2) y para recordar que ya puedes ver el mapa.
          Otra cookie guarda en tu navegador tu ciudad y tu provincia para calcular distancias y
          destacar a tu gente en el mapa. No usamos cookies de publicidad ni de seguimiento.
        </p>
      </Section>

      <Section title="Tus derechos">
        <p>
          Puedes pedir ver, corregir o borrar tus datos escribiendo a{" "}
          <a href={`mailto:${CONTACT}`} className="underline">
            {CONTACT}
          </a>
          . Si crees que no lo hacemos bien, puedes reclamar ante la Agencia Española de Protección
          de Datos (aepd.es).
        </p>
      </Section>

      <section id="borrar" className="card mt-8 scroll-mt-6 p-5">
        <h2 className="font-display text-2xl font-extrabold">Borrar mis datos</h2>
        <p className="mt-1 text-gris">
          Te enviamos un enlace a tu correo. Al pulsarlo, borramos todos tus datos.
        </p>
        <DeleteRequest />
      </section>

      <p className="mt-8 text-sm text-gris">
        Datos de ciudades y códigos postales: GeoNames (CC BY 4.0). Mapa: © OpenStreetMap,
        OpenMapTiles, OpenFreeMap.
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      <div className="mt-2 leading-relaxed">{children}</div>
    </section>
  );
}
