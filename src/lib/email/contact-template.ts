import "server-only";
import { siteConfig } from "@/config/site";
import { projectTypeLabel, type ContactValues } from "@/lib/contact/schema";

/** Échappement HTML : aucune donnée saisie n'est injectée telle quelle dans l'e-mail. */
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function buildContactEmail(v: ContactValues) {
  const name = `${v.firstName} ${v.lastName}`.trim();
  const type = projectTypeLabel(v.projectType);
  const date = v.projectDate ? new Intl.DateTimeFormat("fr-BE", { dateStyle: "long" }).format(new Date(v.projectDate)) : "—";

  const rows: [string, string][] = [
    ["Nom", name],
    ["E-mail", v.email],
    ["Téléphone", v.phone || "—"],
    ["Type de projet", type],
    ["Date du projet", date],
    ["Budget", v.budget || "—"],
  ];

  // Sujet sur une seule ligne (pas d'injection d'en-têtes possible).
  const subject = `Nouvelle demande — ${type} — ${name}`.replace(/[\r\n]+/g, " ").slice(0, 180);

  const text = [
    `Nouvelle demande reçue via ${siteConfig.name}`,
    "",
    ...rows.map(([k, val]) => `${k} : ${val}`),
    "",
    "Message :",
    v.message,
    "",
    "—",
    `Répondre directement à cet e-mail écrira à ${v.email}.`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;padding:32px;background:#011d1c;font-family:Helvetica,Arial,sans-serif;color:#edfffe">
  <table role="presentation" width="100%" style="max-width:600px;margin:0 auto;border-collapse:collapse">
    <tr><td style="padding-bottom:24px;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#bbc7c6">${escapeHtml(siteConfig.name)} — nouvelle demande</td></tr>
    <tr><td style="padding-bottom:28px;font-size:28px;line-height:1.1;color:#ffffff">${escapeHtml(type)}<br><span style="color:#fde9ff">${escapeHtml(name)}</span></td></tr>
    ${rows
      .map(
        ([k, val]) =>
          `<tr><td style="padding:10px 0;border-top:1px solid rgba(237,255,254,.12)"><span style="display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6">${escapeHtml(k)}</span><span style="font-size:15px;color:#ffffff">${escapeHtml(val)}</span></td></tr>`,
      )
      .join("")}
    <tr><td style="padding:20px 0 0;border-top:1px solid rgba(237,255,254,.12)"><span style="display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#bbc7c6">Message</span>
      <p style="font-size:15px;line-height:1.6;color:#edfffe;white-space:pre-wrap;margin:8px 0 0">${escapeHtml(v.message)}</p></td></tr>
    <tr><td style="padding-top:32px;font-size:12px;color:#bbc7c6">Répondez directement à cet e-mail pour écrire à ${escapeHtml(v.email)}.</td></tr>
  </table>
</body></html>`;

  return { subject, text, html, replyTo: v.email };
}
