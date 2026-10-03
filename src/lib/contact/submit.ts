/**
 * Envoi du formulaire de contact depuis le navigateur, via Web3Forms
 * (https://web3forms.com) — le site étant statique, il n'a pas de serveur.
 *
 * La clé d'accès Web3Forms est publique par conception : elle permet
 * uniquement d'envoyer des messages vers l'adresse e-mail associée à la clé,
 * jamais de lire quoi que ce soit. Elle est fournie au build via
 * NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY (variable du dépôt GitHub).
 */
import { siteConfig } from "@/config/site";
import { projectTypeLabel, type ContactValues } from "./schema";

const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";
const ENDPOINT = "https://api.web3forms.com/submit";

export type SubmitResult = { ok: true; simulated?: boolean } | { ok: false; message: string };

const FALLBACK_MESSAGE = "Réessayez dans un instant ou contactez-moi directement par e-mail.";

export async function submitContact(v: ContactValues): Promise<SubmitResult> {
  const name = `${v.firstName} ${v.lastName}`.trim();
  const type = projectTypeLabel(v.projectType);

  if (!ACCESS_KEY) {
    if (process.env.NODE_ENV !== "production") {
      // Développement sans clé : le message est affiché dans la console du navigateur.
      console.info("[contact] Message NON envoyé (NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY manquante) :", { name, type, ...v });
      return { ok: true, simulated: true };
    }
    return { ok: false, message: "Le formulaire n'est pas encore activé. Contactez-moi directement par e-mail." };
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `Nouvelle demande — ${type} — ${name}`.slice(0, 180),
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
