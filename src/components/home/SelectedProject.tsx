import Link from "next/link";
import type { CSSProperties } from "react";
import { Parallax } from "@/components/effects/Parallax";
import { ArrowLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Un projet mis en avant : image plein cadre en parallaxe, puis récit et images secondaires. */
export function SelectedProject({ project }: { project: Project }) {
  const [, second, third] = project.photos;
  const meta = [project.category.parent?.title, project.category.title, project.date ? formatDate(project.date) : null, project.location].filter(Boolean);

  return (
    <section aria-labelledby="selected-title" className="section-sm">
      <Link href={project.href} className="group relative block h-[min(88vh,58rem)] min-h-[28rem] overflow-hidden" data-cursor="view" aria-label={`Voir la série ${project.title}`}>
        <Parallax strength={90} className="absolute inset-x-0 -top-28 -bottom-28">
          <PhotoImage photo={project.cover} fill sizes="100vw" className="h-full rounded-none" />
        </Parallax>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(1_38_36/0.85)_100%)]" />
        <div className="container-wide absolute inset-x-0 bottom-0 pb-[clamp(1.5rem,4vw,3.5rem)]">
          <SectionLabel index="04" className="text-mist">
            Projet à la une
          </SectionLabel>
          <h2 id="selected-title" className="t-h1 mt-5 max-w-[14ch] text-platinum" data-reveal>
            {project.title}
          </h2>
        </div>
      </Link>

      <div className="container-wide mt-[clamp(3rem,6vw,6rem)] grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5 lg:col-span-4">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 t-caption text-silver" data-reveal>
            {meta.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="mt-6 t-lead text-mist" data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
            {project.description}
          </p>
          <div className="mt-10" data-reveal style={{ "--reveal-delay": "200ms" } as CSSProperties}>
            <ArrowLink href={project.href}>Voir la série complète</ArrowLink>
          </div>
        </div>

        {second ? (
          <div className="md:col-span-4 md:col-start-7 lg:col-span-3 lg:col-start-7" data-reveal="image">
            <PhotoImage photo={second} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw" className="aspect-[3/4]" />
          </div>
        ) : null}
        {third ? (
          <div className="md:col-span-3 md:mt-[40%] lg:col-span-3" data-reveal="image" style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            <PhotoImage photo={third} fill sizes="(min-width: 768px) 25vw, 100vw" className="aspect-[4/5]" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
