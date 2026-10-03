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

/**
 * Plages [début, fin[ du texte d'origine qui correspondent aux mots recherchés
 * (insensible aux accents et à la casse) — pour surligner les résultats.
 */
export function matchRanges(text: string, query: string): [number, number][] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  // Normalisation caractère par caractère : les positions restent alignées sur le texte d'origine.
  const folded = Array.from(text, (c) =>
    c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, " ").charAt(0) || " ",
  ).join("");
  const ranges: [number, number][] = [];
  for (const token of tokens) {
    let from = 0;
    let at: number;
    while ((at = folded.indexOf(token, from)) !== -1) {
      ranges.push([at, at + token.length]);
      from = at + token.length;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  return ranges.reduce<[number, number][]>((merged, r) => {
    const last = merged.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
    return merged;
  }, []);
}

export const SEARCH_TYPES: SearchItem["type"][] = ["Rubrique", "Équipe", "Série", "Service", "Page"];
