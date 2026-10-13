import type { CSSProperties } from "react";
import { ArrowLink } from "@/components/ui/Button";
import { SectionStamp } from "@/components/ui/SectionLabel";
import type { Video } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { VIDEOS_HREF } from "@/lib/videos";
import { ShareVideoButton } from "./ShareVideoButton";
import { VideoDownloadButton } from "./VideoDownloadButton";
import { VideoPlayer } from "./VideoPlayer";

/** « Vidéo du match » sur la page d'un album : lecteur sur place, téléchargement, partage. */
export function AlbumVideo({ video }: { video: Video }) {
  const ratio = (video.width / video.height).toFixed(4);
  return (
    <section id="video" aria-labelledby="video-title" className="container-wide scroll-mt-20 pb-[var(--section-space-sm)]">
      <SectionStamp id="video-title" meta={video.sport ?? undefined}>
        Vidéo du match
      </SectionStamp>
      <div
        className={`mt-10 grid grid-cols-1 gap-8 md:mt-14 ${video.vertical ? "items-center md:grid-cols-[var(--feature)_minmax(0,1fr)] md:gap-[clamp(2.5rem,6vw,6rem)]" : ""}`}
        style={{ "--feature": `min(46%, calc(80svh * ${ratio}))` } as CSSProperties}
      >
        <div data-reveal>
          <VideoPlayer
            video={video}
            sizes={video.vertical ? "(min-width: 768px) 45svh, 100vw" : "(min-width: 1776px) 1680px, 100vw"}
            className="mx-auto w-full rounded-[var(--radius-card)] md:mx-0"
            style={{ maxWidth: `min(100%, calc(${video.vertical ? 80 : 84}svh * ${ratio}))` }}
          />
        </div>
        <div className="max-w-md" data-reveal>
          <p className="t-mono text-ash">
            {formatDuration(video.duration)} · {video.vertical ? "Format vertical" : "Format 16:9"} · HD 720p
          </p>
          <h3 className="mt-3 text-[clamp(1.75rem,1.2rem+2vw,3rem)] leading-[1.05] font-light tracking-[-0.035em] text-linen">{video.title}</h3>
          <p className="mt-4 t-lead text-taupe">Le match en mouvement : à regarder ici, ou à garder en HD sur votre téléphone.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {video.download ? <VideoDownloadButton {...video.download} title={video.title} variant="ghost" /> : null}
            <ShareVideoButton href={video.href} title={video.title} />
          </div>
          <ArrowLink href={VIDEOS_HREF} className="mt-8">
            Toutes les vidéos
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
