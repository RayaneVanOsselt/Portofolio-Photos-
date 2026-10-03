import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { services } from "@/data/services";
import { getPhotoById } from "@/lib/portfolio";
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
        title="Ser*vices*"
        intro={<p>Des prestations pensées pour les clubs, les fédérations, les partenaires et les joueurs. Chaque projet fait l&apos;objet d&apos;un devis personnalisé.</p>}
      />

      <section aria-label="Liste des prestations" className="container-wide pb-[var(--section-space)]">
        {services.map((service, i) => {
          const photo = getPhotoById(service.photoId);
          const reversed = i % 2 === 1;
          return (
            <article
              key={service.slug}
              id={service.slug}
              aria-labelledby={`${service.slug}-title`}
              className="grid scroll-mt-28 gap-10 border-t border-line pt-10 pb-[clamp(4rem,8vw,8rem)] md:grid-cols-12 md:gap-8"
            >
              <div className={`md:col-span-6 ${reversed ? "md:order-2 md:col-start-7" : ""}`} data-reveal="image">
                <PhotoImage photo={photo} fill sizes="(min-width: 768px) 50vw, 100vw" className={i % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"} />
              </div>
              <div className={`flex flex-col md:col-span-5 ${reversed ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
                <div className="flex items-center gap-4">
                  <span className="t-caption t-tabular text-phosphor">{pad(i + 1)}</span>
                  <span className="rounded-[var(--radius-sm)] bg-kelp px-2.5 py-1 t-caption text-mist">{service.format}</span>
                </div>
                <h2 id={`${service.slug}-title`} className="t-h2 mt-6 text-platinum" data-reveal>
                  {service.title}
                </h2>
                <p className="mt-6 t-lead text-silver" data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
                  {service.description}
                </p>
                <ul className="mt-8 space-y-3 border-t border-line pt-6" data-reveal style={{ "--reveal-delay": "180ms" } as CSSProperties}>
                  {service.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-3 t-small text-mist">
                      <Check size={16} className="mt-0.5 shrink-0 text-phosphor" />
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-wrap gap-3">
                  <ButtonLink href={`/contact?projet=${service.slug}`} variant={i === 0 ? "aurora" : "solid"}>
                    Demander un devis
                  </ButtonLink>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="process-title" className="section-sm bg-deep">
        <div className="container-wide">
          <SectionLabel>Déroulé</SectionLabel>
          <h2 id="process-title" className="t-h2 mt-6 max-w-[16ch] text-platinum" data-reveal>
            Comment se passe <span className="t-serif text-phosphor">une collaboration</span>
          </h2>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-lg)] bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-deep p-8 lg:p-10" data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
                <span className="text-[clamp(2.5rem,1.5rem+2.5vw,4.5rem)] leading-none font-medium tracking-[-0.046em] text-phosphor t-tabular">{pad(i + 1)}</span>
                <h3 className="mt-8 text-xl font-medium tracking-[-0.02em] text-platinum">{step.title}</h3>
                <p className="mt-3 t-small text-silver">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="h-[var(--section-space-sm)]" />
      <ClosingCta label="Devis" title="Un projet *en tête* ?" body="Les tarifs dépendent du format et de la durée : chaque demande reçoit une réponse personnalisée." />
    </>
  );
}
