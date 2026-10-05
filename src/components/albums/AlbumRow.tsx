import Link from "next/link";
import { CrestPair } from "@/components/clubs/ClubCrest";
import { ArrowUpRight } from "@/components/ui/Icons";
import { albumCrests, categoryContext } from "@/lib/albums";
import type { Album } from "@/lib/types";
import { formatDateMedium } from "@/lib/utils";
import { matchContext, photoCountLabel, scoreLine } from "./match-format";

/**
 * Une ligne de liste chronologique, comme un talon de billet :
 * date · logos · affiche (« Daring H1 vs Leo H1 ») · catégorie · photos.
 * Fonctionne sans photo : idéale pour parcourir de nombreux matchs.
 */
export function AlbumRow({ album, showCategory = true }: { album: Album; showCategory?: boolean }) {
  const score = scoreLine(album);
  const context = [showCategory ? categoryContext(album.category) : null, score, matchContext(album)].filter(Boolean).join("  ·  ");

  return (
    <Link
      href={album.href}
      className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-4 transition-colors duration-300 hover:bg-wash md:grid-cols-[7.5rem_5.5rem_1fr_9rem_auto] md:gap-6 md:px-3"
    >
      <time dateTime={album.date} className="font-mono text-[0.75rem] leading-snug tracking-[0.1em] text-taupe uppercase md:text-[0.8125rem]">
        {formatDateMedium(album.date)}
      </time>
      <span className="hidden md:block">
        <CrestPair crests={albumCrests(album)} size={30} />
      </span>
      <span className="min-w-0">
        <span className="block text-lg leading-snug font-medium tracking-[-0.015em] text-linen md:text-xl">
          {album.match ? (
            <>
              {album.match.home}
              <span className="mx-2 font-mono text-[0.75rem] tracking-[0.18em] text-flamingo uppercase">vs</span>
              {album.match.away}
            </>
          ) : (
            album.title
          )}
        </span>
        {context ? <span className="mt-0.5 block truncate t-small text-taupe">{context}</span> : null}
      </span>
      <span className="hidden t-mono text-ash md:block">{photoCountLabel(album.photos.length)}</span>
      <span className="grid size-10 place-items-center rounded-full border border-line-strong text-linen transition-[background-color,border-color,color] duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
        <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
      </span>
    </Link>
  );
}

/** Albums regroupés par mois (« Octobre 2026 »), les plus récents d'abord. */
export function AlbumTimeline({ albums, showCategory = true, headingLevel = "h3" }: { albums: Album[]; showCategory?: boolean; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const months = new Map<string, Album[]>();
  for (const album of albums) months.set(album.date.slice(0, 7), [...(months.get(album.date.slice(0, 7)) ?? []), album]);
  return (
    <div className="space-y-12">
      {[...months.entries()].map(([month, items]) => (
        <div key={month}>
          <Heading className="t-mono text-flamingo">{monthLabel(month)}</Heading>
          <ul className="mt-3 border-t border-line">
            {items.map((album) => (
              <li key={album.href} className="border-b border-line">
                <AlbumRow album={album} showCategory={showCategory} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** « 2026-10 » → « Octobre 2026 » */
function monthLabel(month: string) {
  const label = new Intl.DateTimeFormat("fr-BE", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-15T12:00:00Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
