import Link from "next/link";
import { CrestPair } from "@/components/clubs/ClubCrest";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { albumCrests, categoryContext, teamShort } from "@/lib/albums";
import type { Album } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { matchContext, scoreLine } from "./match-format";

/**
 * Le dernier album, en grand : sa photo de couverture plein cadre — ou, tant
 * qu'il n'a pas de photos, une affiche typographique avec les logos des équipes.
 */
export function LatestAlbum({ album, label = "Dernier match", priority = false }: { album: Album; label?: string; priority?: boolean }) {
  const details = [scoreLine(album), categoryContext(album.category), matchContext(album)].filter(Boolean).join("  ·  ");
  const cover = album.cover;

  return (
    <Link href={album.href} className="photo-hover group relative block overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-soft">
      {cover ? (
        <>
          <PhotoImage photo={cover} fill priority={priority} sizes="(min-width: 1776px) 1680px, 100vw" className="aspect-[4/5] w-full sm:aspect-[16/9] md:max-h-[80vh]" />
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(19_20_18/0.55)_0%,transparent_35%,transparent_50%,rgb(19_20_18/0.9)_100%)]" />
        </>
      ) : (
        <div aria-hidden className="aspect-[4/5] sm:aspect-[21/9]" />
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-[clamp(1.25rem,3vw,2.5rem)]">
        <p className="flex items-center gap-3 t-mono text-linen">
          <span aria-hidden className="matchday-pulse size-2 rounded-full bg-flamingo" />
          {label}
        </p>
        <p className="font-mono text-[0.8125rem] tracking-[0.14em] text-linen uppercase">
          <time dateTime={album.date}>{formatDate(album.date)}</time>
        </p>
      </div>

      {!cover ? (
        <div aria-hidden className="absolute inset-0 grid place-items-center pb-[18%] sm:pb-[6%]">
          <CrestPair crests={albumCrests(album)} size={72} className="sm:[--crest:104px]" />
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-[clamp(1.25rem,3vw,2.5rem)] md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {album.match ? (
            <p className="font-display text-[clamp(1.625rem,0.8rem+3.4vw,4.5rem)] leading-[0.92] font-extrabold break-words text-linen uppercase [font-stretch:125%]">
              {teamShort(album, "home")}
              <span className="mx-3 align-middle font-mono text-[0.3em] font-normal tracking-[0.2em] text-flamingo">vs</span>
              <br className="md:hidden" />
              {teamShort(album, "away")}
            </p>
          ) : (
            <p className="t-h1 text-linen">{album.title}</p>
          )}
          <p className="mt-3 t-mono text-taupe">{details}</p>
        </div>
        <span className="flex shrink-0 items-center gap-3 text-[0.9375rem] font-medium text-linen">
          {cover ? "Voir l'album" : "Photos à venir"}
          <span className="grid size-12 place-items-center rounded-full bg-flamingo text-ink transition-colors group-hover:bg-tango">
            <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </span>
      </div>
    </Link>
  );
}
