import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { AccessCodeForm } from "@/components/galleries/AccessCodeForm";
import { GalleryFinder } from "@/components/galleries/GalleryFinder";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RouteSteps } from "@/components/sections/RouteSteps";
import { ButtonLink } from "@/components/ui/Button";
import { SectionLabel, SectionStamp } from "@/components/ui/SectionLabel";
import { getAccessCodeIndex, getGalleryEntries, getGalleryFilters } from "@/lib/gallery-index";
import { getAlbums, getCategories } from "@/lib/albums";
import { inArea, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Retrouver ses photos de match",
  description: `Retrouvez vos photos en quelques secondes : recherchez une équipe, un match, une date ou une catégorie, puis demandez vos images en haute définition. Photographe sportif${inArea}.`,
  path: "/galeries",
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

const STEPS = [
  { title: "Cherchez", body: "Le nom de votre équipe, de l'adversaire, une date ou une compétition." },
  { title: "Ouvrez l'album", body: "Toutes les photos du match, en vue éditoriale ou en planche." },
  { title: "Choisissez", body: "Agrandissez une photo, partagez son lien permanent." },
  { title: "Récupérez-la", body: "« Demander cette photo » : je vous envoie la haute définition." },
];

/** Accès aux photos : le parcours de celles et ceux qui cherchent leurs images. */
export default function GalleriesPage() {
  const entries = getGalleryEntries();
  // Suggestions : les équipes des derniers matchs, puis des catégories.
  const suggestions = [...new Set([...getAlbums().slice(0, 3).flatMap((a) => (a.match ? [a.match.away] : [])), ...getCategories().map((c) => c.title)])].slice(0, 6);

  return (
    <>
      <header className="container-wide pt-[calc(var(--header-height)+clamp(2rem,1rem+3vw,4rem))] pb-[clamp(1.75rem,3vw,2.75rem)]">
        <Breadcrumbs items={[{ name: "Retrouver mes photos", path: "/galeries" }]} />
        <div className="anim-rise mt-8 md:mt-10" style={delay(120)}>
          <SectionLabel>Accès aux photos</SectionLabel>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h1 className="t-h1 text-[clamp(2.25rem,0.8rem+4.6vw,5.5rem)] text-linen lg:col-span-8">
            <span className="line-mask">
              <span style={delay(180)}>Vos photos,</span>
            </span>
            <span className="line-mask">
              <span style={delay(260)} className="text-taupe">
                en un instant.
              </span>
            </span>
          </h1>
          <p className="anim-rise t-lead text-taupe lg:col-span-4" style={delay(420)}>
            Un match, une équipe, une date : tapez ce que vous cherchez, les albums s&apos;affichent pendant la saisie.
          </p>
        </div>
      </header>

      <section aria-label="Rechercher un album" className="container-wide anim-rise pb-[var(--section-space-sm)]" style={delay(480)}>
        <GalleryFinder entries={entries} filters={getGalleryFilters()} suggestions={suggestions} />
      </section>

      <section aria-labelledby="how-title" className="container-wide section-sm">
        <SectionStamp id="how-title" index="01" meta="4 étapes" className="mb-12 md:mb-16">
          Mode d&apos;emploi
        </SectionStamp>
        <RouteSteps steps={STEPS} />
        <div className="mt-[clamp(3rem,6vw,5rem)] grid gap-6 lg:grid-cols-2">
          <AccessCodeForm codes={getAccessCodeIndex()} />
          <div className="flex flex-col justify-between gap-6 rounded-[var(--radius-card)] bg-wash p-6 md:p-8">
            <div>
              <p className="text-lg font-medium tracking-[-0.015em] text-linen">Votre match n&apos;est pas en ligne ?</p>
              <p className="mt-1 t-small text-taupe">
                Toutes les rencontres ne sont pas publiées. Indiquez l&apos;équipe et la date : je vérifie si j&apos;ai des images pour vous.
              </p>
            </div>
            <div>
              <ButtonLink href="/contact/?projet=demande-photo" variant="outline">
                Faire une demande
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
