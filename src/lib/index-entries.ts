import type { IndexEntry } from "@/components/home/CategoryIndex";
import type { Category } from "@/lib/types";

/** Catégories → entrées sérialisables pour l'index visuel (composant client). */
export function toIndexEntries(categories: Category[]): IndexEntry[] {
  return categories.map((c) => ({
    title: c.title,
    href: c.href,
    kicker: c.kicker,
    cover: c.cover,
    subtitles: c.children.map((child) => child.title),
    count: c.photoCount,
  }));
}
