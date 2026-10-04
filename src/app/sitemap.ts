import type { MetadataRoute } from "next";
import { getCategories, getCategoryPhotos, getProjects } from "@/lib/portfolio";
import { absoluteUrl, photoUrl } from "@/lib/seo";
import type { Photo } from "@/lib/types";

/**
 * Plan du site pour Google, avec les images de chaque page (Google Images).
 * Régénéré à chaque publication : la date de mise à jour est celle du build.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

  const page = (path: string, priority: number, changeFrequency: Freq = "monthly", photos: Photo[] = []) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
    // Seules vos propres photos sont déclarées (pas les photos temporaires d'Unsplash).
    ...(photos.some((p) => !p.credit) ? { images: photos.filter((p) => !p.credit).slice(0, 50).map(photoUrl) } : {}),
  });

  const categories = getCategories();
  const allCategories = categories.flatMap((c) => [c, ...c.children]);

  return [
    page("/", 1, "weekly", categories.map((c) => c.cover)),
    page("/portfolio", 0.9, "weekly", categories.map((c) => c.cover)),
    page("/football", 0.9, "weekly"),
    page("/galeries", 0.9, "weekly", getProjects().map((p) => p.cover)),
    ...allCategories.map((c) => page(c.href, c.parent ? 0.7 : 0.8, "weekly", getCategoryPhotos(c))),
    // Galeries publiques uniquement (les galeries privées ne sont jamais listées).
    ...getProjects().map((p) => page(p.href, 0.7, "monthly", p.photos)),
    page("/about", 0.7),
    page("/services", 0.7),
    page("/contact", 0.8),
    page("/privacy", 0.2, "yearly"),
    page("/legal", 0.2, "yearly"),
  ];
}

export const dynamic = "force-static";
