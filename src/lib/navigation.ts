import { getCategories } from "@/lib/portfolio";
import type { Photo } from "@/lib/types";

/** Version sérialisable de l'arborescence, transmise aux composants client. */
export type NavCategory = {
  title: string;
  href: string;
  kicker: string;
  cover: Photo;
  children: { title: string; href: string }[];
};

export function getPortfolioNav(): NavCategory[] {
  return getCategories().map((c) => ({
    title: c.title,
    href: c.href,
    kicker: c.kicker,
    cover: c.cover,
    children: c.children.map((child) => ({ title: child.title, href: child.href })),
  }));
}
