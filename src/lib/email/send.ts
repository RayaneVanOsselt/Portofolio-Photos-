import "server-only";

/**
 * Envoi d'e-mails transactionnels via l'API REST de Resend (https://resend.com).
 * Pas de SDK : un simple appel HTTPS. Pour changer de fournisseur
 * (Postmark, SendGrid, Mailgun…), seule cette fonction est à réécrire.
 *
 * Variables d'environnement (jamais exposées au navigateur) :
 *   RESEND_API_KEY  clé API Resend
 *   EMAIL_TO        destinataire(s), séparés par des virgules
 *   EMAIL_FROM      expéditeur vérifié, ex. "Raï VO Capture 0808 <contact@votredomaine.be>"
 */

export type OutgoingEmail = {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type SendResult = { ok: true; id?: string; simulated?: boolean } | { ok: false; reason: "not-configured" | "provider-error" };

export function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = (process.env.EMAIL_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const from = process.env.EMAIL_FROM?.trim();
  return { apiKey, to, from, configured: Boolean(apiKey && to.length && from) };
}

export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const { apiKey, to, from, configured } = getEmailConfig();

  if (!configured) {
    if (process.env.NODE_ENV !== "production") {
      // Développement sans clé : on affiche l'e-mail dans le terminal au lieu de l'envoyer.
      console.info(`\n[contact] E-mail NON envoyé (RESEND_API_KEY / EMAIL_TO / EMAIL_FROM manquants — voir .env.example)\n` + `Sujet : ${email.subject}\n${email.text}\n`);
      return { ok: true, simulated: true };
    }
    console.error("[contact] Configuration e-mail incomplète : RESEND_API_KEY, EMAIL_TO et EMAIL_FROM sont requis.");
    return { ok: false, reason: "not-configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[contact] Resend a répondu ${response.status} : ${await response.text().catch(() => "")}`);
      return { ok: false, reason: "provider-error" };
    }
    const data = (await response.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (error) {
    console.error("[contact] Échec de l'appel à Resend :", error);
    return { ok: false, reason: "provider-error" };
  }
}
