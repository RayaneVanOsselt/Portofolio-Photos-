/**
 * Moteur de recherche du site (fonctions pures, utilisables côté client et serveur).
 * Insensible à la casse et aux accents : « leopold » trouve « Léopold ».
 */

export type SearchItem = {
  type: "Rubrique" | "Équipe" | "Série" | "Service" | "Page";
  title: string;
  href: string;
  /** Contexte affiché sous le titre (rubrique parente, format…). */
  context: string;
  /** Texte supplémentaire indexé mais non affiché. */
  keywords: string;
  thumb?: { src: string; color?: string };
};

export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TYPE_WEIGHT: Record<SearchItem["type"], number> = { Rubrique: 6, Équipe: 5, Série: 3, Service: 2, Page: 1 };

export function searchItems(items: SearchItem[], query: string, limit = 12): SearchItem[] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];

  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const title = normalize(item.title);
    const haystack = `${title} ${normalize(item.context)} ${normalize(item.keywords)}`;
    if (!tokens.every((t) => haystack.includes(t))) continue;

    let score = TYPE_WEIGHT[item.type];
    for (const t of tokens) {
      if (title === t) score += 30;
      else if (title.startsWith(t)) score += 20;
      else if (title.split(" ").some((word) => word.startsWith(t))) score += 14;
      else if (title.includes(t)) score += 8;
    }
    scored.push({ item, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "fr"))
    .slice(0, limit)
    .map((s) => s.item);
}
