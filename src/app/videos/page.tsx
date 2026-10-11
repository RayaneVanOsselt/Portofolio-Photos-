import type { Metadata } from "next";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { ButtonLink } from "@/components/ui/Button";
import { VideoDownloadButton } from "@/components/videos/VideoDownloadButton";
import { SPORT_NAME } from "@/lib/albums";
import { inArea, pageMetadata } from "@/lib/seo";
import type { Video } from "@/lib/types";
import { formatDate, pad } from "@/lib/utils";
import { getVideos, VIDEOS_HREF } from "@/lib/videos";

export const metadata: Metadata = pageMetadata({
  title: "Vidéos — hockey, football, rugby",
  description: `Les vidéos de match : résumés, ambiance et coulisses. À regarder en ligne ou à télécharger directement dans la galerie de votre téléphone. Vidéaste sportif${inArea}.`,
  path: VIDEOS_HREF,
});

/**
 * Vidéos (src/data/videos.ts), les plus récentes d'abord : lecture sur place,
 * et bouton « Télécharger » qui les enregistre dans Photos / la galerie sur téléphone.
 */
export default function VideosPage() {
  const videos = getVideos();

  return (
    <>
      <PageIntro
        crumbs={[{ name: "Vidéos", path: VIDEOS_HREF }]}
        kicker="Hockey · Football · Rugby"
        title="Vidéos"
        intro={
          <p>
            Résumés, ambiance et coulisses des matchs. Sur téléphone, touchez « Télécharger » : la vidéo s&apos;enregistre directement dans votre galerie.
          </p>
        }
        aside={videos.length ? <MetaList columns={2} items={[{ label: "Vidéos", value: pad(videos.length) }, { label: "Dernière", value: formatDate(videos[0].date) }]} /> : null}
      />

      <section aria-label="Toutes les vidéos" className="container-wide pb-[var(--section-space)]">
        {videos.length ? (
          <ul className="grid gap-x-5 gap-y-14 md:grid-cols-2">
            {videos.map((video) => (
              <li key={video.slug} id={video.slug} className="scroll-mt-[calc(var(--header-height)+1.5rem)]">
                <VideoCard video={video} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-line bg-wash px-[clamp(1.5rem,4vw,3rem)] py-[clamp(2.5rem,6vw,4.5rem)]">
            <p className="t-mono text-ash">Bientôt</p>
            <p className="t-h2 max-w-[22ch] text-linen">Les premières vidéos arrivent très vite.</p>
            <p className="t-lead max-w-[48ch] text-taupe">En attendant, retrouvez tous les matchs en photos.</p>
            <ButtonLink href="/albums" variant="signal">
              Voir les albums
            </ButtonLink>
          </div>
        )}
      </section>

      <ClosingCta />
    </>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <article className="flex h-full flex-col">
      <div className={`overflow-hidden rounded-[var(--radius-card)] border border-line bg-iron ${video.vertical ? "mx-auto aspect-[9/16] w-full max-w-[24rem]" : "aspect-video"}`}>
        {/* preload="none" : rien n'est chargé avant le premier « lecture » (page légère, même avec beaucoup de vidéos). */}
        <video controls playsInline preload={video.poster ? "none" : "metadata"} poster={video.poster} className="size-full object-cover" aria-label={video.title}>
          <source src={video.src} />
          <a href={video.src}>Ouvrir la vidéo</a>
        </video>
      </div>
      <div className="mt-5 flex items-start gap-4">
        {video.crest ? <ClubCrest crest={video.crest} size={44} /> : null}
        <div className="min-w-0 flex-1">
          <p className="t-mono text-ash">
            {formatDate(video.date)}
            {video.sport ? ` · ${SPORT_NAME[video.sport]}` : ""}
            {video.duration ? ` · ${video.duration}` : ""}
          </p>
          <h2 className="mt-2 text-[clamp(1.25rem,1rem+0.8vw,1.75rem)] leading-tight font-light tracking-[-0.03em] text-linen">{video.title}</h2>
          {video.description ? <p className="mt-3 t-small text-taupe">{video.description}</p> : null}
        </div>
      </div>
      {video.downloadEnabled ? (
        <div className="mt-5">
          <VideoDownloadButton src={video.src} filename={video.filename} title={video.title} bytes={video.bytes} />
        </div>
      ) : null}
    </article>
  );
}
