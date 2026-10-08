import Link from "next/link";
import { CrestPair } from "@/components/clubs/ClubCrest";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { albumCrests, categoryContext } from "@/lib/albums";
import type { Album } from "@/lib/types";
import { formatDateMedium } from "@/lib/utils";
import { photoCountLabel } from "./match-format";

type Props = {
  album: Album;
  headingLevel?: "h3" | "h4";
  /** Carte visible au chargement : couverture demandée en priorité. */
  priority?: boolean;
};

/**
 * Un match dans une grille (calendrier) : la couverture d'abord, la date posée
 * dessus, puis la catégorie, l'affiche et les logos. Sans photo pour l'instant,
 * un cadre sobre « Photos à venir » garde la grille régulière.
 */
export function MatchCard({ album, headingLevel: Heading = "h3", priority = false }: Props) {
  const count = album.photos.length;
  return (
    <Link href={album.href} className="photo-hover group flex h-full flex-col">
      <div className="relative">
        {album.cover ? (
          <PhotoImage
            photo={album.cover}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 27vw, (min-width: 640px) 45vw, 100vw"
            className="aspect-[3/2] rounded-[var(--radius-card)]"
          />
        ) : (
          <div className="grid aspect-[3/2] place-items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-wash">
            <span className="t-mono text-ash">Photos à venir</span>
          </div>
        )}
        <time dateTime={album.date} className="glass absolute top-3 left-3 rounded-full px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-linen uppercase">
          {formatDateMedium(album.date)}
        </time>
        {count ? (
          <span className="absolute right-3 bottom-3 rounded-full bg-ink/75 px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.12em] text-linen uppercase backdrop-blur-sm">
            {photoCountLabel(count)}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-1 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate t-mono text-ash">{categoryContext(album.category)}</p>
          <Heading className="mt-2 text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] leading-snug font-light tracking-[-0.02em] text-linen">
            <span className="link-underline">{album.title}</span>
          </Heading>
        </div>
        <CrestPair crests={albumCrests(album)} size={30} className="shrink-0" />
      </div>
    </Link>
  );
}
