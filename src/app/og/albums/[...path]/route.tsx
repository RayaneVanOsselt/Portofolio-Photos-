import sharp from "sharp";
import { albumCrests, categoryContext, getAlbumByPath, getAllAlbums, getAllCategories, getCategoryByPath } from "@/lib/albums";
import { renderOgImage } from "@/lib/og";
import { formatDate } from "@/lib/utils";

/**
 * Images de partage (réseaux sociaux, messageries) de la section Albums,
 * générées au build : /og/albums/daring/h1/20-09-2026-daring-h1-leo-h1.jpg
 * (équipes, date, logos, et la photo de couverture dès qu'elle existe).
 * Référencées par les métadonnées des pages (src/app/albums/[...path]/page.tsx).
 */
export const dynamic = "force-static";
export const dynamicParams = false;

const withJpg = (path: string[]) => [...path.slice(0, -1), `${path.at(-1)}.jpg`];

export function generateStaticParams() {
  return [...getAllCategories().map((c) => ({ path: withJpg(c.path) })), ...getAllAlbums().map((a) => ({ path: withJpg(a.path) }))];
}

/**
 * Le moteur de rendu produit un PNG (~1,4 Mo) ; l'image n'ayant pas de transparence,
 * un JPEG est identique à l'œil et 10 fois plus léger (~0,1 Mo) — le site reste sous
 * la limite de 1 Go de GitHub Pages.
 */
async function asJpeg(image: Response) {
  const jpeg = await sharp(Buffer.from(await image.arrayBuffer())).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg" } });
}

export async function GET(_request: Request, { params }: RouteContext<"/og/albums/[...path]">) {
  const segments = (await params).path;
  const path = [...segments.slice(0, -1), segments.at(-1)!.replace(/\.jpg$/, "")];
  const album = getAlbumByPath(path);
  if (album) {
    return asJpeg(await renderOgImage({ kicker: `${categoryContext(album.category)} · ${formatDate(album.date)}`, title: album.title, photo: album.cover, crests: albumCrests(album) }));
  }
  const category = getCategoryByPath(path);
  if (!category) return new Response("Introuvable", { status: 404 });
  return asJpeg(await renderOgImage({ kicker: category.kicker, title: category.fullTitle, photo: category.cover, crests: category.crest ? [category.crest] : [] }));
}
