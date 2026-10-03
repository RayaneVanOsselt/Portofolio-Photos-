import type { Metadata } from "next";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { CategoryTiles } from "@/components/portfolio/CategoryTiles";
import { FilterableGallery } from "@/components/portfolio/FilterableGallery";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getAllPhotoEntries, getCategories, getProjects } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description: "Hockey, rugby et football : toutes les séries photo, classées par compétition et par équipe.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  const categories = getCategories();
  const entries = getAllPhotoEntries();
  const teams = categories.reduce((sum, c) => sum + c.children.length, 0);

  return (
    <>
      <PageIntro
        crumbs={[{ name: "Portfolio", path: "/portfolio" }]}
        kicker="Hockey / Rugby / Football"
        title="Port*folio*"
        intro="Chaque rubrique rassemble une compétition ou un club. Ouvrez-en une pour parcourir ses équipes et ses séries, ou explorez toutes les images ci-dessous."
        aside={
          <MetaList
            items={[
              { label: "Rubriques", value: categories.length },
              { label: "Équipes", value: teams },
              { label: "Photos", value: entries.length },
            ]}
          />
        }
      />

      <section aria-labelledby="rubriques-title" className="section-sm container-wide pt-0">
        <h2 id="rubriques-title" className="sr-only">
          Rubriques
        </h2>
        <CategoryTiles categories={categories} />
      </section>

      <section aria-labelledby="all-photos-title" className="section container-wide">
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel>Toutes les images</SectionLabel>
            <h2 id="all-photos-title" className="t-h2 mt-5 text-platinum" data-reveal>
              Parcourir <span className="t-serif text-phosphor">librement</span>
            </h2>
          </div>
          <p className="max-w-sm t-small text-silver">{getProjects().length} séries · cliquez sur une photo pour l&apos;agrandir, puis naviguez avec ← →.</p>
        </div>
        <FilterableGallery
          filters={categories.map((c) => ({ slug: c.slug, title: c.title, count: c.photoCount }))}
          items={entries.map(({ photo, project, rootSlug }) => ({
            photo,
            group: rootSlug,
            title: project.title,
            context: project.category.parent ? `${project.category.parent.title} · ${project.category.title}` : project.category.title,
          }))}
        />
      </section>

      <ClosingCta />
    </>
  );
}
