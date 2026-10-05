import type { MetadataRoute } from "next";
import { ALBUMS_HREF, getAlbums, getAllCategories, getCategoryAlbums } from "@/lib/albums";
import { absoluteUrl, photoUrl } from "@/lib/seo";
import type { Photo } from "@/lib/types";

/**
 * Plan du site pour Google, avec les images de chaque page (Google Images).
 * Régénéré à chaque publication. Les albums sans photo (« Photos à venir ») et
 * les albums privés n'y figurent pas : ils y entrent seuls dès que leurs photos
 * sont en ligne, avec la date du match comme date de mise à jour.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

  const page = (path: string, priority: number, changeFrequency: Freq = "monthly", photos: (Photo | null)[] = [], lastModified: Date = now) => {
    // Seules vos propres photos sont déclarées (pas les photos temporaires d'Unsplash).
    const own = photos.filter((p): p is Photo => Boolean(p && !p.credit));
    return { url: absoluteUrl(path), lastModified, changeFrequency, priority, ...(own.length ? { images: own.slice(0, 50).map(photoUrl) } : {}) };
  };

  const albums = getAlbums();

  return [
    page("/", 1, "weekly", albums.map((a) => a.cover)),
    page(ALBUMS_HREF, 0.9, "weekly", albums.map((a) => a.cover)),
    ...getAllCategories()
      .filter((c) => c.albumCount)
      .map((c) => page(c.href, c.parent ? 0.7 : 0.8, "weekly", getCategoryAlbums(c).map((a) => a.cover))),
    ...albums.filter((a) => a.photos.length).map((a) => page(a.href, 0.7, "monthly", a.photos, new Date(`${a.date}T12:00:00Z`))),
    page("/galeries", 0.8, "weekly"),
    page("/football", 0.7, "weekly"),
    page("/about", 0.7),
    page("/services", 0.7),
    page("/contact", 0.8),
    page("/privacy", 0.2, "yearly"),
    page("/legal", 0.2, "yearly"),
  ];
}

export const dynamic = "force-static";
