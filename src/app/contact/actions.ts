"use server";

import { headers } from "next/headers";
import { readValues, validateContact, type FieldErrors } from "@/lib/contact/schema";
import { isRateLimited } from "@/lib/contact/rate-limit";
import { buildContactEmail } from "@/lib/email/contact-template";
import { sendEmail } from "@/lib/email/send";

export type ContactState =
  | { status: "idle" }
  | { status: "success"; simulated?: boolean }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "error"; message: string };

/** Délai minimal entre l'affichage du formulaire et l'envoi (les robots remplissent instantanément). */
const MIN_FILL_TIME_MS = 2500;

/**
 * Traitement serveur du formulaire de contact.
 * Ne fait jamais confiance au navigateur : tout est revalidé ici.
 */
export async function submitContact(_previous: ContactState, formData: FormData): Promise<ContactState> {
  // 1. Pot de miel : champ invisible que seuls les robots remplissent.
  //    On répond « succès » pour ne pas leur indiquer qu'ils ont été repérés.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success" };
  }

  // 2. Remplissage trop rapide pour un humain.
  const startedAt = Number(formData.get("startedAt"));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_TIME_MS) {
    return { status: "success" };
  }

  // 3. Limitation du nombre d'envois par adresse IP.
  const requestHeaders = await headers();
  const ip = (requestHeaders.get("x-forwarded-for")?.split(",")[0] ?? requestHeaders.get("x-real-ip") ?? "unknown").trim();
  if (isRateLimited(ip)) {
    return {
      status: "error",
      message: "Trop de messages envoyés en peu de temps. Réessayez dans quelques minutes ou écrivez-moi directement par e-mail.",
    };
  }

  // 4. Nettoyage + validation.
  const values = readValues(formData);
  const errors = validateContact(values);
  if (Object.keys(errors).length) {
    return { status: "invalid", errors };
  }

  // 5. Envoi.
  const result = await sendEmail(buildContactEmail(values));
  if (!result.ok) {
    return {
      status: "error",
      message: "Une erreur est survenue. Réessayez ou contactez-moi directement par e-mail.",
    };
  }

  return { status: "success", simulated: "simulated" in result ? result.simulated : undefined };
}
