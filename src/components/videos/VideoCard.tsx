"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { Play } from "@/components/ui/Icons";
import { useTeaser } from "@/hooks/useTeaser";
import type { Video } from "@/lib/types";
import { formatDateMedium, formatDuration, spokenDuration } from "@/lib/utils";
import { posterBackdrop, VideoPoster } from "./VideoPoster";

type Props = {
  video: Video;
  onOpen: () => void;
  /** Largeur affichée de la carte (srcset de l'image d'aperçu). */
  sizes: string;
  /** Décalage de l'apparition au défilement (cascade). */
  delay?: number;
  /** Titre de niveau h2 (page Vidéos) ou h3 (section de l'accueil). */
  headingLevel?: 2 | 3;
};

/**
 * Carte vidéo : image d'aperçu au format 4:5, aperçu animé au survol (ou quand
 * la carte occupe l'écran sur téléphone), avec ses 4 segments façon « stories ».
 * Un clic ouvre le lecteur plein écran.
 */
export function VideoCard({ video, onOpen, sizes, delay = 0, headingLevel = 2 }: Props) {
  const { root, video: teaser } = useTeaser<HTMLButtonElement>(video.teaser);
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className="group/card" data-reveal style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      <button
        ref={root}
        type="button"
        onClick={onOpen}
        aria-label={`Regarder « ${video.title} » (${spokenDuration(video.duration)})`}
        className="video-frame relative block aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] text-left"
        style={posterBackdrop(video)}
      >
        <VideoPoster video={video} sizes={sizes} className="video-poster absolute inset-0 size-full object-cover" />
        <video
          ref={teaser}
          className="video-teaser absolute inset-0 size-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          tabIndex={-1}
        />
        <span aria-hidden className="video-scrim absolute inset-0" />

        {/* Segments de l'aperçu (4 extraits), remplis au fil de la lecture */}
        <span aria-hidden className="teaser-segments absolute inset-x-4 top-4 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-[2px] flex-1 overflow-hidden rounded-full bg-linen/25">
              <span className="block h-full bg-linen" style={{ "--i": i } as CSSProperties} />
            </span>
          ))}
        </span>

        <span aria-hidden className="absolute top-8 right-4 rounded-full bg-night/60 px-2.5 py-1 font-mono text-[0.6875rem] tracking-[0.1em] text-linen backdrop-blur-sm">
          {formatDuration(video.duration)}
        </span>

        <span aria-hidden className="video-play absolute bottom-4 left-4 grid size-14 place-items-center rounded-full bg-linen text-ink">
          <Play size={20} className="translate-x-px" />
        </span>

        {video.crests.length ? (
          <span aria-hidden className="absolute right-4 bottom-4 flex -space-x-2">
            {video.crests.map((crest) => (
              <ClubCrest key={crest.id} crest={crest} size={36} className="ring-2 ring-night/40" />
            ))}
          </span>
        ) : null}
      </button>

      <div className="mt-4">
        <p className="t-mono text-ash">
          <time dateTime={video.date}>{formatDateMedium(video.date)}</time>
          {video.sport ? ` · ${video.sport}` : ""}
        </p>
        <Heading className="mt-2 text-[clamp(1.125rem,1rem+0.5vw,1.5rem)] leading-tight font-light tracking-[-0.025em] text-linen">
          <button type="button" onClick={onOpen} tabIndex={-1} className="link-underline text-left">
            {video.title}
          </button>
        </Heading>
        {video.album?.photoCount ? (
          <Link href={video.album.href} className="mt-2 inline-flex t-small text-taupe transition-colors hover:text-flamingo">
            {video.album.photoCount} photos du match →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
