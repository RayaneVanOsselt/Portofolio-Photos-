/**
 * Validation du formulaire de contact — partagée par le navigateur (retour
 * immédiat) et le serveur (seule validation qui fait foi). Aucune dépendance.
 */
import { services } from "@/data/services";

export const PROJECT_TYPES = [
  ...services.map((s) => ({ value: s.slug, label: s.title })),
  { value: "demande-photo", label: "Demande d'une photo (joueur, parent, club)" },
  { value: "autre", label: "Autre projet" },
] as const;

export const CONTACT_FIELDS = ["lastName", "firstName", "email", "phone", "projectType", "projectDate", "budget", "message", "consent"] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactValues = Record<ContactField, string>;
export type FieldErrors = Partial<Record<ContactField, string>>;

export const LIMITS = {
  name: 80,
  email: 254,
  phone: 30,
  budget: 80,
  messageMin: 20,
  messageMax: 5000,
};

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{6,30}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Nettoie une valeur : caractères de contrôle retirés, fins de ligne normalisées, espaces superflus. */
export function sanitize(value: unknown, { multiline = false } = {}): string {
  if (typeof value !== "string") return "";
  let v = value.replace(/\r\n?/g, "\n").normalize("NFC");
  v = multiline ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") : v.replace(/[\u0000-\u001F\u007F]/g, " ");
  return v.trim();
}

export function readValues(source: FormData | Record<string, unknown>): ContactValues {
  const get = (key: string) => (source instanceof FormData ? source.get(key) : source[key]);
  return {
    lastName: sanitize(get("lastName")),
    firstName: sanitize(get("firstName")),
    email: sanitize(get("email")).toLowerCase(),
    phone: sanitize(get("phone")),
    projectType: sanitize(get("projectType")),
    projectDate: sanitize(get("projectDate")),
    budget: sanitize(get("budget")),
    message: sanitize(get("message"), { multiline: true }),
    consent: get("consent") === "on" || get("consent") === "true" ? "on" : "",
  };
}

export function validateField(field: ContactField, v: ContactValues): string | undefined {
  const value = v[field];
  switch (field) {
    case "lastName":
    case "firstName": {
      const label = field === "lastName" ? "votre nom" : "votre prénom";
      if (!value) return `Indiquez ${label}.`;
      if (value.length > LIMITS.name) return `${LIMITS.name} caractères maximum.`;
      return;
    }
    case "email":
      if (!value) return "Indiquez votre adresse e-mail.";
      if (value.length > LIMITS.email || !EMAIL_RE.test(value)) return "Cette adresse e-mail ne semble pas valide.";
      return;
    case "phone":
      if (value && !PHONE_RE.test(value)) return "Ce numéro ne semble pas valide.";
      return;
    case "projectType":
      if (!value) return "Choisissez un sujet.";
      if (!PROJECT_TYPES.some((t) => t.value === value)) return "Type de projet inconnu.";
      return;
    case "projectDate": {
      if (!value) return;
      if (!DATE_RE.test(value) || Number.isNaN(Date.parse(value))) return "Date invalide.";
      return;
    }
    case "budget":
      if (value.length > LIMITS.budget) return `${LIMITS.budget} caractères maximum.`;
      return;
    case "message":
      if (!value) return "Décrivez votre projet en quelques lignes.";
      if (value.length < LIMITS.messageMin) return `Quelques mots de plus, s'il vous plaît (${LIMITS.messageMin} caractères minimum).`;
      if (value.length > LIMITS.messageMax) return `${LIMITS.messageMax} caractères maximum.`;
      return;
    case "consent":
      if (value !== "on") return "Votre accord est nécessaire pour que je puisse vous répondre.";
      return;
  }
}

export function validateContact(values: ContactValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of CONTACT_FIELDS) {
    const error = validateField(field, values);
    if (error) errors[field] = error;
  }
  return errors;
}

export function projectTypeLabel(value: string) {
  return PROJECT_TYPES.find((t) => t.value === value)?.label ?? value;
}
