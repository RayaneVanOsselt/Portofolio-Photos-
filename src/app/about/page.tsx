import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Parallax } from "@/components/effects/Parallax";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { socialIcons } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel, SectionStamp } from "@/components/ui/SectionLabel";
import { Todo } from "@/components/ui/Todo";
import { getSocialLinks, isDev, siteConfig } from "@/config/site";
import { aboutContent } from "@/data/content";
import { getPhotoById } from "@/lib/portfolio";
import { inArea, pageMetadata } from "@/lib/seo";
import { pad } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: `À propos — photographe sportif${inArea}`,
  description: `Le photographe derrière ${siteConfig.name} : approche, vision et valeurs. Photographie de hockey, rugby et football${inArea}.`,
  path: "/about",
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export default function AboutPage() {
  const portrait = getPhotoById(aboutContent.portraitId);
  const wide = getPhotoById(aboutContent.wideId);
  const stats = aboutContent.stats.filter((s) => s.value);
  const showStats = stats.length > 0 || isDev;
  const socials = getSocialLinks();
  const { equipment } = aboutContent;

  return (
    <>
      {/* Ouverture : portrait + présentation */}
      <header className="container-wide page-top">
        <Breadcrumbs items={[{ name: "À propos", path: "/about" }]} />
        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <div className="anim-rise" style={delay(120)}>
              <SectionLabel>Le photographe</SectionLabel>
            </div>
            <h1 className="t-display mt-6 text-linen">
              <span className="line-mask">
                <span style={delay(180)}>À propos</span>
              </span>
            </h1>
            <p className="anim-rise mt-10 max-w-xl t-lead text-linen/85" style={delay(420)}>
              {aboutContent.intro}
            </p>
            <ul className="anim-rise mt-8 flex flex-wrap gap-2" style={delay(520)} aria-label="Spécialités">
              {aboutContent.specialties.map((s) => (
                <li key={s} className="rounded-full border border-line-strong px-4 py-1.5 text-[0.8125rem] text-linen/90">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="anim-fade md:col-span-5" style={delay(300)}>
            <PhotoImage photo={portrait} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] rounded-[var(--radius-card)]" />
          </div>
        </div>
      </header>

      {/* Approche */}
      <section aria-labelledby="approach-title" className="container-wide section">
        <SectionStamp id="approach-title" index="01" meta={`${aboutContent.approach.length} principes`} className="mb-12 md:mb-16">
          Approche
        </SectionStamp>
        <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {aboutContent.approach.map((item, i) => (
            <li key={item.title} className="relative border-t border-line pt-6" data-reveal style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as CSSProperties}>
              <span aria-hidden className="pointer-events-none absolute top-5 right-0 font-display text-[4rem] leading-none font-extrabold text-linen/[0.05] [font-stretch:125%]">
                {pad(i + 1)}
              </span>
              <span className="t-mono text-flamingo">{pad(i + 1)}</span>
              <h3 className="relative mt-4 t-h3 text-linen">{item.title}</h3>
              <p className="relative mt-3 t-small text-taupe">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

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
        <SectionStamp id="values-title" index="02" meta="Ce qui guide chaque image">
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
              <span className="t-mono text-ash md:col-span-1">({pad(i + 1)})</span>
              <p className="t-h1 text-linen md:col-span-7">{value.title}</p>
              <p className="t-small text-taupe md:col-span-4">{value.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Respiration : grande image */}
      <section aria-label="Photographie" className="container-wide section-sm">
        <div className="relative h-[min(80vh,52rem)] min-h-[22rem] overflow-hidden rounded-[var(--radius-card)]">
          <Parallax strength={80} className="absolute inset-x-0 -top-24 -bottom-24">
            <PhotoImage photo={wide} fill sizes="(min-width: 1776px) 1680px, 100vw" className="h-full" />
          </Parallax>
        </div>
      </section>

      {/* Matériel et réseaux */}
      <section aria-labelledby="kit-title" className="container-wide section-sm">
        <div className="grid gap-10 md:grid-cols-2">
          {equipment.length || isDev ? (
            <div className="rounded-[var(--radius-card)] border border-line p-6 md:p-8">
              <h2 id="kit-title" className="t-mono text-ash">
                + Matériel
              </h2>
              {equipment.length ? (
                <ul className="mt-6 divide-y divide-line">
                  {equipment.map((item) => (
                    <li key={item} className="py-3 font-mono text-[0.875rem] tracking-[0.04em] text-linen">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6">
                  <Todo>Boîtiers, objectifs (data/content.ts)</Todo>
                </p>
              )}
            </div>
          ) : null}
          <div className="rounded-[var(--radius-card)] border border-line p-6 md:p-8">
            <h2 className="t-mono text-ash">+ Me suivre</h2>
            {socials.length ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {socials.map((s) => {
                  const Icon = socialIcons[s.key];
                  return (
                    <li key={s.key}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center gap-2.5 rounded-full bg-wash-strong px-5 text-[0.9375rem] text-linen transition-colors hover:bg-[rgb(231_231_216/0.16)]">
                        <Icon size={17} />
                        {s.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-6">
                <Todo>Réseaux sociaux (config/site.ts)</Todo>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Références : seulement de vraies références */}
      {aboutContent.clients.length || isDev ? (
        <section aria-labelledby="clients-title" className="container-wide section-sm">
          <SectionStamp id="clients-title" index="03" meta="Références">
            Confiance
          </SectionStamp>
          {aboutContent.clients.length ? (
            <ul className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
              {aboutContent.clients.map((client) => (
                <li key={client} className="text-2xl font-light tracking-[-0.03em] text-taupe">
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

      <ClosingCta title="Travaillons *ensemble.*" body="Une idée, un match, une saison à raconter ? Écrivez-moi." />
    </>
  );
}
