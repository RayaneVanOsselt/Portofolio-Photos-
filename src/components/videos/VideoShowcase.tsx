"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { SectionLabel, SectionStamp } from "@/components/ui/SectionLabel";
import { ArrowUpRight, Play } from "@/components/ui/Icons";
import { useTeaser } from "@/hooks/useTeaser";
import type { Video } from "@/lib/types";
import { formatDate, formatDuration, pad, spokenDuration } from "@/lib/utils";
import { useTheater } from "./useTheater";
import { VideoCard } from "./VideoCard";
import { VideoDownloadButton } from "./VideoDownloadButton";
import { posterBackdrop, VideoPoster } from "./VideoPoster";

/**
 * Page Vidéos : la vidéo à la une en grand (aperçu animé en boucle), un bandeau
 * défilant, puis toutes les autres en cartes. Un clic ouvre le lecteur plein écran.
 */
export function VideoShowcase({ videos, featured }: { videos: Video[]; featured: string }) {
  const { show, theater } = useTheater(videos);
  const featuredIndex = Math.max(0, videos.findIndex((v) => v.slug === featured));
  const others = videos.map((video, index) => ({ video, index })).filter(({ index }) => index !== featuredIndex);

  return (
    <>
      <Featured video={videos[featuredIndex]} onOpen={() => show(featuredIndex)} />

      <Marquee titles={videos.map((v) => v.title)} />

      {others.length ? (
        <section aria-labelledby="videos-title" className="container-wide pb-[var(--section-space)]">
          <SectionStamp id="videos-title" index="01" meta={`${pad(others.length)} vidéo${others.length > 1 ? "s" : ""}`}>
            Plus de vidéos
          </SectionStamp>
          <ul className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 md:mt-14 xl:grid-cols-4">
            {others.map(({ video, index }, i) => (
              <li key={video.slug} id={video.slug} className="scroll-mt-[calc(var(--header-height)+1.5rem)]">
                <VideoCard video={video} onOpen={() => show(index)} delay={(i % 4) * 90} sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {theater}
    </>
  );
}

const delay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/** La vidéo à la une : grand format, aperçu animé dès qu'elle est à l'écran. */
function Featured({ video, onOpen }: { video: Video; onOpen: () => void }) {
  const { root, video: teaser } = useTeaser<HTMLButtonElement>(video.teaser, { always: true });
  const ratio = (video.width / video.height).toFixed(4);

  return (
    <section aria-labelledby="featured-title" className="container-wide pb-[var(--section-space-sm)]">
      <div
        className={`grid grid-cols-1 gap-10 ${video.vertical ? "items-center md:grid-cols-[var(--feature)_minmax(0,1fr)] md:gap-[clamp(2.5rem,6vw,7rem)]" : ""}`}
        // Colonne de la vidéo verticale : jamais plus haute que 80 % de l'écran.
        style={{ "--feature": `min(46%, calc(80svh * ${ratio}))` } as CSSProperties}
      >
        <button
          ref={root}
          type="button"
          onClick={onOpen}
          data-reveal="image"
          aria-label={`Regarder « ${video.title} » (${spokenDuration(video.duration)})`}
          className="video-frame group/card relative mx-auto block w-full overflow-hidden rounded-[var(--radius-card)] md:mx-0"
          style={{
            ...posterBackdrop(video),
            aspectRatio: `${video.width} / ${video.height}`,
            maxWidth: `min(100%, calc(${video.vertical ? 80 : 84}svh * ${ratio}))`,
          }}
        >
          <VideoPoster
            video={video}
            priority
            sizes={video.vertical ? "(min-width: 768px) 45svh, 100vw" : "(min-width: 1776px) 1680px, 100vw"}
            className="video-poster absolute inset-0 size-full object-cover"
          />
          <video ref={teaser} className="video-teaser absolute inset-0 size-full object-cover" muted loop playsInline preload="none" disablePictureInPicture disableRemotePlayback aria-hidden tabIndex={-1} />
          <span aria-hidden className="video-scrim absolute inset-0" />

          <span aria-hidden className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-night/60 px-3 py-1.5 t-mono text-linen backdrop-blur-sm">
            <span className="matchday-pulse size-1.5 rounded-full bg-flamingo" />À la une
          </span>
          <span aria-hidden className="absolute top-5 right-5 rounded-full bg-night/60 px-2.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-linen backdrop-blur-sm">
            {formatDuration(video.duration)}
          </span>
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <span className="player-start-button video-play-big relative grid size-20 place-items-center rounded-full bg-flamingo text-ink md:size-24">
              <Play size={30} className="translate-x-0.5" />
            </span>
          </span>
        </button>

        <div className="min-w-0">
          <div data-reveal style={delay(80)}>
            <SectionLabel>Dernière vidéo</SectionLabel>
          </div>
          {video.crests.length ? (
            <div className="mt-8 flex items-center gap-3" data-reveal style={delay(140)}>
              {video.crests.map((crest) => (
                <ClubCrest key={crest.id} crest={crest} size={56} eager />
              ))}
            </div>
          ) : null}
          <h2 id="featured-title" className="t-h1 mt-6 text-linen" data-reveal style={delay(200)}>
            {video.title}
          </h2>
          {video.description ? (
            <p className="mt-6 max-w-xl t-lead text-taupe" data-reveal style={delay(260)}>
              {video.description}
            </p>
          ) : null}

          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-x-6 border-t border-line pt-6" data-reveal style={delay(300)}>
            {[
              { label: "Match", value: <time dateTime={video.date}>{formatDate(video.date)}</time> },
              { label: "Durée", value: formatDuration(video.duration) },
              { label: "Format", value: video.vertical ? "Vertical" : "16:9" },
            ].map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="t-mono text-ash">{item.label}</dt>
                <dd className="mt-2 text-[clamp(0.9375rem,0.85rem+0.4vw,1.125rem)] text-linen t-tabular">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal style={delay(360)}>
            <button type="button" onClick={onOpen} className="group/btn inline-flex h-12 items-center gap-2.5 rounded-full bg-flamingo px-6 text-[0.9375rem] font-medium text-ink transition-colors duration-300 hover:bg-tango active:scale-[0.98]">
              <Play size={16} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:scale-125" />
              Regarder la vidéo
            </button>
            {video.download ? <VideoDownloadButton {...video.download} title={video.title} variant="ghost" /> : null}
          </div>
          {video.album ? (
            <Link href={video.album.href} className="group/al mt-6 inline-flex items-center gap-3 text-[0.9375rem] font-medium text-linen" data-reveal style={delay(420)}>
              <span className="link-underline">{video.album.photoCount ? `Les ${video.album.photoCount} photos du match` : "L'album du match"}</span>
              <span className="inline-grid size-8 place-items-center rounded-full border border-line-strong transition-[background-color,border-color,color] duration-300 group-hover/al:border-flamingo group-hover/al:bg-flamingo group-hover/al:text-ink">
                <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/al:rotate-45" />
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Bandeau défilant des titres (décoratif ; immobile si « réduire les animations »). */
function Marquee({ titles }: { titles: string[] }) {
  // Assez de titres pour couvrir les grands écrans, puis la même suite une seconde fois (boucle sans raccord).
  const run = Array.from({ length: Math.ceil(8 / titles.length) }, () => titles).flat();
  return (
    <div aria-hidden className="marquee mb-[var(--section-space-sm)] overflow-hidden border-y border-line py-5 md:py-7">
      <div className="marquee-track flex w-max">
        {[...run, ...run].map((title, i) => (
          <span key={i} className="marquee-item flex items-center pr-[clamp(1.5rem,3vw,3rem)]">
            <span className={i % 2 ? "marquee-outline" : "text-linen"}>{title}</span>
            <span className="ml-[clamp(1.5rem,3vw,3rem)] size-2 rounded-full bg-flamingo md:size-3" />
          </span>
        ))}
      </div>
    </div>
  );
}
