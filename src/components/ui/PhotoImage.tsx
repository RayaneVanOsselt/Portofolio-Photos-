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
 * (pas de décalage de mise en page), chargement différé par défaut.
 */
export function PhotoImage({ photo, sizes, fill, priority, className = "", imgClassName = "", position, style }: Props) {
  const frameStyle = { "--photo-color": photo.color, ...style } as CSSProperties;
  const placeholder = photo.blurDataURL ? "blur" : "empty";

  if (fill) {
    return (
      <div className={`photo-frame ${className}`} style={frameStyle}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          placeholder={placeholder}
          blurDataURL={photo.blurDataURL}
          className={`object-cover ${imgClassName}`}
          style={position ? { objectPosition: position } : undefined}
        />
      </div>
    );
  }

  return (
    <div className={`photo-frame ${className}`} style={{ ...frameStyle, aspectRatio: `${photo.width} / ${photo.height}` }}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        preload={priority}
        fetchPriority={priority ? "high" : undefined}
        placeholder={placeholder}
        blurDataURL={photo.blurDataURL}
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
