"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ContactForm } from "./ContactForm";

/**
 * Pré-remplit le formulaire depuis l'URL :
 * - ?projet=portraits-equipe → type de projet
 * - ?photo=<titre>&lien=<url> → demande d'une photo précise (bouton de la visionneuse)
 */
function ContactFormFromUrl() {
  const params = useSearchParams();
  const photo = params.get("photo")?.slice(0, 200) ?? "";
  const link = params.get("lien")?.slice(0, 500) ?? "";
  const projectType = photo ? "demande-photo" : (params.get("projet") ?? "");
  // « n° 2, 5, 9 — … » : une sélection de plusieurs photos (favoris de la galerie).
  const several = /n°\s*\d+\s*,/.test(photo);
  const message = photo
    ? `Bonjour,\n\nJe souhaiterais obtenir ${several ? "ces photos" : "cette photo"} : ${photo}${link ? `\n${link}` : ""}\n\nUsage prévu : `
    : "";
  return <ContactForm key={`${projectType}|${photo}`} initialProjectType={projectType} initialMessage={message} />;
}

export function ContactFormSection() {
  return (
    <Suspense fallback={<ContactForm />}>
      <ContactFormFromUrl />
    </Suspense>
  );
}
