"use client";

import type { CSSProperties, Ref } from "react";
import { preload } from "react-dom";
import { fallbackUrl, isLocalPhoto, largestUrl, srcSetFor, unsplashUrl } from "@/lib/photo-sources";
import type { Photo } from "@/lib/types";

type Props = {
  photo: Photo;
  /** Largeur affichée, pour que le navigateur choisisse le bon fichier du srcset. */
  sizes: string;
  /** Image critique (hero, couverture en haut de page) : préchargée et demandée en priorité. */
  priority?: boolean;
  /** Chargée tout de suite, sans préchargement (visionneuse, photos voisines). */
  eager?: boolean;
  /** Texte alternatif ; vide pour une image décorative. Par défaut : celui de la photo. */
  alt?: string;
  className?: string;
  style?: CSSProperties;
  draggable?: boolean;
  /** Fondu à l'arrivée (voir .photo-frame dans globals.css). */
  fadeIn?: boolean;
};

const UNSPLASH_WIDTHS = [640, 1080, 1600, 2400];

/** Marque l'image comme chargée, y compris si elle l'était avant l'hydratation. */
const markLoaded = (img: HTMLImageElement | null) => {
  if (img?.complete && img.naturalWidth) img.dataset.loaded = "true";
};

/**
 * Une photo en <picture> : AVIF pour les navigateurs qui le lisent (≈ 30 % plus
 * léger que le WebP), WebP sinon. Dimensions réservées (width/height : pas de
 * décalage de mise en page), chargement différé et décodage asynchrone par défaut ;
 * une image prioritaire est préchargée en AVIF et demandée en haute priorité.
 */
export function PhotoPicture({ photo, sizes, priority = false, eager = false, alt = photo.alt, className, style, draggable, fadeIn = false }: Props) {
  const local = isLocalPhoto(photo.src);
  const avif = local ? srcSetFor(photo, "avif") : undefined;
  if (priority && avif) preload(largestUrl(photo, "avif"), { as: "image", type: "image/avif", imageSrcSet: avif, imageSizes: sizes, fetchPriority: "high" });

  const img = {
    sizes,
    width: photo.width,
    height: photo.height,
    loading: priority || eager ? ("eager" as const) : ("lazy" as const),
    decoding: priority ? ("sync" as const) : ("async" as const),
    fetchPriority: priority ? ("high" as const) : undefined,
    className,
    style,
    draggable,
    ...(fadeIn && !priority
      ? {
          "data-loaded": "false",
          ref: markLoaded as Ref<HTMLImageElement>,
          onLoad: (event: React.SyntheticEvent<HTMLImageElement>) => {
            event.currentTarget.dataset.loaded = "true";
          },
        }
      : {}),
  };

  if (!local) {
    // Photo temporaire (Unsplash) : un seul srcset, le CDN choisit le format.
    const srcSet = UNSPLASH_WIDTHS.map((w) => `${unsplashUrl(photo.src, w)} ${w}w`).join(", ");
    // eslint-disable-next-line @next/next/no-img-element -- photo temporaire servie par le CDN d'Unsplash
    return <img alt={alt} {...img} src={unsplashUrl(photo.src, 1080)} srcSet={srcSet} />;
  }

  return (
    <picture className="contents">
      <source type="image/avif" srcSet={avif} sizes={sizes} />
      <img alt={alt} {...img} src={fallbackUrl(photo)} srcSet={srcSetFor(photo, "webp")} />
    </picture>
  );
}
