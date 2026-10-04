import { createHash } from "node:crypto";
import { getAllProjects, getCategories, getProjects } from "@/lib/portfolio";
import { projectKeywords } from "@/lib/search-index";
import type { Photo } from "@/lib/types";
import { formatDate, formatDateShort } from "@/lib/utils";

/** Galerie sérialisable, transmise au moteur de recherche de la page Galeries (client). */
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
  cover: Photo;
  keywords: string;
};

export type GalleryFilter = { slug: string; title: string; count: number };

export function getGalleryEntries(): GalleryEntry[] {
  return getProjects().map((p) => ({
    slug: p.slug,
    title: p.title,
    href: p.href,
    root: p.category.path[0],
    context: p.category.parent ? `${p.category.parent.title} · ${p.category.title}` : p.category.title,
    event: p.event,
    date: p.date,
    dateLabel: p.date ? formatDate(p.date) : undefined,
    dateShort: p.date ? formatDateShort(p.date) : undefined,
    year: p.date?.slice(0, 4),
    location: p.location,
    count: p.photos.length,
    // Seules les données utiles à la vignette (pas d'EXIF ni d'aperçu flou : index plus léger).
    cover: { id: p.cover.id, src: p.cover.src, width: p.cover.width, height: p.cover.height, alt: p.cover.alt, color: p.cover.color },
    keywords: `${p.title} ${projectKeywords(p)}`,
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
 * Galeries privées : seule l'empreinte SHA-256 du code est publiée,
 * jamais le code lui-même. Le navigateur calcule l'empreinte du code saisi.
 */
export function getAccessCodeIndex(): { hash: string; href: string }[] {
  return getAllProjects()
    .filter((p) => p.private && p.accessCode)
    .map((p) => ({ hash: createHash("sha256").update(normalizeAccessCode(p.accessCode!)).digest("hex"), href: p.href }));
}
