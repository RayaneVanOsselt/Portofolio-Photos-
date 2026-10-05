import Link from "next/link";
import { CrestPair } from "@/components/clubs/ClubCrest";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { albumCrests, categoryContext } from "@/lib/albums";
import type { Album, Photo } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { matchContext, photoCountLabel } from "./match-format";

type Props = {
  album: Album;
  /** H2 sur la page d'une catégorie, H3 sous une sous-catégorie (FIH Pro League → Femmes). */
  headingLevel?: "h2" | "h3";
  /** Première carte en haut de page : couverture chargée en priorité. */
  priority?: boolean;
  /** Rappelle la catégorie (listes qui mélangent plusieurs clubs). */
  showCategory?: boolean;
};

/**
 * Un match dans la liste d'une catégorie.
 * - Avec photos : la grande photo de couverture d'abord, puis le titre, la date,
 *   le lieu et la compétition s'ils sont connus, le nombre de photos.
 * - Sans photo (pour l'instant) : une ligne de calendrier compacte — grande date,
 *   logos, titre — pour ne pas afficher de grands cadres vides.
 * Le passage de l'un à l'autre est automatique dès que les photos sont ajoutées.
 */
export function AlbumCard({ album, headingLevel = "h2", priority = false, showCategory = false }: Props) {
  const context = [showCategory ? categoryContext(album.category) : null, matchContext(album)].filter(Boolean).join("  ·  ");
  return album.cover ? (
    <CoverCard album={album as Album & { cover: Photo }} headingLevel={headingLevel} priority={priority} context={context} />
  ) : (
    <FixtureCard album={album} headingLevel={headingLevel} context={context} />
  );
}

type CardProps = { headingLevel: "h2" | "h3"; context: string };

function CoverCard({ album, headingLevel: Heading, priority, context }: CardProps & { album: Album & { cover: Photo }; priority: boolean }) {
  return (
    <Link href={album.href} className="photo-hover group grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
      <div className="md:col-span-7" data-reveal={priority ? undefined : "image"}>
        <PhotoImage
          photo={album.cover}
          fill
          priority={priority}
          sizes="(min-width: 1776px) 980px, (min-width: 768px) 58vw, 100vw"
          className="aspect-[3/2] rounded-[var(--radius-card)]"
        />
      </div>

      <div className="md:col-span-5 md:pb-1">
        <p className="t-mono text-taupe">
          <time dateTime={album.date} className="text-linen">
            {formatDate(album.date)}
          </time>
        </p>
        <Heading className="mt-3 text-[clamp(1.625rem,1.15rem+1.8vw,2.75rem)] leading-[1.06] font-light tracking-[-0.035em] text-linen">
          <span className="link-underline">{album.title}</span>
        </Heading>
        {context ? <p className="mt-3 t-small text-taupe">{context}</p> : null}
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
          <span className="flex min-w-0 items-center gap-3">
            <CrestPair crests={albumCrests(album)} size={28} />
            <span className="t-mono text-taupe">{photoCountLabel(album.photos.length)}</span>
          </span>
          <span className="flex items-center gap-3 text-[0.875rem] text-linen">
            <span className="hidden sm:inline">Voir l&apos;album</span>
            <ArrowBadge />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FixtureCard({ album, headingLevel: Heading, context }: CardProps & { album: Album }) {
  const crests = albumCrests(album);
  const [, , day] = album.date.split("-");
  const monthYear = new Intl.DateTimeFormat("fr-BE", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${album.date}T12:00:00Z`));

  return (
    <Link
      href={album.href}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-3 rounded-[var(--radius-card)] border border-line bg-wash px-5 py-5 transition-colors duration-300 hover:border-line-strong hover:bg-wash-strong md:grid-cols-[8.5rem_auto_1fr_auto] md:gap-x-8 md:px-8 md:py-7"
    >
      <time dateTime={album.date} className="flex flex-col">
        <span className="font-display text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] leading-none font-extrabold tracking-[-0.02em] text-linen [font-stretch:125%]">{day}</span>
        <span className="mt-1.5 t-mono text-taupe">{monthYear}</span>
      </time>
      <span className="hidden md:block">
        <CrestPair crests={crests} size={52} />
      </span>
      <span className="min-w-0">
        {crests.length ? <CrestPair crests={crests} size={28} className="mb-2 md:hidden" /> : null}
        <Heading className="text-[clamp(1.25rem,1rem+1.3vw,2.25rem)] leading-[1.1] font-light tracking-[-0.03em] text-linen">
          <span className="link-underline">{album.title}</span>
        </Heading>
        <span className="mt-1.5 block t-small text-taupe">
          {context ? `${context}  ·  ` : ""}
          <span className="text-ash">Photos à venir</span>
        </span>
      </span>
      <ArrowBadge />
    </Link>
  );
}

function ArrowBadge() {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-linen transition-[background-color,border-color,color] duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
      <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
    </span>
  );
}
