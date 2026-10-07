import "server-only";
import { config, EMAIL_ENABLED } from "./config";

/** Sends through Resend's HTTP API. No-op (returns false) when not configured. */
export async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!EMAIL_ENABLED) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: config.emailFrom, to, subject, html, text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return true;
}

const layout = (body: string) => `
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1d1424">
  <p style="font-size:28px;font-weight:800;color:#e5322d;margin:0 0 16px">Vente</p>
  ${body}
  <p style="margin-top:32px;font-size:13px;color:#6f6676">Vente pa'cá · ${config.siteUrl.replace(/^https?:\/\//, "")}</p>
</div>`;

const button = (href: string, label: string) =>
  `<p><a href="${href}" style="display:inline-block;background:#e5322d;color:#fff;font-weight:800;padding:14px 22px;border-radius:12px;text-decoration:none">${label}</a></p>`;

export function confirmEmail(link: string) {
  return {
    subject: "Confirma tu correo para aparecer en Vente",
    html: layout(`
      <p>Pulsa el botón para confirmar tu correo y aparecer en el mapa de Vente.</p>
      ${button(link, "Confirmar mi correo")}
      <p style="font-size:14px;color:#6f6676">Si no has sido tú, ignora este correo y borraremos los datos en 7 días.</p>`),
    text: `Confirma tu correo para aparecer en el mapa de Vente: ${link}\n\nSi no has sido tú, ignora este correo.`,
  };
}

export function alreadyInEmail() {
  return {
    subject: "Este correo ya está en Vente",
    html: layout(`
      <p>Alguien ha intentado apuntarse otra vez con este correo. Ya estás en el mapa, así que no tienes que hacer nada.</p>
      <p>Si quieres borrar tus datos, puedes hacerlo aquí:</p>
      ${button(`${config.siteUrl}/privacidad#borrar`, "Borrar mis datos")}`),
    text: `Este correo ya está en Vente. Para borrar tus datos: ${config.siteUrl}/privacidad#borrar`,
  };
}

export function deleteEmail(link: string) {
  return {
    subject: "Borrar tus datos de Vente",
    html: layout(`
      <p>Nos has pedido borrar tus datos. Pulsa el botón para borrarlos y dejar de contar en el mapa.</p>
      ${button(link, "Borrar mis datos")}
      <p style="font-size:14px;color:#6f6676">El enlace caduca en 24 horas. Si no lo has pedido tú, ignora este correo.</p>`),
    text: `Para borrar tus datos de Vente, abre este enlace (caduca en 24 h): ${link}`,
  };
}
