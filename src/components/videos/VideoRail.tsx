"use client";

import type { Video } from "@/lib/types";
import { useTheater } from "./useTheater";
import { VideoCard } from "./VideoCard";

/**
 * Rangée de vidéos (accueil) : défilement horizontal aimanté sur téléphone,
 * toutes visibles sur grand écran. Un clic ouvre le lecteur plein écran, sans quitter la page.
 */
export function VideoRail({ videos }: { videos: Video[] }) {
  const { show, theater } = useTheater(videos);
  return (
    <>
      <ul className="-mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden">
        {videos.map((video, i) => (
          <li key={video.slug} className="w-[min(72vw,19rem)] shrink-0 snap-start xl:w-auto xl:min-w-0 xl:flex-1">
            <VideoCard video={video} onOpen={() => show(i)} delay={i * 80} headingLevel={3} sizes="(min-width: 1280px) 20vw, 72vw" />
          </li>
        ))}
      </ul>
      {theater}
    </>
  );
}
