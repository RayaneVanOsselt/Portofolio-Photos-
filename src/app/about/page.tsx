import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Parallax } from "@/components/effects/Parallax";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Todo } from "@/components/ui/Todo";
import { isDev, siteConfig } from "@/config/site";
import { aboutContent } from "@/data/content";
import { getPhotoById } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";
import { pad } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "À propos",
  description: `Le photographe derrière ${siteConfig.name} : approche, vision et valeurs.`,
  path: "/about",
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export default function AboutPage() {
  const portrait = getPhotoById(aboutContent.portraitId);
  const wide = getPhotoById(aboutContent.wideId);
  const stats = aboutContent.stats.filter((s) => s.value);
  const showStats = stats.length > 0 || isDev;

  return (
    <>
      {/* Ouverture : portrait + présentation */}
      <header className="container-wide pt-[calc(var(--header-height)+clamp(2.5rem,6vw,6rem))]">
        <Breadcrumbs items={[{ name: "À propos", path: "/about" }]} />
        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="anim-rise t-label text-silver" style={delay(150)}>
              Le photographe
            </p>
            <h1 className="t-display mt-5 text-platinum">
              <span className="line-mask">
                <span style={delay(200)}>
                  À <span className="t-serif text-phosphor">propos</span>
                </span>
              </span>
            </h1>
            <p className="anim-rise mt-10 max-w-xl t-lead text-mist" style={delay(450)}>
              {aboutContent.intro}
            </p>
          </div>
          <div className="anim-fade md:col-span-5" style={delay(300)}>
            <PhotoImage photo={portrait} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5]" />
          </div>
        </div>
      </header>

      {/* Approche */}
      <section aria-labelledby="approach-title" className="section container-wide">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionLabel index="01">Mon approche</SectionLabel>
              <h2 id="approach-title" className="t-h2 mt-6 text-platinum" data-reveal>
                Au plus près <span className="t-serif text-phosphor">du jeu</span>
              </h2>
            </div>
          </div>
          <ol className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {aboutContent.approach.map((item, i) => (
              <li key={item.title} className="border-t border-line pt-6" data-reveal style={{ "--reveal-delay": `${(i % 2) * 90}ms` } as CSSProperties}>
                <span className="t-caption t-tabular text-phosphor">{pad(i + 1)}</span>
                <h3 className="mt-4 text-xl font-medium tracking-[-0.02em] text-platinum">{item.title}</h3>
                <p className="mt-3 t-small text-silver">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Chiffres — uniquement s'ils sont renseignés (jamais inventés) */}
      {showStats ? (
        <section aria-label="Chiffres clés" className="container-wide pb-[var(--section-space-sm)]">
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] bg-line sm:grid-cols-3">
            {(stats.length ? stats : aboutContent.stats).map((stat) => (
              <div key={stat.label} className="bg-abyss p-8 md:p-10">
                <dt className="t-caption text-silver">{stat.label}</dt>
                <dd className="mt-4 text-[clamp(2.5rem,1.5rem+3vw,5.5rem)] leading-none font-medium tracking-[-0.046em] text-phosphor">
                  {stat.value ?? <Todo>Chiffre réel</Todo>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Valeurs */}
      <section aria-labelledby="values-title" className="section-sm container-wide">
        <SectionLabel index="02">Valeurs</SectionLabel>
        <h2 id="values-title" className="sr-only">
          Valeurs
        </h2>
        <ul className="mt-10 border-t border-line">
          {aboutContent.values.map((value, i) => (
            <li
              key={value.title}
              className="grid gap-3 border-b border-line py-8 md:grid-cols-12 md:items-baseline md:py-10"
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties}
            >
              <span className="t-caption t-tabular text-phosphor md:col-span-1">{pad(i + 1)}</span>
              <p className="t-h1 text-platinum md:col-span-6">{value.title}</p>
              <p className="t-small text-silver md:col-span-4 md:col-start-9">{value.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Respiration : grande image */}
      <section aria-label="Photographie" className="section-sm">
        <div className="relative h-[min(85vh,56rem)] min-h-[24rem] overflow-hidden">
          <Parallax strength={80} className="absolute inset-x-0 -top-24 -bottom-24">
            <PhotoImage photo={wide} fill sizes="100vw" className="h-full rounded-none" />
          </Parallax>
        </div>
      </section>

      {/* Références : seulement de vraies références */}
      {aboutContent.clients.length || isDev ? (
        <section aria-labelledby="clients-title" className="section-sm container-wide">
          <SectionLabel index="03">Ils m&apos;ont fait confiance</SectionLabel>
          <h2 id="clients-title" className="sr-only">
            Références
          </h2>
          {aboutContent.clients.length ? (
            <ul className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
              {aboutContent.clients.map((client) => (
                <li key={client} className="t-h3 text-silver">
                  {client}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8">
              <Todo>Clubs, médias, partenaires (data/content.ts)</Todo>
            </p>
          )}
        </section>
      ) : null}

      <ClosingCta label="Collaboration" title="Travaillons *ensemble*." body="Une idée, un match, une saison à raconter ? Écrivez-moi." cta={{ label: "Me contacter", href: "/contact" }} />
    </>
  );
}
