import { categoryContext, getAlbums, getCategories, getCategoryGroups } from "@/lib/albums";
import type { Category, Crest } from "@/lib/types";

/** Version sérialisable de l'arborescence des albums, transmise au menu (composant client). */
export type NavCategory = {
  title: string;
  href: string;
  crest: Crest | null;
  count: number;
  children: { title: string; href: string; count: number }[];
};

export type NavGroup = { label: string; categories: NavCategory[] };
export type NavAlbum = { title: string; href: string; date: string; context: string };

export type AlbumsNav = {
  groups: NavGroup[];
  /** Les derniers matchs mis en ligne. */
  latest: NavAlbum[];
  categoryCount: number;
  albumCount: number;
};

const toNav = (c: Category): NavCategory => ({
  title: c.title,
  href: c.href,
  crest: c.crest,
  count: c.albumCount,
  children: c.children.map((child) => ({ title: child.title, href: child.href, count: child.albumCount })),
});

export function getAlbumsNav(): AlbumsNav {
  const albums = getAlbums();
  return {
    groups: getCategoryGroups().map((group) => ({ label: group.label, categories: group.categories.map(toNav) })),
    latest: albums.slice(0, 4).map((a) => ({ title: a.title, href: a.href, date: a.date, context: categoryContext(a.category) })),
    categoryCount: getCategories().length,
    albumCount: albums.length,
  };
}
