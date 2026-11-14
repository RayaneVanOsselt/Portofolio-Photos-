import Link from "next/link";
import type { CSSProperties } from "react";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { Parallax } from "@/components/effects/Parallax";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { getCategoryAlbums } from "@/lib/albums";
import type { Category, Photo } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Props = {
  category: Category;
  /** Grande photo d'ambiance (par défaut : la couverture de la catégorie). */
  photo?: Photo | null;
  kicker: string;
  text: string;
};

/**
 * « À la une » : la catégorie la plus prestigieuse (FIH Pro League) en très grand,
 * avec ses albums juste dessous. Réglages dans src/data/content.ts (`homeContent.spotlight`).
 */
export function Spotlight({ category, photo, kicker, text }: Props) {
  const albums = getCategoryAlbums(category).filter((a) => a.cover);
  const image = photo ?? category.cover;
  const photos = albums.reduce((sum, a) => sum + a.photos.length, 0);

  return (
    <section aria-labelledby="spotlight-title" className="container-wide section">
      <div className="relative isolate flex min-h-[min(88vh,52rem)] flex-col overflow-hidden rounded-[var(--radius-card)] bg-night">
        {image ? (
          <Parallax strength={70} className="absolute inset-x-0 -top-20 -bottom-20 -z-10">
            <PhotoImage photo={image} fill sizes="(min-width: 1776px) 1680px, 100vw" className="h-full" />
          </Parallax>
        ) : null}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(19_20_18/0.86)_0%,rgb(19_20_18/0.4)_55%,rgb(19_20_18/0.15)_100%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_45%,rgb(19_20_18/0.85)_100%)]" />

        <div className="flex items-center justify-between gap-6 p-[clamp(1.25rem,3.5vw,3rem)]">
          <p className="flex items-center gap-2.5 t-mono text-linen">
            <span aria-hidden className="text-sm leading-none text-flamingo">
              +
            </span>
            {kicker}
          </p>
          {category.crest ? <ClubCrest crest={category.crest} size={64} className="md:[--crest:92px]" /> : null}
        </div>

        <div className="mt-auto p-[clamp(1.25rem,3.5vw,3rem)]">
          <h2 id="spotlight-title" className="t-display text-linen" data-reveal>
            {category.title}
          </h2>
          <p className="mt-6 max-w-xl text-[clamp(1.0625rem,0.95rem+0.5vw,1.375rem)] leading-[1.5] font-light text-linen/85" data-reveal style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            {text}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" data-reveal style={{ "--reveal-delay": "200ms" } as CSSProperties}>
            <ButtonLink href={category.href} variant="signal" size="lg">
              Voir les albums {category.title}
            </ButtonLink>
            <p className="t-mono text-linen/70">
              {albums.length} matchs · {photos} photos
            </p>
          </div>
        </div>
      </div>

      {albums.length ? (
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {albums.map((album, i) => (
            <li key={album.href} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
              <Link href={album.href} className="photo-hover group grid grid-cols-[7.5rem_1fr] items-center gap-4 rounded-[var(--radius-card)] border border-line p-2.5 pr-4 transition-colors duration-300 hover:border-line-strong hover:bg-wash">
                <PhotoImage photo={album.cover!} fill sizes="120px" className="aspect-[4/3] rounded-[calc(var(--radius-card)-0.375rem)]" />
                <span className="min-w-0">
                  <span className="block t-mono text-ash">
                    {album.category.title} · {formatDate(album.date)}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-3 text-[1.0625rem] leading-snug font-medium text-linen">
                    <span className="link-underline truncate">{album.title}</span>
                    <ArrowUpRight size={16} className="shrink-0 text-ash transition-[color,transform] duration-500 group-hover:rotate-45 group-hover:text-linen" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
