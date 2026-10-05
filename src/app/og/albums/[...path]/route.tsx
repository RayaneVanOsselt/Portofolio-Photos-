import { albumCrests, categoryContext, getAlbumByPath, getAllAlbums, getAllCategories, getCategoryByPath } from "@/lib/albums";
import { renderOgImage } from "@/lib/og";
import { formatDate } from "@/lib/utils";

/**
 * Images de partage (réseaux sociaux, messageries) de la section Albums,
 * générées au build : /og/albums/daring-h1/20-09-2026-daring-h1-leo-h1.png
 * (équipes, date, logos, et la photo de couverture dès qu'elle existe).
 * Référencées par les métadonnées des pages (src/app/albums/[...path]/page.tsx).
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const withPng = (path: string[]) => [...path.slice(0, -1), `${path.at(-1)}.png`];

export function generateStaticParams() {
  return [...getAllCategories().map((c) => ({ path: withPng(c.path) })), ...getAllAlbums().map((a) => ({ path: withPng(a.path) }))];
}

export async function GET(_request: Request, { params }: RouteContext<"/og/albums/[...path]">) {
  const segments = (await params).path;
  const path = [...segments.slice(0, -1), segments.at(-1)!.replace(/\.png$/, "")];
  const album = getAlbumByPath(path);
  if (album) {
    return renderOgImage({ kicker: `${categoryContext(album.category)} · ${formatDate(album.date)}`, title: album.title, photo: album.cover, crests: albumCrests(album) });
  }
  const category = getCategoryByPath(path);
  if (!category) return new Response("Introuvable", { status: 404 });
  return renderOgImage({ kicker: category.kicker, title: category.fullTitle, photo: category.cover, crests: category.crest ? [category.crest] : [] });
}
