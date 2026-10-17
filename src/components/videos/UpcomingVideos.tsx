import Link from "next/link";
import { CrestPair } from "@/components/clubs/ClubCrest";
import { ArrowUpRight, Film } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { UpcomingVideo } from "@/lib/types";
import { formatDateMedium } from "@/lib/utils";

/**
 * Vidéos annoncées (fiche dans src/data/videos.ts, fichier pas encore préparé) :
 * le titre du match est déjà là, dans un cadre sobre « Vidéo à venir », comme les
 * albums « Photos à venir ». Remplacées toutes seules par la vidéo après `npm run videos`.
 */
export function UpcomingVideos({ videos }: { videos: UpcomingVideo[] }) {
  return (
    <section aria-label="Vidéos à venir" className="container-wide pb-[var(--section-space-sm)]">
      <SectionLabel>Bientôt en ligne</SectionLabel>
      <ul className={`mt-6 grid gap-4 ${videos.length > 1 ? "lg:grid-cols-2" : "max-w-4xl"}`}>
        {videos.map((video) => (
          <li key={video.slug} id={video.slug} className="scroll-mt-[calc(var(--header-height)+1.5rem)]">
            <article className="flex h-full flex-col gap-5 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-wash p-5 sm:flex-row sm:items-center md:p-6">
              {video.crests.length ? (
                <CrestPair crests={video.crests} size={52} className="shrink-0" />
              ) : (
                <span aria-hidden className="grid size-[52px] shrink-0 place-items-center rounded-full border border-line-strong text-ash">
                  <Film size={20} />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="t-mono text-ash">
                  <time dateTime={video.date}>{formatDateMedium(video.date)}</time>
                  {video.sport ? ` · ${video.sport}` : ""}
                </p>
                <h2 className="mt-2 text-[clamp(1.125rem,1rem+0.5vw,1.5rem)] leading-tight font-light tracking-[-0.025em] text-linen">{video.title}</h2>
                <p className="mt-3 inline-flex items-center gap-2 t-mono text-flamingo">
                  <span aria-hidden className="matchday-pulse size-1.5 rounded-full bg-flamingo" />
                  Vidéo à venir
                </p>
              </div>
              {video.album ? (
                <Link href={video.album.href} className="group/al inline-flex shrink-0 items-center gap-3 self-start text-[0.9375rem] font-medium text-linen sm:self-center">
                  <span className="link-underline">{video.album.photoCount ? `Les ${video.album.photoCount} photos` : "L'album du match"}</span>
                  <span className="inline-grid size-8 place-items-center rounded-full border border-line-strong transition-[background-color,border-color,color] duration-300 group-hover/al:border-flamingo group-hover/al:bg-flamingo group-hover/al:text-ink">
                    <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/al:rotate-45" />
                  </span>
                </Link>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
