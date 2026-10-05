import { createHash } from "node:crypto";
import { albumCrests, categoryContext, getAlbums, getAllAlbums, getCategories } from "@/lib/albums";
import { albumKeywords } from "@/lib/search-index";
import type { Photo } from "@/lib/types";
import { formatDate, formatDateShort } from "@/lib/utils";

/** Album sérialisable, transmis au moteur de recherche de la page Galeries (client). */
export type GalleryEntry = {
  slug: string;
  title: string;
  href: string;
  /** Slug de la catégorie racine (filtre). */
  root: string;
  context: string;
  event?: string;
  date: string | null;
  dateLabel?: string;
  dateShort?: string;
  year?: string;
  location: string | null;
  count: number;
  /** Couverture, ou null tant que l'album n'a pas de photos (le logo s'affiche alors). */
  cover: Pick<Photo, "id" | "src" | "width" | "height" | "alt" | "color"> | null;
  logo: string | null;
  keywords: string;
};

export type GalleryFilter = { slug: string; title: string; count: number };

export function getGalleryEntries(): GalleryEntry[] {
  return getAlbums().map((a) => ({
    slug: a.slug,
    title: a.title,
    href: a.href,
    root: a.category.path[0],
    context: categoryContext(a.category),
    event: a.event,
    date: a.date,
    dateLabel: formatDate(a.date),
    dateShort: formatDateShort(a.date),
    year: a.date.slice(0, 4),
    location: a.location,
    count: a.photos.length,
    // Seules les données utiles à la vignette (pas d'EXIF ni d'aperçu flou : index plus léger).
    cover: a.cover ? { id: a.cover.id, src: a.cover.src, width: a.cover.width, height: a.cover.height, alt: a.cover.alt, color: a.cover.color } : null,
    logo: albumCrests(a)[0]?.src ?? null,
    keywords: `${a.title} ${albumKeywords(a)}`,
  }));
}

export function getGalleryFilters(): GalleryFilter[] {
  const entries = getGalleryEntries();
  return getCategories()
    .map((c) => ({ slug: c.slug, title: c.title, count: entries.filter((e) => e.root === c.slug).length }))
    .filter((f) => f.count > 0);
}

/** Code d'accès normalisé : majuscules, sans espaces ni tirets (« ab-12 cd » → « AB12CD »). */
export function normalizeAccessCode(code: string) {
  return code.normalize("NFKC").toUpperCase().replace(/[\s\-_.]/g, "");
}

/**
 * Albums privés : seule l'empreinte SHA-256 du code est publiée,
 * jamais le code lui-même. Le navigateur calcule l'empreinte du code saisi.
 */
export function getAccessCodeIndex(): { hash: string; href: string }[] {
  return getAllAlbums()
    .filter((a) => a.private && a.accessCode)
    .map((a) => ({ hash: createHash("sha256").update(normalizeAccessCode(a.accessCode!)).digest("hex"), href: a.href }));
}
