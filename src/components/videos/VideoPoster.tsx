import type { CSSProperties } from "react";
import { preload } from "react-dom";
import type { Video } from "@/lib/types";

type Props = {
  video: Video;
  /** Largeur affichée, pour que le navigateur choisisse le bon fichier du srcset. */
  sizes: string;
  /** Image visible dès l'arrivée sur la page : préchargée et demandée en priorité. */
  priority?: boolean;
  className?: string;
};

/**
 * Image d'aperçu d'une vidéo en <picture> : AVIF, WebP en repli, plusieurs largeurs.
 * Décorative (le titre de la vidéo est toujours écrit à côté).
 */
export function VideoPoster({ video, sizes, priority = false, className }: Props) {
  if (priority) {
    const largestAvif = video.poster.avif.split(", ").at(-1)!.split(" ")[0];
    preload(largestAvif, { as: "image", type: "image/avif", imageSrcSet: video.poster.avif, imageSizes: sizes, fetchPriority: "high" });
  }
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={video.poster.avif} sizes={sizes} />
      <img
        alt=""
        src={video.poster.src}
        srcSet={video.poster.webp}
        sizes={sizes}
        width={video.poster.width}
        height={video.poster.height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        draggable={false}
        className={className}
      />
    </picture>
  );
}

/** Fond affiché avant toute image : couleur dominante + mini-aperçu flou (inclus dans la page). */
export function posterBackdrop(video: Video): CSSProperties {
  return { backgroundColor: video.color, backgroundImage: `url("${video.blurDataURL}")`, backgroundSize: "cover", backgroundPosition: "center" };
}
