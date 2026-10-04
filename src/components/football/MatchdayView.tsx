import type { CSSProperties } from "react";
import { ShareGalleryButton } from "@/components/galleries/ShareGalleryButton";
import { Gallery, type GallerySection } from "@/components/gallery/Gallery";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { ArrowLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";
import { categoryContext, teamShort } from "@/lib/portfolio";
import type { Project } from "@/lib/types";
import { formatDate, pad } from "@/lib/utils";
import { matchContext, matchdayDate } from "./match-format";
import { PitchLines } from "./PitchLines";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * Reportage de match « Matchday » : l'en-tête d'un jour de match (date
 * stylisée, affiche, stade), la photo principale, une fiche de match
 * minimaliste, puis le récit en chapitres. Les informations sportives
 * restent discrètes : elles contextualisent, les photos dominent.
 */
export function MatchdayView({ project, crumbs }: { project: Project; crumbs: Crumb[] }) {
  const match = project.match!;
  const home = teamShort(project, "home");
  const away = teamShort(project, "away");
  const score = match.score;
  const context = matchContext(project);
  const chapters = project.chapters;

  const sections: GallerySection[] | undefined = chapters.length
    ? chapters.map((chapter, i) => ({
        id: chapter.slug,
        start: chapter.start,
        end: chapter.start + chapter.photos.length,
        header: <ChapterHeader index={i + 1} total={chapters.length} id={`chapitre-${chapter.slug}`} title={chapter.title} text={chapter.text} count={chapter.photos.length} first={i === 0} />,
      }))
    : undefined;

  return (
    <>
      {/* ---------------------------------------------------------- En-tête */}
      <header className="relative isolate overflow-hidden">
        <PitchLines className="pointer-events-none absolute top-[calc(var(--header-height)+1rem)] right-[-12%] -z-10 hidden h-[78%] w-[62%] text-linen/[0.07] md:block" />
        <div className="container-wide page-top pb-[clamp(2rem,4vw,3.5rem)]">
          <Breadcrumbs items={crumbs} />

          <div className="anim-rise mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-line pb-4 md:mt-14" style={delay(100)}>
            <p className="flex items-center gap-3 t-mono text-linen">
              <span aria-hidden className="matchday-pulse size-2 rounded-full bg-flamingo" />
              Matchday
              {match.competition ? <span className="text-ash">{match.competition}</span> : null}
            </p>
            {project.date ? (
              <p className="font-mono text-[clamp(0.9375rem,0.8rem+0.5vw,1.25rem)] tracking-[0.22em] text-linen">
                <time dateTime={project.date}>{matchdayDate(project.date)}</time>
              </p>
            ) : null}
          </div>

          <h1 className="mt-8 md:mt-12">
            <span className="sr-only">
              {match.home} contre {match.away}
              {project.date ? `, ${formatDate(project.date)}` : ""}
              {score ? `, score final ${score[0]} à ${score[1]}` : ""}
            </span>
            <span aria-hidden className="grid grid-cols-[1fr_auto] items-end gap-x-6 gap-y-1 md:gap-x-10">
              <TeamLine name={home} goals={score?.[0]} wait={180} />
              <span className="col-span-2 flex items-center gap-4 py-1 md:py-2">
                <span className="anim-fade h-px w-10 bg-flamingo md:w-16" style={delay(320)} />
                <span className="anim-fade t-mono text-flamingo" style={delay(340)}>
                  vs
                </span>
                <span className="anim-fade h-px flex-1 bg-line" style={delay(360)} />
              </span>
              <TeamLine name={away} goals={score?.[1]} wait={300} />
            </span>
          </h1>

          <div className="anim-rise mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between" style={delay(520)}>
            <div className="max-w-xl">
              {context ? <p className="t-mono text-taupe">{context}</p> : null}
              <p className="mt-4 t-lead text-taupe">{project.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ArrowLink href="#le-match">Voir la galerie</ArrowLink>
              <ShareGalleryButton title={project.title} />
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------- Photographie principale */}
      <figure className="container-wide">
        <div className="flash-in relative overflow-hidden rounded-[var(--radius-card)]">
          <PhotoImage photo={project.cover} fill priority sizes="(min-width: 1776px) 1680px, 100vw" className="aspect-[4/5] sm:aspect-[16/9] md:max-h-[82vh]" />
        </div>
        <figcaption className="mt-3 flex justify-between gap-4 t-mono text-ash">
          <span>Photographie principale</span>
          <span>{project.photographer ?? siteConfig.name}</span>
        </figcaption>
      </figure>

      {/* ------------------------------------------------- Fiche de match */}
      <MatchSheet project={project} />

      {/* -------------------------------------------------------- Le match */}
      <section id="le-match" aria-labelledby="le-match-title" className="container-wide scroll-mt-20 pb-[var(--section-space)]">
        <SectionStamp id="le-match-title" index="01" meta={`${chapters.length ? `${chapters.length} chapitres · ` : ""}${project.photos.length} photos`}>
          Le match
        </SectionStamp>

        {chapters.length > 1 ? (
          <nav aria-label="Chapitres du reportage" className="mt-8 -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] md:mt-10 [&::-webkit-scrollbar]:hidden">
            <ol className="flex min-w-max gap-2">
              {chapters.map((chapter, i) => (
                <li key={chapter.slug}>
                  <a
                    href={`#chapitre-${chapter.slug}`}
                    className="group flex h-10 items-center gap-3 rounded-full border border-line px-4 text-[0.8125rem] text-linen/90 transition-colors hover:border-flamingo hover:text-linen"
                  >
                    <span className="font-mono text-[0.6875rem] text-flamingo">{pad(i + 1)}</span>
                    {chapter.title}
                    <span className="font-mono text-[0.6875rem] text-ash">{chapter.photos.length}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="mt-10 md:mt-14">
          <Gallery
            id={project.slug}
            items={project.photos.map((photo) => ({ photo, title: project.title, context: categoryContext(project.category) }))}
            label={`Photos — ${project.title}`}
            toolbar
            sections={sections}
            allowDownload={project.allowDownload}
          />
        </div>
      </section>
    </>
  );
}

/** Une équipe sur l'affiche, avec son score (chiffres qui montent à l'entrée). */
function TeamLine({ name, goals, wait }: { name: string; goals?: number; wait: number }) {
  return (
    <>
      <span className="line-mask min-w-0">
        <span className="t-h1 block break-words text-linen" style={delay(wait)}>
          {name}
        </span>
      </span>
      <span className="line-mask">
        {goals !== undefined ? (
          <span className="t-h1 block text-right text-linen tabular-nums" style={delay(wait + 260)}>
            {goals}
          </span>
        ) : (
          <span />
        )}
      </span>
    </>
  );
}

/** Fiche de match : quelques champs, comme sur une feuille officielle. */
function MatchSheet({ project }: { project: Project }) {
  const match = project.match!;
  const fields = [
    { label: "Match", value: [match.competition, match.round].filter(Boolean).join(" · ") || project.event || "Match" },
    { label: "Date", value: project.date ? formatDate(project.date) : null },
    { label: "Stade", value: project.location },
    { label: "Domicile", value: match.home },
    { label: "Score", value: match.score ? `${match.score[0]} — ${match.score[1]}` : null },
    { label: "Visiteur", value: match.away },
    { label: "Photographe", value: project.photographer ?? siteConfig.name },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <section aria-label="Fiche de match" className="container-wide py-[clamp(2.5rem,5vw,4.5rem)]">
      <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
        {fields.map((field) => (
          <div key={field.label} className="border-b border-line py-4 pr-4 lg:border-r lg:border-b-0 lg:px-5 lg:first:pl-0 lg:last:border-r-0" data-reveal>
            <dt className="t-mono text-ash">{field.label}</dt>
            <dd className={`mt-2 text-[0.9375rem] leading-snug text-linen ${field.label === "Score" ? "font-mono tracking-[0.12em]" : ""}`}>{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** En-tête de chapitre : numéro, titre étendu, texte facultatif. */
function ChapterHeader({ index, total, id, title, text, count, first }: { index: number; total: number; id: string; title: string; text?: string; count: number; first: boolean }) {
  return (
    <header id={id} className={`grid scroll-mt-24 gap-4 border-t border-line pt-5 md:grid-cols-12 md:gap-8 ${first ? "mb-8 md:mb-12" : "mt-[clamp(4rem,3rem+5vw,8rem)] mb-8 md:mb-12"}`}>
      <p className="t-mono text-ash md:col-span-3">
        <span className="text-flamingo">Chapitre {pad(index)}</span> / {pad(total)}
      </p>
      <h3 className="font-display text-[clamp(1.75rem,1.1rem+2.6vw,3.75rem)] leading-[0.92] font-extrabold tracking-[-0.015em] text-linen uppercase [font-stretch:125%] md:col-span-6" data-reveal>
        {title}
      </h3>
      <div className="md:col-span-3 md:text-right">
        {text ? <p className="t-small text-taupe">{text}</p> : null}
        <p className="mt-1 t-mono text-ash">{pad(count)} photos</p>
      </div>
    </header>
  );
}
