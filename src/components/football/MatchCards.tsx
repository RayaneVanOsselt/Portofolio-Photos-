import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { categoryContext, teamShort } from "@/lib/portfolio";
import type { Project } from "@/lib/types";
import { pad } from "@/lib/utils";
import { matchContext, matchdayDate, scoreLine } from "./match-format";

/** Dernier reportage de match, en grand. */
export function LatestMatch({ project, priority = false }: { project: Project; priority?: boolean }) {
  const score = scoreLine(project);
  const context = matchContext(project);
  return (
    <section aria-label="Dernier matchday" className="container-wide">
      <Link href={project.href} className="photo-hover group relative block overflow-hidden rounded-[var(--radius-card)]">
        <PhotoImage photo={project.cover} fill priority={priority} sizes="(min-width: 1776px) 1680px, 100vw" className="aspect-[4/5] sm:aspect-[16/9] md:max-h-[80vh]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(19_20_18/0.55)_0%,transparent_35%,transparent_50%,rgb(19_20_18/0.9)_100%)]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-[clamp(1.25rem,3vw,2.5rem)]">
          <p className="flex items-center gap-3 t-mono text-linen">
            <span aria-hidden className="matchday-pulse size-2 rounded-full bg-flamingo" />
            {project.match ? "Dernier matchday" : "Dernier reportage"}
          </p>
          {project.date ? <p className="font-mono text-[0.875rem] tracking-[0.22em] text-linen">{matchdayDate(project.date)}</p> : null}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-[clamp(1.25rem,3vw,2.5rem)] md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {project.match ? (
              <p className="font-display text-[clamp(1.75rem,0.9rem+3.6vw,4.75rem)] leading-[0.9] font-extrabold text-linen uppercase [font-stretch:125%]">
                {teamShort(project, "home")}
                <span className="mx-3 align-middle font-mono text-[0.3em] font-normal tracking-[0.2em] text-flamingo">vs</span>
                <br className="md:hidden" />
                {teamShort(project, "away")}
              </p>
            ) : (
              <p className="t-h1 text-linen">{project.title}</p>
            )}
            <p className="mt-3 t-mono text-taupe">{[score, context].filter(Boolean).join("  ·  ") || categoryContext(project.category)}</p>
          </div>
          <span className="flex shrink-0 items-center gap-3 text-[0.9375rem] font-medium text-linen">
            Voir la galerie
            <span className="grid size-12 place-items-center rounded-full bg-flamingo text-ink transition-colors group-hover:bg-tango">
              <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </span>
        </div>
      </Link>
    </section>
  );
}

/** Une ligne d'archive, comme un talon de billet : date · affiche · score · lieu. */
export function ArchiveRow({ project }: { project: Project }) {
  const score = scoreLine(project);
  return (
    <Link
      href={project.href}
      className="group grid grid-cols-[3.75rem_1fr_auto] items-center gap-4 py-4 transition-colors duration-300 hover:bg-wash md:grid-cols-[4.5rem_1fr_6rem_14rem_auto] md:gap-6 md:px-3"
    >
      <span className="font-mono text-[0.8125rem] tracking-[0.12em] text-taupe">{project.date ? project.date.slice(8, 10) + "." + project.date.slice(5, 7) : "—"}</span>
      <span className="min-w-0">
        <span className="block truncate text-lg font-medium tracking-[-0.015em] text-linen md:text-xl">
          {project.match ? (
            <>
              {project.match.home}
              <span className="mx-2 font-mono text-[0.75rem] tracking-[0.18em] text-flamingo uppercase">vs</span>
              {project.match.away}
            </>
          ) : (
            project.title
          )}
        </span>
        <span className="mt-0.5 block truncate t-small text-taupe md:hidden">{[score, matchContext(project)].filter(Boolean).join(" · ") || project.event}</span>
      </span>
      <span className="hidden font-mono text-[0.9375rem] tracking-[0.14em] text-linen md:block">{score ?? ""}</span>
      <span className="hidden truncate t-small text-taupe md:block">{matchContext(project) || project.event}</span>
      <span className="flex items-center gap-3">
        <span className="hidden t-mono text-ash lg:inline">{pad(project.photos.length)} photos</span>
        <span className="grid size-10 place-items-center rounded-full border border-line-strong text-linen transition-[background-color,border-color,color] duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
          <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
        </span>
      </span>
    </Link>
  );
}
