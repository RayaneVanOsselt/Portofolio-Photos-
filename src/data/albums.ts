/**
 * ALBUMS — toute l'arborescence du site, en un seul endroit :
 *
 *   Albums → Club / Compétition → (sous-catégorie) → Match → Photos
 *
 * L'ordre des catégories ici = l'ordre du menu et des pages. Les matchs, eux,
 * peuvent être écrits dans n'importe quel ordre : le site les trie
 * automatiquement par date, du plus récent au plus ancien.
 *
 * ─── Ajouter un match ──────────────────────────────────────────────────────
 * 1. Une entrée dans `albums` de la bonne catégorie :
 *      { slug: "18-10-2026-daring-h1-oree-h1", date: "2026-10-18",
 *        match: { home: "Daring H1", away: "Orée H1" } },
 *    → titre « Daring H1 vs Orée H1 », adresse /albums/daring-h1/18-10-2026-daring-h1-oree-h1
 *      (le slug commence par la date JJ-MM-AAAA : une incohérence bloque le build).
 * 2. Les photos dans public/images/albums/daring-h1/18-10-2026-daring-h1-oree-h1/
 *    (même chemin que l'adresse). Elles apparaissent automatiquement au prochain
 *    `npm run dev` / `npm run build` (ou `npm run photos`).
 *
 * Facultatif : `location` (lieu), `description`, `cover` (fichier de couverture),
 * `featured: true` (mise en avant sur l'accueil), `match.score`, `match.competition`,
 * `match.round`. Rien n'est affiché tant que ce n'est pas renseigné.
 * Le logo de chaque équipe est reconnu automatiquement (voir src/data/clubs.ts).
 *
 * ─── Ajouter une catégorie ─────────────────────────────────────────────────
 * Un objet { slug, title, sport, club?, albums } ci-dessous. Des sous-catégories
 * (`children`) peuvent être imbriquées sur autant de niveaux que nécessaire —
 * ex. Club → Saison → Compétition → Match. Menu, pages, recherche, plan du site
 * et images de partage sont générés automatiquement.
 *
 * ─── Reportage en chapitres ────────────────────────────────────────────────
 * Rangez les photos dans des sous-dossiers numérotés du dossier de l'album :
 *   01-avant-match/  02-action/  03-ambiance/  04-supporters/  05-coulisses/  06-apres-match/
 * (textes facultatifs : `chapters: { "avant-match": { text: "…" } }`).
 *
 * ─── Album privé (client) ──────────────────────────────────────────────────
 * `private: true` + `accessCode: "CODE"` (+ `allowDownload: true`). Voir le README.
 */
import type { CategoryInput } from "@/lib/types";

export const albumTree: CategoryInput[] = [
  {
    slug: "daring-dames-1",
    title: "Daring Dames 1",
    sport: "hockey",
    club: "daring",
    albums: [
      { slug: "20-09-2026-daring-d1-embourg-d1", date: "2026-09-20", match: { home: "Daring D1", away: "Embourg D1" } },
      { slug: "30-05-2026-daring-d1-lara-d1", date: "2026-05-30", match: { home: "Daring D1", away: "Lara D1" } },
    ],
  },
  {
    slug: "daring-h1",
    title: "Daring H1",
    sport: "hockey",
    club: "daring",
    albums: [
      { slug: "20-09-2026-daring-h1-leo-h1", date: "2026-09-20", match: { home: "Daring H1", away: "Leo H1" } },
      { slug: "23-05-2026-daring-h1-namur-h1", date: "2026-05-23", match: { home: "Daring H1", away: "Namur H1" } },
      { slug: "17-05-2026-daring-h1-victory-h1", date: "2026-05-17", match: { home: "Daring H1", away: "Victory H1" } },
    ],
  },
  {
    slug: "daring-u19b1",
    title: "Daring U19B1",
    sport: "hockey",
    club: "daring",
    albums: [{ slug: "19-09-2026-daring-u19b1-taxandria-h1", date: "2026-09-19", match: { home: "Daring U19B1", away: "Taxandria H1" } }],
  },
  {
    slug: "fih-pro-league",
    title: "FIH Pro League",
    kicker: "Hockey · International",
    sport: "hockey",
    club: "fih-pro-league",
    children: [
      {
        slug: "hommes",
        title: "Hommes",
        albums: [{ slug: "27-06-2026-belgique-pays-bas-men", date: "2026-06-27", match: { home: "Belgique", away: "Pays-Bas" } }],
      },
      {
        slug: "femmes",
        title: "Femmes",
        albums: [
          { slug: "28-06-2026-belgique-pays-bas-women", date: "2026-06-28", match: { home: "Belgique", away: "Pays-Bas" } },
          { slug: "27-06-2026-pays-bas-australie-women", date: "2026-06-27", match: { home: "Pays-Bas", away: "Australie" } },
        ],
      },
    ],
  },
  {
    slug: "leopold-h1",
    title: "Léopold H1",
    sport: "hockey",
    club: "leopold",
    albums: [{ slug: "20-09-2026-daring-h1-leopold-h1", date: "2026-09-20", match: { home: "Daring H1", away: "Léopold H1" } }],
  },
  {
    slug: "louvain-la-neuve-d1",
    title: "Louvain-la-Neuve D1",
    sport: "hockey",
    club: "louvain-la-neuve",
    albums: [{ slug: "04-10-2026-white-star-d1-louvain-la-neuve-d1", date: "2026-10-04", match: { home: "White Star D1", away: "Louvain-la-Neuve D1" } }],
  },
  {
    slug: "rugby",
    title: "Rugby",
    sport: "rugby",
    albums: [{ slug: "16-05-2026-rugby-final-d1", date: "2026-05-16", title: "Rugby Final D1" }],
  },
  {
    slug: "rwdm-2026-2027",
    title: "RWDM 2026-2027",
    kicker: "Football · Saison 2026-2027",
    sport: "football",
    club: "rwdm",
    albums: [
      { slug: "03-10-2026-union-sg-b-rwdm", date: "2026-10-03", match: { home: "Union SG B", away: "RWDM" } },
      { slug: "12-09-2026-rwdm-charleroi-b", date: "2026-09-12", match: { home: "RWDM", away: "Charleroi B" } },
      { slug: "29-08-2026-rwdm-flenu", date: "2026-08-29", match: { home: "RWDM", away: "Flénu" } },
    ],
  },
  {
    slug: "white-star-h1",
    title: "White Star H1",
    sport: "hockey",
    club: "white-star",
    albums: [{ slug: "04-10-2026-white-star-h1-louvain-la-neuve-h1", date: "2026-10-04", match: { home: "White Star H1", away: "Louvain-la-Neuve H1" } }],
  },
  {
    slug: "woluwe-hockey-club-h1",
    title: "Woluwe Hockey Club H1",
    sport: "hockey",
    club: "woluwe",
    albums: [{ slug: "30-05-2026-woluwe-h1-sukel-h1", date: "2026-05-30", match: { home: "Woluwe H1", away: "Sukel H1" } }],
  },
  {
    slug: "wolvendael-h1",
    title: "Wolvendael H1",
    sport: "hockey",
    club: "wolvendael",
    albums: [
      { slug: "09-08-2026-wolvendael-h1-amical-h1", date: "2026-08-09", match: { home: "Wolvendael H1", away: "Amical H1" } },
      { slug: "06-08-2026-wolvendael-h1-la-louviere-h1", date: "2026-08-06", match: { home: "Wolvendael H1", away: "La Louvière H1" } },
    ],
  },
];
