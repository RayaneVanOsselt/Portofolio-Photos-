import Image from "next/image";
import type { CSSProperties } from "react";
import type { Crest } from "@/lib/types";
import { publicPath } from "@/lib/utils";

type Props = {
  crest: Crest;
  /** Diamètre de la pastille en px. Modifiable par point de rupture : `className="md:[--crest:96px]"`. */
  size?: number;
  /**
   * Texte alternatif. Vide par défaut : le nom du club est presque toujours écrit
   * juste à côté (un lecteur d'écran l'annoncerait deux fois).
   */
  alt?: string;
  /** Logo visible dès l'arrivée sur la page (en-tête) : chargé sans attendre. */
  eager?: boolean;
  className?: string;
};

/**
 * Logo d'un club ou d'une compétition sur une pastille blanche : lisible sur le
 * fond sombre quelles que soient ses couleurs, même taille pour tous les clubs,
 * proportions préservées (le logo est contenu, jamais déformé ni rogné).
 * Fichier WebP de quelques Ko, chargé en différé hors de l'écran.
 */
export function ClubCrest({ crest, size = 40, alt = "", eager = false, className = "" }: Props) {
  return (
    <span
      className={`inline-grid size-[var(--crest-size)] shrink-0 place-items-center rounded-full bg-white ${className}`}
      // `--crest` (posé sur l'élément ou un parent, ex. `md:[--crest:96px]`) l'emporte sur `size`.
      style={{ "--crest-size": `var(--crest, ${size}px)` } as CSSProperties}
    >
      {/* Fichier unique de quelques Ko (npm run logos) : servi tel quel, sans déclinaisons. */}
      <Image
        src={publicPath(crest.src)}
        alt={alt}
        width={crest.width}
        height={crest.height}
        unoptimized
        loading={eager ? "eager" : "lazy"}
        className="h-[68%] w-[68%] object-contain"
      />
    </span>
  );
}

/** Logos de deux équipes face à face (« Daring · vs · Léopold ») ; un seul si l'autre est inconnu. */
export function CrestPair({ crests, size = 40, eager, className = "" }: { crests: Crest[]; size?: number; eager?: boolean; className?: string }) {
  if (!crests.length) return null;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {crests.map((crest, i) => (
        <span key={crest.id} className="contents">
          {i ? (
            <span aria-hidden className="font-mono text-[0.625rem] tracking-[0.18em] text-ash uppercase">
              vs
            </span>
          ) : null}
          <ClubCrest crest={crest} size={size} eager={eager} />
        </span>
      ))}
    </span>
  );
}
