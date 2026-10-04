import type { Metadata } from "next";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { CategoryTiles } from "@/components/portfolio/CategoryTiles";
import { GalleryCard } from "@/components/portfolio/GalleryCard";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { ArrowLink } from "@/components/ui/Button";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { getCategories, getProjects } from "@/lib/portfolio";
import { inArea, pageMetadata } from "@/lib/seo";
import { pad } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio photo sport — hockey, rugby, football",
  description: `Le travail, par catégorie : ${getCategories().map((c) => c.title).join(", ")}. Galeries classées par compétition et par équipe. Photographe sportif${inArea}.`,
  path: "/portfolio",
});

/** Portfolio : Catégories → Galerie → Photo. Les photos se chargent dans les galeries, pas ici. */
export default function PortfolioPage() {
  const categories = getCategories();
  const projects = getProjects();
  const teams = categories.reduce((sum, c) => sum + c.children.length, 0);
  const photos = categories.reduce((sum, c) => sum + c.photoCount, 0);
  const recent = projects.slice(0, 4);

  return (
    <>
      <PageIntro
        crumbs={[{ name: "Portfolio", path: "/portfolio" }]}
        kicker="Hockey · Rugby · Football"
        title="Portfolio"
        intro="Chaque catégorie rassemble une compétition ou un club. Ouvrez-en une pour parcourir ses équipes et ses galeries."
        aside={
          <MetaList
            items={[
              { label: "Catégories", value: pad(categories.length) },
              { label: "Équipes", value: pad(teams) },
              { label: "Photos", value: photos },
            ]}
          />
        }
      />

      <section aria-labelledby="categories-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="categories-title" index="01" meta={`${categories.length} catégories`} className="mb-12 md:mb-16">
          Catégories
        </SectionStamp>
        <CategoryTiles categories={categories} />
      </section>

      <section aria-labelledby="recent-title" className="container-wide pb-[var(--section-space-sm)]">
        <SectionStamp id="recent-title" index="02" meta={`${projects.length} galeries`}>
          Galeries
        </SectionStamp>
        <div className="mt-8 mb-12 flex flex-col gap-6 md:mt-10 md:mb-16 md:flex-row md:items-end md:justify-between">
          <p className="max-w-lg t-lead text-taupe" data-reveal>
            Les dernières mises en ligne. Pour retrouver un match précis, cherchez-le par équipe ou par date.
          </p>
          <ArrowLink href="/galeries">Rechercher une galerie</ArrowLink>
        </div>
        <ul className="grid gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-14 sm:grid-cols-2">
          {recent.map((project, i) => (
            <li key={project.slug} className={i % 2 ? "sm:mt-[18%]" : ""}>
              <GalleryCard project={project} frame={i % 2 ? "aspect-[4/5]" : "aspect-[4/3]"} sizes="(min-width: 640px) 50vw, 100vw" revealDelay={(i % 2) * 90} />
            </li>
          ))}
        </ul>
      </section>

      <ClosingCta />
    </>
  );
}
