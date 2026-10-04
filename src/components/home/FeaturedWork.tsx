import { GalleryCard } from "@/components/portfolio/GalleryCard";
import { ArrowLink } from "@/components/ui/Button";
import { SectionStamp } from "@/components/ui/SectionLabel";
import type { Project } from "@/lib/types";

/**
 * Sélection : composition éditoriale asymétrique (12 colonnes).
 * Chaque emplacement a sa place, sa taille et son ratio — pas de grille uniforme.
 */
const SLOTS = [
  { frame: "aspect-[4/5]", col: "md:col-start-1 md:col-span-7", sizes: "(min-width: 768px) 58vw, 100vw" },
  { frame: "aspect-[3/4]", col: "md:col-start-9 md:col-span-4 md:mt-[34%]", sizes: "(min-width: 768px) 33vw, 86vw" },
  { frame: "aspect-[16/10]", col: "md:col-start-2 md:col-span-6 md:-mt-[4%]", sizes: "(min-width: 768px) 50vw, 100vw" },
  { frame: "aspect-square", col: "md:col-start-9 md:col-span-4 md:mt-[20%]", sizes: "(min-width: 768px) 33vw, 86vw" },
  { frame: "aspect-[21/9]", col: "md:col-start-3 md:col-span-10", sizes: "(min-width: 768px) 83vw, 100vw" },
];

export function FeaturedWork({ projects }: { projects: Project[] }) {
  const selection = projects.slice(0, SLOTS.length);

  return (
    <section aria-labelledby="featured-title" className="container-wide section">
      <SectionStamp id="featured-title" index="01" meta={`${selection.length} galeries`}>
        Sélection
      </SectionStamp>
      <div className="mt-8 mb-14 flex flex-col gap-6 md:mt-10 md:mb-20 md:flex-row md:items-end md:justify-between">
        <p className="max-w-lg t-lead text-taupe" data-reveal>
          Des matchs, des équipes, des instants. Les galeries que je préfère, à parcourir en plein écran.
        </p>
        <ArrowLink href="/portfolio">Tout le portfolio</ArrowLink>
      </div>

      <ul className="grid grid-cols-1 gap-y-14 md:grid-cols-12 md:gap-x-[clamp(1rem,2vw,2rem)] md:gap-y-[clamp(3rem,7vw,7rem)]">
        {selection.map((project, i) => {
          const slot = SLOTS[i];
          return (
            <li key={project.slug} className={`${slot.col} ${i % 2 ? "ml-[10%] md:ml-0" : ""}`}>
              <GalleryCard project={project} frame={`${slot.frame} md:max-h-[86vh]`} sizes={slot.sizes} revealDelay={60} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
