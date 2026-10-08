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
 * 1. Déposez les photos dans « Dossier photos/ », rangées comme vous le souhaitez
 *    (un dossier par match, ex. « DARING /Messieurs 1 /Daring - Orée 18:10:2026 »).
 * 2. Une entrée dans `albums` de la bonne catégorie, avec le chemin de ce dossier :
 *      { slug: "18-10-2026-daring-h1-oree-h1", date: "2026-10-18",
 *        match: { home: "Daring H1", away: "Orée H1" },
 *        source: "DARING /Messieurs 1 /Daring - Orée 18:10:2026" },
 *    → titre « Daring H1 vs Orée H1 », adresse /albums/daring-h1/18-10-2026-daring-h1-oree-h1
 *      (le slug commence par la date JJ-MM-AAAA : une incohérence bloque le build).
 * 3. `npm run dev` / `npm run build` (ou `npm run photos`) : les versions web
 *    (AVIF, WebP, toutes tailles) et les fichiers à télécharger sont générés
 *    automatiquement. Un dossier de « Dossier photos/ » relié à aucun album est signalé.
 *
 * Copiez le chemin du dossier tel quel, espaces compris (plusieurs noms finissent
 * par une espace : « DARING », « Dames 1 »…).
 *
 * Facultatif : `location` (lieu), `description`, `cover` (fichier de couverture),
 * `featured: true` (mise en avant sur l'accueil), `match.score`, `match.competition`,
 * `match.round`, `downloadEnabled`. Rien n'est affiché tant que ce n'est pas renseigné.
 * Le logo de chaque équipe est reconnu automatiquement (voir src/data/clubs.ts).
 *
 * ─── Ajouter une catégorie ─────────────────────────────────────────────────
 * Un objet { slug, title, sport, club?, albums } ci-dessous. Des sous-catégories
 * (`children`) peuvent être imbriquées sur autant de niveaux que nécessaire —
 * ex. Club → Saison → Compétition → Match. Menu, pages, recherche, plan du site
 * et images de partage sont générés automatiquement.
 *
 * ─── Reportage en chapitres ────────────────────────────────────────────────
 * Les sous-dossiers du dossier d'un match deviennent des chapitres, dans l'ordre
 * de leur nom (ex. « Belgique » puis « Pays Bas », ou 01-avant-match/, 02-action/…).
 * Titre et texte facultatifs : `chapters: { "pays-bas": { title: "Pays-Bas", text: "…" } }`.
 *
 * ─── Téléchargement ────────────────────────────────────────────────────────
 * Réglage global dans src/config/site.ts (`downloads.photos`). Une catégorie ou un
 * album peut le changer : `downloadEnabled: false` (consultation seule) ou `true`.
 *
 * ─── Album privé (client) ──────────────────────────────────────────────────
 * `private: true` + `accessCode: "CODE"` (+ `downloadEnabled: true`). Voir le README.
 */
import type { CategoryInput } from "@/lib/types";

/** Titres des chapitres « équipe » des matchs internationaux. */
const NATIONS = { belgique: { title: "Belgique" }, "pays-bas": { title: "Pays-Bas" } };

export const albumTree: CategoryInput[] = [
  {
    slug: "daring-dames-1",
    title: "Daring Dames 1",
    sport: "hockey",
    club: "daring",
    albums: [
      { slug: "20-09-2026-daring-d1-embourg-d1", date: "2026-09-20", match: { home: "Daring D1", away: "Embourg D1" } },
      {
        slug: "30-05-2026-daring-d1-lara-d1",
        date: "2026-05-30",
        match: { home: "Daring D1", away: "Lara D1" },
        source: "DARING /Dames 1 /Daring - Lara (30:05:2026)",
        cover: "IMG_2786.jpg",
      },
      {
        // Dossier « Daring - Rapid » (sans date) : photos prises le 17/05/2026 (EXIF).
        slug: "17-05-2026-daring-d1-rapid-d1",
        date: "2026-05-17",
        match: { home: "Daring D1", away: "Rapid D1" },
        source: "DARING /Dames 1 /Daring - Rapid",
        cover: "IMG_2187.jpg",
      },
    ],
  },
  {
    slug: "daring-h1",
    title: "Daring H1",
    sport: "hockey",
    club: "daring",
    albums: [
      {
        slug: "20-09-2026-daring-h1-leo-h1",
        date: "2026-09-20",
        match: { home: "Daring H1", away: "Leo H1" },
        source: "DARING /Messieurs 1 /Daring - Léo 20:09:26",
        cover: "IMG_6725.jpg",
      },
      {
        slug: "23-05-2026-daring-h1-namur-h1",
        date: "2026-05-23",
        match: { home: "Daring H1", away: "Namur H1" },
        source: "DARING /Messieurs 1 /Daring - Namur 23:05:2026",
        cover: "IMG_2582.jpg",
      },
      {
        slug: "17-05-2026-daring-h1-victory-h1",
        date: "2026-05-17",
        match: { home: "Daring H1", away: "Victory H1" },
        source: "DARING /Messieurs 1 /Daring - Victory 17:05:2026",
        cover: "IMG_2489.jpg",
      },
    ],
  },
  {
    slug: "daring-u19b1",
    title: "Daring U19B1",
    sport: "hockey",
    club: "daring",
    albums: [
      {
        // Dossier « DARING/U19 » : photos prises le 19/09/2026 (EXIF).
        slug: "19-09-2026-daring-u19b1-taxandria-h1",
        date: "2026-09-19",
        match: { home: "Daring U19B1", away: "Taxandria H1" },
        source: "DARING /U19",
        cover: "IMG_6074.jpg",
      },
    ],
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
        albums: [
          {
            slug: "27-06-2026-belgique-pays-bas-men",
            date: "2026-06-27",
            match: { home: "Belgique", away: "Pays-Bas" },
            source: "FIH PRO LEAGUE/Hommes/Belgique - Pays Bas 27:06:26",
            cover: "belgique/IMG_3563.jpg",
            featured: true,
            chapters: NATIONS,
          },
        ],
      },
      {
        slug: "femmes",
        title: "Femmes",
        albums: [
          {
            slug: "28-06-2026-belgique-pays-bas-women",
            date: "2026-06-28",
            match: { home: "Belgique", away: "Pays-Bas" },
            source: "FIH PRO LEAGUE/Femmes /Belgique - Pays Bas 28:06:26",
            cover: "belgique/IMG_3851.jpg",
            chapters: NATIONS,
          },
          {
            slug: "27-06-2026-pays-bas-australie-women",
            date: "2026-06-27",
            match: { home: "Pays-Bas", away: "Australie" },
            source: "FIH PRO LEAGUE/Femmes /Australie - Pays Bas 27:06:26",
            cover: "pays-bas/IMG_3202.jpg",
            chapters: NATIONS,
          },
        ],
      },
    ],
  },
  {
    slug: "leopold-h1",
    title: "Léopold H1",
    sport: "hockey",
    club: "leopold",
    albums: [
      {
        slug: "20-09-2026-daring-h1-leopold-h1",
        date: "2026-09-20",
        match: { home: "Daring H1", away: "Léopold H1" },
        source: "Léopold/Vs Daring 200926",
        cover: "IMG_6544.jpg",
      },
    ],
  },
  {
    slug: "louvain-la-neuve-d1",
    title: "Louvain-la-Neuve D1",
    sport: "hockey",
    club: "louvain-la-neuve",
    albums: [
      {
        slug: "04-10-2026-white-star-d1-louvain-la-neuve-d1",
        date: "2026-10-04",
        match: { home: "White Star D1", away: "Louvain-la-Neuve D1" },
        source: "Louvain la neuve D1/VS White 041026",
        cover: "IMG_7378.jpg",
      },
    ],
  },
  {
    slug: "rugby",
    title: "Rugby",
    sport: "rugby",
    albums: [
      {
        slug: "16-05-2026-rugby-final-d1",
        date: "2026-05-16",
        title: "Rugby Final D1",
        description: "Finale féminine du championnat de Belgique.",
        source: "RUGBY/Final Rugby Femme _ Championnat Belge 16:05:2026",
        cover: "IMG_2130.jpg",
        featured: true,
      },
    ],
  },
  {
    slug: "rwdm-2026-2027",
    title: "RWDM 2026-2027",
    kicker: "Football · Saison 2026-2027",
    sport: "football",
    club: "rwdm",
    albums: [
      {
        slug: "03-10-2026-union-sg-b-rwdm",
        date: "2026-10-03",
        match: { home: "Union SG B", away: "RWDM" },
        source: "RWDM 2026-2027/RWDM 031026",
        cover: "IMG_7016.jpg",
      },
      {
        slug: "12-09-2026-rwdm-charleroi-b",
        date: "2026-09-12",
        match: { home: "RWDM", away: "Charleroi B" },
        source: "RWDM 2026-2027/RWDM 120926",
        cover: "IMG_5957.jpg",
        featured: true,
      },
      {
        slug: "29-08-2026-rwdm-flenu",
        date: "2026-08-29",
        match: { home: "RWDM", away: "Flénu" },
        source: "RWDM 2026-2027/RWDM 290826",
        cover: "IMG_5093.jpg",
      },
    ],
  },
  {
    slug: "white-star-h1",
    title: "White Star H1",
    sport: "hockey",
    club: "white-star",
    albums: [
      {
        slug: "04-10-2026-white-star-h1-louvain-la-neuve-h1",
        date: "2026-10-04",
        match: { home: "White Star H1", away: "Louvain-la-Neuve H1" },
        source: "White Star H1/Vs Louvain la neuve 041026",
        cover: "IMG_7579.jpg",
      },
    ],
  },
  {
    slug: "woluwe-hockey-club-h1",
    title: "Woluwe Hockey Club H1",
    sport: "hockey",
    club: "woluwe",
    albums: [
      {
        // ⚠ Le dossier s'appelle « Woluwe - Langeveld » : adversaire à confirmer (Sukel ou Langeveld).
        slug: "30-05-2026-woluwe-h1-sukel-h1",
        date: "2026-05-30",
        match: { home: "Woluwe H1", away: "Sukel H1" },
        source: "WOLUWE Hockey Club/Woluwe - Langeveld 30-05-26",
        cover: "IMG_2881.jpg",
      },
    ],
  },
  {
    slug: "wolvendael-h1",
    title: "Wolvendael H1",
    sport: "hockey",
    club: "wolvendael",
    albums: [
      {
        slug: "09-08-2026-wolvendael-h1-amical-h1",
        date: "2026-08-09",
        match: { home: "Wolvendael H1", away: "Amical H1", competition: "Match de préparation" },
        source: "Wolvendael H1 2627/WOLV - AMICALE 090826 (Prepa)",
        cover: "IMG_4511.jpg",
      },
      {
        slug: "06-08-2026-wolvendael-h1-la-louviere-h1",
        date: "2026-08-06",
        match: { home: "Wolvendael H1", away: "La Louvière H1", competition: "Match de préparation" },
        source: "Wolvendael H1 2627/060826 vs La louvière (Prepa)",
        cover: "IMG_4276.jpg",
      },
    ],
  },
];
