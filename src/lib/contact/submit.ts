/**
 * Envoi du formulaire de contact depuis le navigateur — le site étant statique,
 * il n'a pas de serveur. Deux services possibles :
 *
 * 1. EmailJS (https://www.emailjs.com) — recommandé. Trois valeurs publiques,
 *    fournies au build (variables du dépôt GitHub, voir README « Formulaire de contact ») :
 *    NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID et
 *    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY. Variables envoyées au modèle d'e-mail :
 *    {{title}} {{name}} {{email}} {{phone}} {{project_type}} {{project_date}}
 *    {{budget}} {{message}} {{time}}.
 * 2. Web3Forms (https://web3forms.com) — ancien réglage, toujours accepté :
 *    NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY.
 *
 * Ces clés sont publiques par conception : elles permettent seulement d'envoyer
 * un message vers votre adresse, jamais de lire quoi que ce soit.
 */
import { siteConfig } from "@/config/site";
import { projectTypeLabel, type ContactValues } from "./schema";

const EMAILJS = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
};
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

const useEmailJs = Boolean(EMAILJS.serviceId && EMAILJS.templateId && EMAILJS.publicKey);

/** Service qui transmet les messages (cité dans la politique de confidentialité). */
export const CONTACT_PROVIDER = useEmailJs || !WEB3FORMS_KEY ? "EmailJS" : "Web3Forms";

export type SubmitResult = { ok: true; simulated?: boolean } | { ok: false; message: string };

const FALLBACK_MESSAGE = "Réessayez dans un instant ou contactez-moi directement par e-mail.";

export async function submitContact(v: ContactValues): Promise<SubmitResult> {
  const name = `${v.firstName} ${v.lastName}`.trim();
  const type = projectTypeLabel(v.projectType);
  const subject = `Nouvelle demande — ${type} — ${name}`.slice(0, 180);

  if (!useEmailJs && !WEB3FORMS_KEY) {
    if (process.env.NODE_ENV !== "production") {
      // Développement sans clé : le message est affiché dans la console du navigateur.
      console.info("[contact] Message NON envoyé (clés EmailJS manquantes) :", { name, type, ...v });
      return { ok: true, simulated: true };
    }
    return { ok: false, message: "Le formulaire n'est pas encore activé. Contactez-moi directement par e-mail." };
  }

  try {
    if (useEmailJs) {
      // API REST d'EmailJS : même résultat que leur bibliothèque, sans rien installer.
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS.serviceId,
          template_id: EMAILJS.templateId,
          user_id: EMAILJS.publicKey,
          template_params: {
            title: subject,
            name,
            email: v.email,
            reply_to: v.email,
            phone: v.phone || "—",
            project_type: type,
            project_date: v.projectDate || "—",
            budget: v.budget || "—",
            message: v.message,
            time: new Date().toLocaleString("fr-BE", { timeZone: "Europe/Brussels" }),
            site: siteConfig.name,
          },
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) {
        console.warn("[contact] EmailJS a refusé l'envoi :", response.status, await response.text().catch(() => ""));
        return { ok: false, message: FALLBACK_MESSAGE };
      }
      return { ok: true };
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject,
        from_name: siteConfig.name,
        replyto: v.email,
        botcheck: false,
        Nom: name,
        "E-mail": v.email,
        Téléphone: v.phone || "—",
        "Type de projet": type,
        "Date du projet": v.projectDate || "—",
        Budget: v.budget || "—",
        Message: v.message,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await response.json().catch(() => ({}))) as { success?: boolean };
    if (!response.ok || !data.success) return { ok: false, message: FALLBACK_MESSAGE };
    return { ok: true };
  } catch {
    return { ok: false, message: FALLBACK_MESSAGE };
  }
}
