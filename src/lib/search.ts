/**
 * Moteur de recherche du site (fonctions pures, utilisables côté client et serveur).
 * Insensible à la casse et aux accents : « leopold » trouve « Léopold ».
 */

export type SearchType = "Album" | "Catégorie" | "Service" | "Page";

export type SearchItem = {
  type: SearchType;
  title: string;
  href: string;
  /** Contexte affiché sous le titre (catégorie parente, format…). */
  context: string;
  /** Texte supplémentaire indexé mais non affiché (dates, équipes, lieu…). */
  keywords: string;
  /** Vignette : photo de couverture, ou logo du club (`logo: true`) tant qu'il n'y a pas de photo. */
  thumb?: { src: string; color?: string; logo?: boolean };
  /** Albums : date affichée (déjà formatée) et nombre de photos. */
  date?: string;
  count?: number;
};

export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const TYPE_WEIGHT: Record<SearchType, number> = { Album: 6, Catégorie: 5, Service: 2, Page: 1 };

/** Ordre d'affichage des groupes de résultats. */
export const SEARCH_TYPES: SearchType[] = ["Album", "Catégorie", "Service", "Page"];

export const SEARCH_TYPE_PLURAL: Record<SearchType, string> = {
  Album: "Albums",
  Catégorie: "Catégories",
  Service: "Services",
  Page: "Pages",
};

/**
 * Score d'un élément pour une requête (0 = pas de correspondance).
 * Tous les mots doivent être trouvés ; le titre compte plus que le reste.
 */
export function scoreText(title: string, rest: string, tokens: string[]) {
  const t = normalize(title);
  const haystack = `${t} ${normalize(rest)}`;
  if (!tokens.length || !tokens.every((token) => haystack.includes(token))) return 0;
  let score = 1;
  for (const token of tokens) {
    if (t === token) score += 30;
    else if (t.startsWith(token)) score += 20;
    else if (t.split(" ").some((word) => word.startsWith(token))) score += 14;
    else if (t.includes(token)) score += 8;
  }
  return score;
}

export function tokenize(query: string) {
  return normalize(query).split(" ").filter(Boolean);
}

export function searchItems(items: SearchItem[], query: string, limit = 12): SearchItem[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const score = scoreText(item.title, `${item.context} ${item.keywords}`, tokens);
    if (score) scored.push({ item, score: score + TYPE_WEIGHT[item.type] });
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
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  // Normalisation caractère par caractère : les positions restent alignées sur le texte d'origine.
  const folded = Array.from(text, (c) =>
    c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, " ").charAt(0) || " ",
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
