import Link from "next/link";
import { Parallax } from "@/components/effects/Parallax";
import { Gallery } from "@/components/gallery/Gallery";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { ArrowLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getCategoryProjects, getCategoryTrail, getNextCategory } from "@/lib/portfolio";
import type { Category } from "@/lib/types";
import { formatDate, pad } from "@/lib/utils";
import { CategoryTiles } from "./CategoryTiles";

/** Page d'une rubrique ou d'une sous-rubrique (équipe). */
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
              ...(category.children.length ? [{ label: "Équipes", value: category.children.length }] : []),
              { label: "Séries", value: projects.length },
              { label: "Photos", value: category.photoCount },
            ]}
          />
        }
      />

      {/* Image de couverture cinématique */}
      <div className="container-wide">
        <div className="relative h-[min(78vh,52rem)] min-h-[22rem] overflow-hidden rounded-[var(--radius-sm)]">
          <Parallax strength={60} className="absolute inset-x-0 -top-16 -bottom-16">
            <PhotoImage photo={category.cover} fill priority sizes="(min-width: 1776px) 1680px, 100vw" className="h-full rounded-none" />
          </Parallax>
        </div>
      </div>

      {category.children.length ? (
        <section aria-labelledby="teams-title" className="section container-wide">
          <div className="mb-12 md:mb-16">
            <SectionLabel>{category.title}</SectionLabel>
            <h2 id="teams-title" className="t-h2 mt-5 text-platinum" data-reveal>
              Les <span className="t-serif text-phosphor">équipes</span>
            </h2>
          </div>
          <CategoryTiles categories={category.children} headingLevel="h3" />
        </section>
      ) : null}

      <section aria-label={`Séries — ${category.title}`} className={category.children.length ? "pb-[var(--section-space)]" : "section"}>
        {projects.map((project, i) => (
          <article key={project.slug} aria-labelledby={`serie-${project.slug}`} className="container-wide [&+&]:mt-[var(--section-space)]">
            <header className="mb-10 grid gap-6 border-t border-line pt-6 md:mb-14 md:grid-cols-12">
              <p className="t-caption t-tabular text-phosphor md:col-span-1">{pad(i + 1)}</p>
              <div className="md:col-span-6">
                <h2 id={`serie-${project.slug}`} className="t-h3 text-platinum">
                  <Link href={project.href} className="link-underline">
                    {project.title}
                  </Link>
                </h2>
                <p className="mt-3 t-small text-silver">
                  {[project.category.title, project.date ? formatDate(project.date) : null, project.location].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex flex-col gap-5 md:col-span-5">
                <p className="t-small text-silver">{project.description}</p>
                <ArrowLink href={project.href}>Voir la série</ArrowLink>
              </div>
            </header>
            <Gallery
              items={project.photos.map((photo) => ({ photo, title: project.title, context: trail.map((c) => c.title).join(" · ") }))}
              label={`Photos — ${project.title}`}
            />
          </article>
        ))}
      </section>

      <NextCategory category={next} />
      <ClosingCta />
    </>
  );
}

/** Invitation à poursuivre : la rubrique suivante, en grand. */
function NextCategory({ category }: { category: Category }) {
  return (
    <section aria-label="Rubrique suivante" className="container-wide pb-[var(--section-space-sm)]">
      <Link href={category.href} className="photo-hover group relative block overflow-hidden rounded-[var(--radius-sm)]" data-cursor="explore">
        <PhotoImage photo={category.cover} fill sizes="(min-width: 1776px) 1680px, 100vw" className="aspect-[4/5] sm:aspect-[21/9]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(1_29_28/0.85),rgb(1_29_28/0.15))]" />
        <div className="absolute inset-0 flex flex-col justify-between p-[clamp(1.25rem,4vw,3.5rem)]">
          <p className="t-label text-mist">Rubrique suivante</p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="t-caption text-silver">{category.kicker}</p>
              <p className="t-h1 mt-3 text-platinum">{category.title}</p>
            </div>
            <span className="grid size-14 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-kelp text-platinum transition-colors duration-300 group-hover:bg-phosphor group-hover:text-ink">
              <ArrowUpRight size={22} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
