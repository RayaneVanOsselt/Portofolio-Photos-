import Link from "next/link";
import type { CSSProperties } from "react";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { PitchLines } from "@/components/football/PitchLines";
import { ShareGalleryButton } from "@/components/galleries/ShareGalleryButton";
import { Gallery, type GallerySection } from "@/components/gallery/Gallery";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { ArrowLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";
import { categoryContext, SPORT_NAME, teamShort } from "@/lib/albums";
import type { Album, Crest } from "@/lib/types";
import { formatDate, pad } from "@/lib/utils";
import { matchContext, photoCountLabel, scoreLine } from "./match-format";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * Page d'un album, dans l'ordre où le visiteur se pose les questions :
 * quelle équipe / compétition (en tête, avec son logo) → qui joue (titre H1,
 * logos des équipes) → quand (date en toutes lettres) → où / quelle compétition
 * (si renseigné) → les photos. Les informations restent sobres : les photos dominent.
 */
export function AlbumView({ album, crumbs }: { album: Album; crumbs: Crumb[] }) {
  const { match, category } = album;
  const context = matchContext(album);
  const chapters = album.chapters;
  const count = album.photos.length;

  const sections: GallerySection[] | undefined =
    chapters.length > 1
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
        {category.sport === "football" ? (
          <PitchLines className="pointer-events-none absolute top-[calc(var(--header-height)+1rem)] right-[-12%] -z-10 hidden h-[78%] w-[62%] text-linen/[0.07] md:block" />
        ) : null}
        <div className="container-wide page-top pb-[clamp(2rem,4vw,3.5rem)]">
          <Breadcrumbs items={crumbs} />

          {/* Club / compétition et date : lisibles d'un coup d'œil */}
          <div className="anim-rise mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-line pb-5 md:mt-14" style={delay(100)}>
            <Link href={category.href} className="group flex min-w-0 items-center gap-4">
              {category.crest ? <ClubCrest crest={category.crest} size={52} eager /> : null}
              <span className="min-w-0">
                <span className="block t-mono text-ash">
                  {SPORT_NAME[category.sport]} · {album.event}
                </span>
                <span className="mt-1 block text-[clamp(1.125rem,1rem+0.6vw,1.5rem)] leading-tight font-medium tracking-[-0.015em] text-linen">
                  <span className="link-underline">{categoryContext(category)}</span>
                </span>
              </span>
            </Link>
            <p className="font-mono text-[clamp(0.9375rem,0.85rem+0.4vw,1.25rem)] tracking-[0.1em] text-linen uppercase">
              <time dateTime={album.date}>{formatDate(album.date)}</time>
            </p>
          </div>

          {match ? (
            <h1 className="mt-8 md:mt-12">
              <MatchHeadline album={album} />
            </h1>
          ) : (
            <h1 className="t-h1 mt-8 text-linen md:mt-12">
              <span className="line-mask">
                <span style={delay(180)}>{album.title}</span>
              </span>
            </h1>
          )}

          <div className="anim-rise mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between" style={delay(520)}>
            <div className="max-w-xl">
              {context ? <p className="t-mono text-taupe">{context}</p> : null}
              {album.description ? <p className="mt-4 t-lead text-taupe">{album.description}</p> : null}
            </div>
            {count ? (
              <div className="flex flex-wrap items-center gap-3">
                <ArrowLink href="#photos">Voir les {count} photos</ArrowLink>
                <ShareGalleryButton title={album.title} />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {count && album.cover ? (
        <>
          {/* -------------------------------------------- Photographie principale */}
          <figure className="container-wide">
            <div className="flash-in relative overflow-hidden rounded-[var(--radius-card)]">
              <PhotoImage photo={album.cover} fill priority sizes="(min-width: 1776px) 1680px, 100vw" className="aspect-[4/5] w-full sm:aspect-[16/9] md:max-h-[82vh]" />
            </div>
            <figcaption className="mt-3 flex justify-between gap-4 t-mono text-ash">
              <span>Photographie principale</span>
              <span>{album.photographer ?? siteConfig.name}</span>
            </figcaption>
          </figure>

          {match ? <MatchSheet album={album} /> : <div className="h-[clamp(2.5rem,5vw,4.5rem)]" />}

          {/* ----------------------------------------------------------- Galerie */}
          <section id="photos" aria-labelledby="photos-title" className="container-wide scroll-mt-20 pb-[var(--section-space)]">
            <SectionStamp id="photos-title" index="01" meta={`${chapters.length > 1 ? `${chapters.length} chapitres · ` : ""}${photoCountLabel(count)}`}>
              Galerie
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
                id={album.slug}
                items={album.photos.map((photo) => ({ photo, title: album.title, context: `${categoryContext(category)} · ${formatDate(album.date)}` }))}
                label={`Photos — ${album.title}`}
                toolbar
                defaultView={count > 24 ? "mosaic" : "editorial"}
                sections={sections}
                allowDownload={album.allowDownload}
              />
            </div>
          </section>
        </>
      ) : (
        <section aria-labelledby="photos-title" className="container-wide pb-[var(--section-space)]">
          <div className="anim-rise grid gap-8 rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-10 md:grid-cols-12 md:items-end md:px-12 md:py-14" style={delay(620)}>
            <div className="md:col-span-7">
              <p className="t-mono text-flamingo">Galerie · Photos à venir</p>
              <h2 id="photos-title" className="mt-4 text-[clamp(1.5rem,1.1rem+1.4vw,2.5rem)] leading-[1.1] font-light tracking-[-0.03em] text-linen">
                Les photos de ce match arrivent bientôt.
              </h2>
              <p className="mt-3 max-w-lg t-small text-taupe">L&apos;album s&apos;affichera ici dès sa mise en ligne.</p>
            </div>
            <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-end">
              <ArrowLink href={category.href}>Tous les albums {category.fullTitle}</ArrowLink>
              <ArrowLink href="/contact/?projet=demande-photo">Une question sur ce match ?</ArrowLink>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/**
 * L'affiche du match : chaque équipe sur sa ligne, avec son logo et son score s'il est connu.
 * Le texte du titre reste exactement « Daring H1 vs Leo H1 » (lecteurs d'écran, Google).
 */
function MatchHeadline({ album }: { album: Album }) {
  const match = album.match!;
  const home = teamShort(album, "home");
  const away = teamShort(album, "away");
  // Noms longs (« Louvain-la-Neuve D1 ») : un corps un peu plus petit, pour tenir sur mobile.
  const long = Math.max(home.length, away.length) > 13;
  const size = long ? "text-[clamp(1.75rem,0.75rem+4.2vw,5.25rem)]" : "text-[length:var(--text-h1)]";
  return (
    <span className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 md:gap-x-6">
      <TeamLine name={home} crest={match.homeCrest} goals={match.score?.[0]} wait={180} size={size} />{" "}
      <span className="col-span-3 flex items-center gap-4 py-1 md:py-2">
        <span aria-hidden className="anim-fade h-px w-10 bg-flamingo md:w-16" style={delay(320)} />
        <span className="anim-fade t-mono text-flamingo" style={delay(340)}>
          vs
        </span>
        <span aria-hidden className="anim-fade h-px flex-1 bg-line" style={delay(360)} />
      </span>{" "}
      <TeamLine name={away} crest={match.awayCrest} goals={match.score?.[1]} wait={300} size={size} />
      {match.score ? <span className="sr-only">{`, score final ${match.score[0]} à ${match.score[1]}`}</span> : null}
    </span>
  );
}

/** Une équipe sur l'affiche : logo (s'il est connu), nom, score (s'il est renseigné). */
function TeamLine({ name, crest, goals, wait, size }: { name: string; crest: Crest | null; goals?: number; wait: number; size: string }) {
  return (
    <>
      <span className="anim-fade [--crest:40px] md:[--crest:64px]" style={delay(wait)}>
        {crest ? <ClubCrest crest={crest} eager /> : <span className="block size-[var(--crest)]" />}
      </span>
      <span className="line-mask min-w-0">
        <span className={`block font-display leading-[0.95] font-extrabold tracking-[-0.02em] break-words text-linen uppercase [font-stretch:125%] ${size}`} style={delay(wait)}>
          {name}
        </span>
      </span>
      <span aria-hidden className="line-mask">
        {goals !== undefined ? (
          <span className={`block text-right font-display leading-[0.95] font-extrabold text-linen tabular-nums ${size}`} style={delay(wait + 260)}>
            {goals}
          </span>
        ) : (
          <span />
        )}
      </span>
    </>
  );
}

/** Fiche de match : quelques champs, uniquement ceux qui sont renseignés. */
function MatchSheet({ album }: { album: Album }) {
  const match = album.match!;
  const fields = [
    { label: "Catégorie", value: categoryContext(album.category) },
    { label: "Date", value: formatDate(album.date) },
    { label: "Compétition", value: [match.competition, match.round].filter(Boolean).join(" · ") || null },
    { label: album.category.sport === "football" ? "Stade" : "Lieu", value: album.location },
    { label: "Score", value: scoreLine(album) },
    { label: "Photographe", value: album.photographer ?? siteConfig.name },
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
