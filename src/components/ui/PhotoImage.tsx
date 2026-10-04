"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { Photo } from "@/lib/types";

type Props = {
  photo: Photo;
  /** Attribut sizes : décrit la largeur affichée pour choisir la bonne image du srcset. */
  sizes: string;
  /** Remplit son parent (object-fit: cover) au lieu de garder son ratio. */
  fill?: boolean;
  /** Image critique (au-dessus de la ligne de flottaison). */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  position?: string;
  style?: CSSProperties;
};

/**
 * Cadre photo du système : couleur dominante en attente, ratio réservé
 * (pas de décalage de mise en page), chargement différé par défaut et
 * apparition en fondu une fois l'image reçue.
 */
export function PhotoImage({ photo, sizes, fill, priority, className = "", imgClassName = "", position, style }: Props) {
  const frameStyle = { "--photo-color": photo.color, ...style } as CSSProperties;
  const placeholder = photo.blurDataURL ? "blur" : "empty";
  const common = {
    src: photo.src,
    sizes,
    preload: priority,
    fetchPriority: priority ? ("high" as const) : undefined,
    placeholder: placeholder as "blur" | "empty",
    blurDataURL: photo.blurDataURL,
    // Les images prioritaires s'affichent immédiatement ; les autres en fondu.
    "data-loaded": priority ? undefined : "false",
    onLoad: (event: React.SyntheticEvent<HTMLImageElement>) => {
      event.currentTarget.dataset.loaded = "true";
    },
  };

  if (fill) {
    return (
      <div className={`photo-frame ${className}`} style={frameStyle}>
        <Image {...common} alt={photo.alt} fill className={`object-cover ${imgClassName}`} style={position ? { objectPosition: position } : undefined} />
      </div>
    );
  }

  return (
    <div className={`photo-frame ${className}`} style={{ ...frameStyle, aspectRatio: `${photo.width} / ${photo.height}` }}>
      <Image {...common} alt={photo.alt} width={photo.width} height={photo.height} className={`h-full w-full object-cover ${imgClassName}`} />
    </div>
  );
}
