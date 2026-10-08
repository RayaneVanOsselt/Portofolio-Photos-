import type { CSSProperties } from "react";
import type { Photo } from "@/lib/types";
import { PhotoPicture } from "./PhotoPicture";

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
 * Cadre photo du système : couleur dominante et mini-aperçu flou en attente,
 * ratio réservé (pas de décalage de mise en page), AVIF + repli WebP, chargement
 * différé par défaut et apparition en fondu une fois l'image reçue.
 */
export function PhotoImage({ photo, sizes, fill, priority, className = "", imgClassName = "", position, style }: Props) {
  const frameStyle = {
    "--photo-color": photo.color,
    // Mini-aperçu flou (≈ 150 octets) sous l'image, le temps qu'elle arrive.
    backgroundImage: photo.blurDataURL ? `url("${photo.blurDataURL}")` : undefined,
    backgroundSize: "cover",
    backgroundPosition: position ?? "center",
    ...(fill ? {} : { aspectRatio: `${photo.width} / ${photo.height}` }),
    ...style,
  } as CSSProperties;

  return (
    <div className={`photo-frame ${className}`} style={frameStyle}>
      <PhotoPicture
        photo={photo}
        sizes={sizes}
        priority={priority}
        fadeIn
        className={`${fill ? "absolute inset-0" : ""} h-full w-full object-cover ${imgClassName}`}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  );
}
