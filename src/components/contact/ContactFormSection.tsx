"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ContactForm } from "./ContactForm";

/** Pré-sélectionne le type de projet depuis l'URL (ex. /contact?projet=portraits-equipe). */
function ContactFormFromUrl() {
  const projectType = useSearchParams().get("projet") ?? "";
  return <ContactForm key={projectType} initialProjectType={projectType} />;
}

export function ContactFormSection() {
  return (
    <Suspense fallback={<ContactForm />}>
      <ContactFormFromUrl />
    </Suspense>
  );
}
