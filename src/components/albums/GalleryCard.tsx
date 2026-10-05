import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { categoryContext } from "@/lib/albums";
import type { Album, Photo } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Props = {
  /** Album mis en avant : il a forcément une couverture. */
  album: Album & { cover: Photo };
  /** Ratio de l'image de couverture (classe Tailwind aspect-*). */
  frame?: string;
  sizes: string;
  headingLevel?: "h2" | "h3";
  revealDelay?: number;
  priority?: boolean;
};

/**
 * Carte d'un album mis en avant : la photo d'abord (angles 20px, aucun cadre),
 * puis une ligne « billet » (date · événement · nombre de photos) et le titre.
 */
export function GalleryCard({ album, frame = "aspect-[4/3]", sizes, headingLevel = "h3", revealDelay = 0, priority }: Props) {
  const Heading = headingLevel;
  const meta = [formatDate(album.date), album.event, `${album.photos.length} photos`];

  return (
    <Link href={album.href} className="photo-hover group block">
      <div data-reveal={priority ? undefined : "image"} style={{ "--reveal-delay": `${revealDelay}ms` } as CSSProperties}>
        <PhotoImage photo={album.cover} fill sizes={sizes} priority={priority} className={`${frame} rounded-[var(--radius-card)]`} />
      </div>
      <div className="mt-5 flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="t-mono text-ash">{meta.join("  ·  ")}</p>
          <Heading className="mt-2 t-h3 text-linen">
            <span className="link-underline">{album.title}</span>
          </Heading>
          <p className="mt-1 t-small text-taupe">{categoryContext(album.category)}</p>
        </div>
        <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-linen transition-[background-color,border-color,color] duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
          <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}
