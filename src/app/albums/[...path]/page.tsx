import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientRedirect } from "@/components/effects/ClientRedirect";
import { AlbumView } from "@/components/albums/AlbumView";
import { CategoryView } from "@/components/albums/CategoryView";
import { PhotoAccessBand } from "@/components/sections/PhotoAccessBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { ALBUMS_HREF, getAdjacentAlbums, getAlbumByPath, getAllAlbums, getAllCategories, getCategoryByPath, getCategoryTrail, getLegacyRedirect, getLegacyRedirects } from "@/lib/albums";
import { albumDescription, albumJsonLd, albumTitle, categoryDescription, categoryTitle, ogImageHref, pageMetadata, videoObjectJsonLd } from "@/lib/seo";
import type { Album } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { getAlbumVideo } from "@/lib/videos";

/**
 * Toute la section Albums, sur autant de niveaux que l'arborescence en compte :
 *   /albums/rugby                                       → catégorie
 *   /albums/daring/h1                                   → sous-catégorie
 *   /albums/daring/h1/20-09-2026-daring-h1-leo-h1       → album (match)
 * Les anciennes adresses (/albums/daring-h1/…) redirigent vers les nouvelles.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...getAllCategories().map((c) => ({ path: c.path })),
    ...getAllAlbums().map((a) => ({ path: a.path })),
    ...getLegacyRedirects().map((r) => ({ path: r.path })),
  ];
}

export async function generateMetadata({ params }: PageProps<"/albums/[...path]">): Promise<Metadata> {
  const { path } = await params;
  const legacy = getLegacyRedirect(path);
  if (legacy) return { alternates: { canonical: legacy }, robots: { index: false, follow: true } };
  const album = getAlbumByPath(path);
  if (album) {
    return pageMetadata({
      title: albumTitle(album),
      description: albumDescription(album),
      path: album.href,
      // Album privé, ou sans photo pour l'instant (page « Photos à venir ») : pas d'indexation.
      // Il devient indexable automatiquement dès que ses photos sont en ligne.
      noIndex: album.private || !album.photos.length,
      image: { url: ogImageHref(album.href), alt: `${album.title} — ${formatDate(album.date)}` },
    });
  }
  const category = getCategoryByPath(path);
  if (!category) return {};
  return pageMetadata({
    title: categoryTitle(category),
    description: categoryDescription(category),
    path: category.href,
    image: { url: ogImageHref(category.href), alt: `Albums photo ${category.fullTitle}` },
  });
}

export default async function AlbumsPathPage({ params }: PageProps<"/albums/[...path]">) {
  const { path } = await params;
  const legacy = getLegacyRedirect(path);
  if (legacy) return <LegacyRedirect to={legacy} />;
  const album = getAlbumByPath(path);
  if (album) return <AlbumPage album={album} />;
  const category = getCategoryByPath(path);
  if (!category) notFound();
  return <CategoryView category={category} />;
}

/** Ancienne adresse : redirection immédiate (lien de secours si JavaScript est désactivé). */
function LegacyRedirect({ to }: { to: string }) {
  return (
    <section className="container-site page-top section-sm">
      <meta httpEquiv="refresh" content={`0; url=${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${to}`} />
      <ClientRedirect to={to} />
      <p className="t-mono text-ash">Cette page a déménagé</p>
      <p className="mt-4 t-lead text-taupe">
        Redirection vers{" "}
        <Link href={to} className="text-linen underline underline-offset-4">
          la nouvelle adresse
        </Link>
        …
      </p>
    </section>
  );
}

/** Un album : en-tête, photos, puis les matchs voisins de la même catégorie. */
function AlbumPage({ album }: { album: Album }) {
  const { older, newer } = getAdjacentAlbums(album);
  const video = getAlbumVideo(album);
  const crumbs = album.private
    ? [
        { name: "Galeries", path: "/galeries" },
        { name: album.title, path: album.href },
      ]
    : [{ name: "Albums", path: ALBUMS_HREF }, ...getCategoryTrail(album.category).map((c) => ({ name: c.title, path: c.href })), { name: album.title, path: album.href }];

  return (
    <>
      <AlbumView album={album} crumbs={crumbs} video={video} />

      {album.photos.length ? <PhotoAccessBand context={album.title} withSearch={false} /> : null}

      {!album.private ? (
        <nav aria-label="Autres matchs" className="container-wide grid border-y border-line md:grid-cols-2">
          <AdjacentLink album={older} direction="previous" fallback={{ href: album.category.href, label: `Tous les albums ${album.category.fullTitle}` }} />
          <AdjacentLink album={newer} direction="next" fallback={{ href: ALBUMS_HREF, label: "Tous les albums" }} />
        </nav>
      ) : null}

      <div className="h-[var(--section-space-sm)]" />

      {!album.private ? <JsonLd data={albumJsonLd(album)} /> : null}
      {video && !album.private ? <JsonLd data={{ "@context": "https://schema.org", ...videoObjectJsonLd(video) }} /> : null}
    </>
  );
}

function AdjacentLink({ album, direction, fallback }: { album?: Album; direction: "previous" | "next"; fallback: { href: string; label: string } }) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;
  const icon = (
    <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line-strong text-linen transition-colors duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
      <Icon size={20} />
    </span>
  );
  return (
    <Link
      href={album?.href ?? fallback.href}
      className={`group flex min-w-0 items-center gap-6 py-8 md:py-12 ${isNext ? "justify-end border-t border-line text-right md:border-t-0 md:border-l md:pl-10" : "md:pr-10"}`}
    >
      {!isNext ? icon : null}
      <span className="min-w-0">
        <span className="block t-mono text-ash">{album ? `${isNext ? "Match suivant" : "Match précédent"} · ${formatDate(album.date)}` : "Retour"}</span>
        <span className="mt-2 block truncate text-[clamp(1.25rem,1rem+1vw,1.875rem)] font-light tracking-[-0.03em] text-linen">
          <span className="link-underline">{album?.title ?? fallback.label}</span>
        </span>
      </span>
      {isNext ? icon : null}
    </Link>
  );
}
