import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Project } from "@/lib/types";
import { pad } from "@/lib/utils";

/**
 * Sélection : une composition éditoriale asymétrique (12 colonnes).
 * Chaque emplacement a sa place, sa taille et son ratio — pas de grille uniforme.
 */
const SLOTS = [
  { frame: "aspect-[4/5]", col: "md:col-start-1 md:col-span-7", sizes: "(min-width: 768px) 58vw, 100vw" },
  { frame: "aspect-[3/4]", col: "md:col-start-9 md:col-span-4 md:mt-[38%]", sizes: "(min-width: 768px) 33vw, 86vw" },
  { frame: "aspect-[16/10]", col: "md:col-start-2 md:col-span-6 md:-mt-[6%]", sizes: "(min-width: 768px) 50vw, 100vw" },
  { frame: "aspect-square", col: "md:col-start-9 md:col-span-4 md:mt-[22%]", sizes: "(min-width: 768px) 33vw, 86vw" },
  { frame: "aspect-[21/9]", col: "md:col-start-3 md:col-span-10", sizes: "(min-width: 768px) 83vw, 100vw" },
];

export function FeaturedWork({ projects }: { projects: Project[] }) {
  const selection = projects.slice(0, SLOTS.length);

  return (
    <section aria-labelledby="featured-title" className="section-sm container-wide">
      <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div>
          <SectionLabel index="02">Sélection</SectionLabel>
          <h2 id="featured-title" className="t-h1 mt-6 text-platinum" data-reveal>
            Travaux <span className="t-serif text-phosphor">choisis</span>
          </h2>
        </div>
        <ArrowLink href="/portfolio">Tout le portfolio</ArrowLink>
      </div>

      <ul className="grid grid-cols-1 gap-y-14 md:grid-cols-12 md:gap-x-[clamp(1rem,2vw,2rem)] md:gap-y-[clamp(3rem,7vw,7rem)]">
        {selection.map((project, i) => {
          const slot = SLOTS[i];
          return (
            <li key={project.slug} className={`${slot.col} ${i % 2 ? "ml-[14%] md:ml-0" : ""}`}>
              <Link href={project.href} className="photo-hover group block" data-cursor="view">
                <div data-reveal="image" style={{ "--reveal-delay": "60ms" } as CSSProperties}>
                  <PhotoImage photo={project.cover} fill sizes={slot.sizes} className={`${slot.frame} md:max-h-[86vh]`} />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="t-caption t-tabular pt-1 text-phosphor">{pad(i + 1)}</span>
                    <div>
                      <h3 className="text-lg font-medium tracking-[-0.02em] text-platinum md:text-xl">
                        <span className="link-underline">{project.title}</span>
                      </h3>
                      <p className="mt-1 t-small text-silver">
                        {project.category.parent ? `${project.category.parent.title} · ` : ""}
                        {project.category.title}
                      </p>
                    </div>
                  </div>
                  <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-kelp-soft text-platinum transition-colors duration-300 group-hover:bg-kelp">
                    <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
