import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { RouteSteps } from "@/components/sections/RouteSteps";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { services } from "@/data/services";
import { getPhotoById } from "@/lib/albums";
import { inArea, pageMetadata } from "@/lib/seo";
import { pad } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: `Services photo sport${inArea} — matchs, équipes, clubs`,
  description: `Couverture de match, portraits d'équipe, contenus pour clubs et partenaires, événements sportifs. Photographe sportif${inArea}, devis sur demande.`,
  path: "/services",
});

/** Déroulé type d'une collaboration (générique, sans engagement chiffré). */
const STEPS = [
  { title: "Échange", body: "Vous décrivez le projet : date, lieu, équipe, usages prévus des images." },
  { title: "Proposition", body: "Je reviens vers vous avec une proposition adaptée et un devis." },
  { title: "Prise de vue", body: "Le jour J, je couvre l'événement en restant discret et attentif au jeu." },
  { title: "Livraison", body: "Une sélection retouchée, livrée dans une galerie en ligne prête à partager." },
];

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        crumbs={[{ name: "Services", path: "/services" }]}
        kicker="Prestations"
        title="Services"
        intro={<p>Des prestations pensées pour les clubs, les fédérations, les partenaires et les joueurs. Chaque projet fait l&apos;objet d&apos;un devis personnalisé.</p>}
      />

      <section aria-label="Liste des prestations" className="container-wide pb-[var(--section-space)]">
        {services.map((service, i) => {
          const photo = getPhotoById(service.photoId, "site/services");
          const reversed = i % 2 === 1;
          return (
            <article
              key={service.slug}
              id={service.slug}
              aria-labelledby={`${service.slug}-title`}
              className="grid scroll-mt-28 gap-10 border-t border-line pt-6 pb-[clamp(3.5rem,7vw,7rem)] md:grid-cols-12 md:gap-8"
            >
              <div className={`md:col-span-6 ${reversed ? "md:order-2 md:col-start-7" : ""}`} data-reveal="image">
                {photo ? (
                  <PhotoImage photo={photo} fill sizes="(min-width: 768px) 50vw, 100vw" className={`${i % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"} rounded-[var(--radius-card)]`} />
                ) : null}
              </div>
              <div className={`flex flex-col md:col-span-5 ${reversed ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                <div className="flex items-center justify-between gap-4 t-mono">
                  <span className="text-flamingo">({pad(i + 1)})</span>
                  <span className="text-ash">{service.format}</span>
                </div>
                <h2 id={`${service.slug}-title`} className="t-h2 mt-8 text-linen" data-reveal>
                  {service.title}
                </h2>
                <p className="mt-6 t-lead text-taupe" data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
                  {service.description}
                </p>
                <ul className="mt-8 space-y-3 border-t border-line pt-6" data-reveal style={{ "--reveal-delay": "180ms" } as CSSProperties}>
                  {service.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-3 t-small text-linen/90">
                      <Check size={16} className="mt-0.5 shrink-0 text-flamingo" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <ButtonLink href={`/contact?projet=${service.slug}`} variant="outline">
                    Demander un devis
                  </ButtonLink>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="process-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="process-title" index="01" meta="Une collaboration" className="mb-12 md:mb-16">
          Déroulé
        </SectionStamp>
        <RouteSteps steps={STEPS} />
      </section>

      <ClosingCta stamp="Devis" title="Un projet *en tête ?*" body="Les tarifs dépendent du format et de la durée : chaque demande reçoit une réponse personnalisée." cta={{ label: "Demander un devis", href: "/contact" }} />
    </>
  );
}
