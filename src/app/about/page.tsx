import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { TrustedClubs } from "@/components/clubs/TrustedClubs";
import { Parallax } from "@/components/effects/Parallax";
import { InstagramSection } from "@/components/instagram/InstagramSection";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { ArrowLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel, SectionStamp } from "@/components/ui/SectionLabel";
import { Todo } from "@/components/ui/Todo";
import { isDev, siteConfig } from "@/config/site";
import { aboutContent } from "@/data/content";
import { getPhotoById } from "@/lib/albums";
import { inArea, pageMetadata } from "@/lib/seo";
import { isPlaceholder, pad } from "@/lib/utils";

const { firstName, lastName } = siteConfig.owner;

export const metadata: Metadata = pageMetadata({
  title: `${firstName} ${lastName} — photographe sportif${inArea}`,
  description: `${firstName}, le photographe derrière ${siteConfig.name} : passionné de photographie de sport, il couvre le hockey, le football et le rugby${inArea}. Photos en ligne sous ${siteConfig.turnaround}.`,
  path: "/about",
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * À propos : le portrait et la mini-bio, l'approche (principes rédigés seulement),
 * les valeurs, les clubs qui m'ont fait confiance, Instagram.
 */
export default function AboutPage() {
  const portrait = getPhotoById(aboutContent.portraitId, "site/about");
  const wide = getPhotoById(aboutContent.wideId, "site/about");
  const stats = aboutContent.stats.filter((s) => s.value);
  const showStats = stats.length > 0 || isDev;
  // Textes encore entre crochets : visibles en développement, jamais publiés.
  const intro = isDev || !isPlaceholder(aboutContent.intro) ? aboutContent.intro : siteConfig.description;
  const approach = aboutContent.approach.filter((item) => isDev || !isPlaceholder(item.body));

  return (
    <>
      {/* Ouverture : portrait + présentation */}
      <header className="container-wide page-top">
        <Breadcrumbs items={[{ name: "À propos", path: "/about" }]} />
        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <div className="anim-rise" style={delay(120)}>
              <SectionLabel>À propos · Photographe sportif</SectionLabel>
            </div>
            <h1 className="t-display mt-6 text-linen">
              <span className="line-mask">
                <span style={delay(180)}>{firstName}</span>
              </span>
              <span className="sr-only">
                {" "}
                {lastName} — photographe sportif{inArea}
              </span>
            </h1>
            <p className="anim-rise mt-5 t-mono text-taupe" style={delay(320)}>
              {firstName} {lastName} · {siteConfig.name} · {siteConfig.contact.location}
            </p>
            <p className="anim-rise mt-8 max-w-xl t-lead text-linen/85" style={delay(420)}>
              {intro}
            </p>
            <ul className="anim-rise mt-8 flex flex-wrap gap-2" style={delay(520)} aria-label="Spécialités">
              {aboutContent.specialties.map((s) => (
                <li key={s} className="rounded-full border border-line-strong px-4 py-1.5 text-[0.8125rem] text-linen/90">
                  {s}
                </li>
              ))}
            </ul>
            <div className="anim-rise mt-10 flex flex-wrap gap-x-8 gap-y-4" style={delay(600)}>
              <ArrowLink href="/selection">Voir ma sélection</ArrowLink>
              <ArrowLink href="/contact">Travailler ensemble</ArrowLink>
            </div>
          </div>
          <div className="anim-fade md:col-span-5" style={delay(300)}>
            {portrait ? (
              <figure>
                <PhotoImage photo={portrait} fill priority sizes="(min-width: 768px) 40vw, 100vw" position="50% 30%" className="aspect-[4/5] rounded-[var(--radius-card)]" />
                <figcaption className="mt-3 flex justify-between gap-4 t-mono text-ash">
                  <span>{firstName}, au bord du terrain</span>
                  <span>{siteConfig.credit.handle}</span>
                </figcaption>
              </figure>
            ) : null}
          </div>
        </div>
      </header>

      {/* Approche — uniquement les principes rédigés */}
      {approach.length ? (
        <section aria-labelledby="approach-title" className="container-wide section">
          <SectionStamp id="approach-title" meta={`${approach.length} principe${approach.length > 1 ? "s" : ""}`} className="mb-12 md:mb-16">
            Approche
          </SectionStamp>
          <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {approach.map((item, i) => (
              <li key={item.title} className="relative border-t border-line pt-6" data-reveal style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as CSSProperties}>
                <span className="t-mono text-flamingo">{pad(i + 1)}</span>
                <h3 className="relative mt-4 t-h3 text-linen">{item.title}</h3>
                <p className="relative mt-3 t-small text-taupe">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Chiffres — uniquement s'ils sont renseignés (jamais inventés) */}
      {showStats ? (
        <section aria-label="Chiffres clés" className="container-wide pb-[var(--section-space-sm)]">
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-3">
            {(stats.length ? stats : aboutContent.stats).map((stat) => (
              <div key={stat.label} className="bg-ink p-8 md:p-10">
                <dt className="t-mono text-ash">{stat.label}</dt>
                <dd className="mt-4 text-[clamp(2.5rem,1.5rem+3vw,5rem)] leading-none font-light tracking-[-0.05em] text-linen">{stat.value ?? <Todo>Chiffre réel</Todo>}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Valeurs */}
      <section aria-labelledby="values-title" className="container-wide section-sm">
        <SectionStamp id="values-title" meta="Ce qui guide chaque image">
          Valeurs
        </SectionStamp>
        <ul className="mt-10">
          {aboutContent.values.map((value, i) => (
            <li
              key={value.title}
              className="grid gap-3 border-b border-line py-7 md:grid-cols-12 md:items-baseline md:py-9"
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties}
            >
              <p className="t-h1 text-linen md:col-span-8">{value.title}</p>
              <p className="t-small text-taupe md:col-span-4">{value.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Respiration : grande image */}
      <section aria-label="Photographie" className="container-wide section-sm">
        <div className="relative h-[min(80vh,52rem)] min-h-[22rem] overflow-hidden rounded-[var(--radius-card)]">
          <Parallax strength={80} className="absolute inset-x-0 -top-24 -bottom-24">
            {wide ? <PhotoImage photo={wide} fill sizes="(min-width: 1776px) 1680px, 100vw" className="h-full" /> : null}
          </Parallax>
        </div>
      </section>

      {/* Les clubs qui m'ont fait confiance (générés depuis les albums) */}
      <TrustedClubs className="mt-[var(--section-space-sm)] mb-[var(--section-space)]" />

      <InstagramSection />

      <ClosingCta title="Travaillons *ensemble.*" body="Une idée, un match, une saison à raconter ? Écrivez-moi." />
    </>
  );
}
