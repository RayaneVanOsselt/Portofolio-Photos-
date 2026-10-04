import Link from "next/link";
import { Parallax } from "@/components/effects/Parallax";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PhotoAccessBand } from "@/components/sections/PhotoAccessBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { getCategoryProjects, getCategoryTrail, getNextCategory } from "@/lib/portfolio";
import { categorySummary, collectionJsonLd, inArea, sportLabel } from "@/lib/seo";
import type { Category } from "@/lib/types";
import { pad } from "@/lib/utils";
import { CategoryTiles } from "./CategoryTiles";
import { GalleryCard } from "./GalleryCard";

/** Disposition des cartes de galerie : une grande, puis des paires décalées. */
const SLOTS = [
  { col: "md:col-span-12", frame: "aspect-[16/9]", sizes: "(min-width: 1776px) 1680px, 100vw" },
  { col: "md:col-span-6", frame: "aspect-[4/3]", sizes: "(min-width: 768px) 50vw, 100vw" },
  { col: "md:col-span-5 md:col-start-8 md:mt-[12%]", frame: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw" },
];

/**
 * Page d'une catégorie ou d'une équipe : couverture, équipes, puis les
 * galeries (une carte chacune — les photos se chargent dans la galerie).
 */
export function CategoryView({ category }: { category: Category }) {
  const projects = getCategoryProjects(category);
  const next = getNextCategory(category);
  const trail = getCategoryTrail(category);

  return (
    <>
      <PageIntro
        crumbs={[{ name: "Portfolio", path: "/portfolio" }, ...trail.map((c) => ({ name: c.title, path: c.href }))]}
        kicker={category.kicker}
        title={category.title}
        intro={<p>{category.intro}</p>}
        aside={
          <MetaList
            items={[
              ...(category.children.length ? [{ label: "Équipes", value: pad(category.children.length) }] : []),
              { label: "Galeries", value: pad(projects.length) },
              { label: "Photos", value: category.photoCount },
            ]}
          />
        }
      />

      {/* Couverture cinématique */}
      <div className="container-wide">
        <div className="relative h-[min(72vh,48rem)] min-h-[20rem] overflow-hidden rounded-[var(--radius-card)]">
          <Parallax strength={60} className="absolute inset-x-0 -top-16 -bottom-16">
            <PhotoImage photo={category.cover} fill priority sizes="(min-width: 1776px) 1680px, 100vw" className="h-full" />
          </Parallax>
        </div>
      </div>

      {category.children.length ? (
        <section aria-labelledby="teams-title" className="container-wide section">
          <SectionStamp id="teams-title" index="01" meta={`${category.children.length} équipes`} className="mb-12 md:mb-16">
            Équipes
          </SectionStamp>
          <CategoryTiles categories={category.children} headingLevel="h3" />
        </section>
      ) : null}

      <section aria-labelledby="galleries-title" className={`container-wide ${category.children.length ? "pb-[var(--section-space)]" : "section"}`}>
        <SectionStamp id="galleries-title" index={category.children.length ? "02" : "01"} meta={`${projects.length} galerie${projects.length > 1 ? "s" : ""}`} className="mb-12 md:mb-16">
          Galeries
        </SectionStamp>
        {projects.length ? (
          <ul className="grid gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-14 md:grid-cols-12">
            {projects.map((project, i) => {
              const slot = i === 0 ? SLOTS[0] : SLOTS[1 + ((i - 1) % 2)];
              return (
                <li key={project.slug} className={slot.col}>
                  <GalleryCard project={project} frame={slot.frame} sizes={slot.sizes} headingLevel="h3" revealDelay={(i % 2) * 90} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="t-small text-taupe">Les galeries de cette catégorie arrivent bientôt.</p>
        )}
      </section>

      <PhotoAccessBand context={category.title} />

      {/* Texte de référencement : uniquement des faits issus des données du portfolio */}
      <section aria-labelledby="category-about-title" className="container-wide pb-[var(--section-space-sm)]">
        <div className="grid gap-4 border-t border-line pt-8 md:grid-cols-12">
          <h2 id="category-about-title" className="t-mono text-ash md:col-span-3">
            {category.title} en bref
          </h2>
          <p className="max-w-2xl t-small text-taupe md:col-span-8 md:col-start-5">
            {categorySummary(category, projects.length)} {category.intro} Chaque image peut être agrandie, partagée ou demandée en haute définition
            {inArea ? ` — photographe sportif${inArea}, spécialisé en ${sportLabel(category)}` : ""}.
          </p>
        </div>
      </section>

      <JsonLd data={collectionJsonLd(category, projects)} />
      <NextCategory category={next} />
      <ClosingCta />
    </>
  );
}

/** Invitation à poursuivre : la catégorie suivante, en grand. */
function NextCategory({ category }: { category: Category }) {
  return (
    <section aria-label="Catégorie suivante" className="container-wide">
      <Link href={category.href} className="photo-hover group relative block overflow-hidden rounded-[var(--radius-card)]">
        <PhotoImage photo={category.cover} fill sizes="(min-width: 1776px) 1680px, 100vw" className="aspect-[4/5] sm:aspect-[21/9]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(19_20_18/0.85),rgb(19_20_18/0.1))]" />
        <div className="absolute inset-0 flex flex-col justify-between p-[clamp(1.25rem,4vw,3.5rem)]">
          <p className="t-mono text-linen">+ Catégorie suivante</p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="t-mono text-linen/75">{category.kicker}</p>
              <p className="t-h1 mt-3 text-linen">{category.title}</p>
            </div>
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-linen/15 text-linen backdrop-blur-md transition-colors duration-300 group-hover:bg-flamingo group-hover:text-ink">
              <ArrowUpRight size={22} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
