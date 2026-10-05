"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Check, ChevronDown } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import {
  CONTACT_FIELDS,
  LIMITS,
  PROJECT_TYPES,
  readValues,
  validateContact,
  validateField,
  type ContactField,
  type ContactValues,
  type FieldErrors,
} from "@/lib/contact/schema";
import { submitContact } from "@/lib/contact/submit";

const EMPTY: ContactValues = Object.fromEntries(CONTACT_FIELDS.map((f) => [f, ""])) as ContactValues;

/** Délai minimal entre l'affichage du formulaire et l'envoi (les robots remplissent instantanément). */
const MIN_FILL_TIME_MS = 2500;

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "success"; simulated?: boolean } | { kind: "error"; message: string };

export function ContactForm({ initialProjectType = "", initialMessage = "" }: { initialProjectType?: string; initialMessage?: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [values, setValues] = useState<ContactValues>(() => ({
    ...EMPTY,
    projectType: PROJECT_TYPES.some((t) => t.value === initialProjectType) ? initialProjectType : "",
    message: initialMessage,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const startedAt = useRef(0);

  // Horodatage anti-robot, remis à zéro à chaque nouveau formulaire.
  useEffect(() => {
    if (status.kind === "idle") startedAt.current = Date.now();
  }, [status.kind]);

  const pending = status.kind === "sending";

  const update = (field: ContactField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (attempted || errors[field]) setErrors((e) => ({ ...e, [field]: validateField(field, readValues(next)) }));
  };

  const onBlur = (field: ContactField) => {
    if (!values[field] && !attempted) return;
    setErrors((e) => ({ ...e, [field]: validateField(field, readValues(values)) }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setAttempted(true);
    const clean = readValues(values);
    const found = validateContact(clean);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = CONTACT_FIELDS.find((f) => found[f]);
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    // Robot probable (champ piège rempli ou envoi instantané) : on simule un succès sans rien envoyer.
    if (honeypotRef.current?.value || Date.now() - startedAt.current < MIN_FILL_TIME_MS) {
      setStatus({ kind: "success" });
      return;
    }

    setStatus({ kind: "sending" });
    const result = await submitContact(clean);
    setStatus(result.ok ? { kind: "success", simulated: result.simulated } : { kind: "error", message: result.message });
  };

  // Après un succès, le formulaire est remplacé par une confirmation.
  if (status.kind === "success") {
    return (
      <div role="status" className="success-in flex min-h-[32rem] flex-col justify-center">
        <span className="grid size-14 place-items-center rounded-full bg-flamingo text-ink">
          <Check size={26} />
        </span>
        <p className="mt-10 t-mono text-flamingo">+ Message envoyé</p>
        <h2 className="t-h2 mt-4 text-linen">
          Merci pour <span className="text-taupe">votre message.</span>
        </h2>
        <p className="mt-6 max-w-md t-lead text-taupe">Je reviens vers vous dès que possible.</p>
        {status.simulated ? (
          <p className="mt-6 rounded-[var(--radius-sm)] border border-dashed border-flamingo/60 p-4 t-small text-flamingo">
            Mode développement : le message a été affiché dans la console du navigateur au lieu d&apos;être envoyé. Renseignez NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY pour l&apos;envoi réel.
          </p>
        ) : null}
        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setValues(EMPTY);
              setAttempted(false);
              setErrors({});
              setStatus({ kind: "idle" });
            }}
          >
            Envoyer un autre message
          </Button>
          <Link href="/albums" className="inline-flex h-12 items-center px-5 text-[0.9375rem] text-taupe hover:text-linen">
            Retour aux albums
          </Link>
        </div>
      </div>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} noValidate aria-describedby="form-status" className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
      {/* Anti-spam : champ piège invisible + horodatage */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Ne pas remplir ce champ</label>
        <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div id="form-status" aria-live="polite" className="sm:col-span-2 empty:hidden">
        {status.kind === "error" ? (
          <div role="alert" className="rounded-[var(--radius-sm)] border border-danger/40 bg-danger/10 p-4 t-small text-linen">
            <p className="font-medium text-linen">Une erreur est survenue.</p>
            <p className="mt-1 text-taupe">
              {status.message}
              {siteConfig.contact.email ? (
                <>
                  {" "}
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-linen underline underline-offset-4">
                    {siteConfig.contact.email}
                  </a>
                </>
              ) : null}
            </p>
          </div>
        ) : attempted && errorCount ? (
          <p className="t-small text-danger">
            {errorCount === 1 ? "Un champ est à corriger." : `${errorCount} champs sont à corriger.`}
          </p>
        ) : null}
      </div>

      <Field id="lastName" label="Nom" error={errors.lastName}>
        <input {...inputProps("lastName", values, errors, update, onBlur)} type="text" autoComplete="family-name" maxLength={LIMITS.name} required />
      </Field>
      <Field id="firstName" label="Prénom" error={errors.firstName}>
        <input {...inputProps("firstName", values, errors, update, onBlur)} type="text" autoComplete="given-name" maxLength={LIMITS.name} required />
      </Field>
      <Field id="email" label="E-mail" error={errors.email}>
        <input {...inputProps("email", values, errors, update, onBlur)} type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} required />
      </Field>
      <Field id="phone" label="Téléphone" optional error={errors.phone}>
        <input {...inputProps("phone", values, errors, update, onBlur)} type="tel" autoComplete="tel" inputMode="tel" maxLength={LIMITS.phone} />
      </Field>
      <Field id="projectType" label="Sujet" error={errors.projectType}>
        <div className="relative">
          <select {...inputProps("projectType", values, errors, update, onBlur)} required className={`${fieldClass} appearance-none pr-8 ${values.projectType ? "" : "text-ash"}`}>
            <option value="" disabled>
              Sélectionner…
            </option>
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-ink text-linen">
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-taupe" />
        </div>
      </Field>
      <Field id="projectDate" label="Date du projet" optional error={errors.projectDate}>
        <input {...inputProps("projectDate", values, errors, update, onBlur)} type="date" className={`${fieldClass} [color-scheme:dark]`} />
      </Field>
      <Field id="budget" label="Budget" optional error={errors.budget} className="sm:col-span-2">
        <input {...inputProps("budget", values, errors, update, onBlur)} type="text" maxLength={LIMITS.budget} placeholder="Une fourchette ou « à définir »" />
      </Field>
      <Field id="message" label="Message" error={errors.message} className="sm:col-span-2" hint={`${values.message.length} / ${LIMITS.messageMax}`}>
        <textarea {...inputProps("message", values, errors, update, onBlur)} rows={6} maxLength={LIMITS.messageMax} required placeholder="Le contexte, l'équipe, le lieu, ce dont vous avez besoin…" className={`${fieldClass} resize-y`} />
      </Field>

      <div className="sm:col-span-2">
        <label htmlFor="consent" className="group flex cursor-pointer items-start gap-4">
          <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              checked={values.consent === "on"}
              onChange={(e) => update("consent", e.target.checked ? "on" : "")}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? "consent-error" : undefined}
              className="peer absolute inset-0 cursor-pointer appearance-none rounded-[4px] border border-line-strong transition-colors checked:border-flamingo checked:bg-flamingo"
            />
            <Check size={14} className="pointer-events-none relative text-ink opacity-0 peer-checked:opacity-100" />
          </span>
          <span className="t-small text-taupe">
            J&apos;accepte que mes données soient utilisées afin d&apos;être recontacté(e) concernant ma demande.{" "}
            <Link href="/privacy" className="text-linen underline underline-offset-4">
              Politique de confidentialité
            </Link>
          </span>
        </label>
        {errors.consent ? (
          <p id="consent-error" className="mt-2 pl-9 t-small text-danger">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="signal" size="lg" icon disabled={pending} aria-disabled={pending}>
          {pending ? "Envoi en cours…" : "Envoyer le message"}
        </Button>
        <p className="t-mono text-ash">Champs requis sauf « facultatif »</p>
      </div>
    </form>
  );
}

const fieldClass =
  "w-full border-0 border-b border-line-strong bg-transparent px-0 py-3 text-[1.0625rem] text-linen outline-none transition-colors placeholder:text-ash hover:border-taupe focus:border-flamingo aria-[invalid=true]:border-danger";

function inputProps(
  field: ContactField,
  values: ContactValues,
  errors: FieldErrors,
  update: (field: ContactField, value: string) => void,
  onBlur: (field: ContactField) => void,
) {
  return {
    id: field,
    name: field,
    value: values[field],
    onChange: (e: { target: { value: string } }) => update(field, e.target.value),
    onBlur: () => onBlur(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: fieldClass,
  };
}

function Field({
  id,
  label,
  optional,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="t-mono text-taupe">
          {label}
          {optional ? <span className="ml-2 tracking-[0.06em] text-ash normal-case">(facultatif)</span> : null}
        </label>
        {hint ? <span className="t-mono text-ash">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 t-small text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
