/**
 * Couche d'accès aux albums. Les composants ne lisent jamais src/data
 * directement : ils passent par ici.
 *
 * Vocabulaire : une « catégorie » est un club, une équipe, une compétition ou
 * une saison — elle peut contenir des sous-catégories (FIH Pro League → Hommes /
 * Femmes) ; un « album » est un match (ou un événement) et sa galerie de photos.
 *
 * Les données sont vérifiées au build : une date mal écrite, un slug en double
 * ou un slug qui ne correspond pas à la date du match bloque la compilation
 * avec un message clair, plutôt que de publier une page fausse.
 */
import { albumTree } from "@/data/albums";
import { clubs, type ClubId } from "@/data/clubs";
import logoManifest from "@/data/logo-manifest.json";
import { getFolderChapters, getFolderPhotos } from "@/data/photos";
import type { Album, AlbumInput, Category, CategoryInput, Chapter, ClubInput, Crest, MatchInfo, MatchInput, Photo, Sport } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Adresse de la section : /albums/<catégorie>/…/<album>. */
export const ALBUMS_HREF = "/albums";
/** Dossier des photos d'albums dans public/images/ (même chemin que l'adresse). */
const PHOTO_ROOT = "albums";
/** Dossiers des photos de pages (hors albums). */
const SITE_FOLDERS = ["site/home", "site/about", "site/services"];

/** « hockey sur gazon » — pour les phrases (descriptions, textes alternatifs). */
export const SPORT_LABEL: Record<Sport, string> = { hockey: "hockey sur gazon", rugby: "rugby", football: "football" };
/** « Hockey » — pour les libellés et les regroupements. */
export const SPORT_NAME: Record<Sport, string> = { hockey: "Hockey", rugby: "Rugby", football: "Football" };

const plain = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

function fail(message: string): never {
  throw new Error(`[albums] ${message} — voir src/data/albums.ts`);
}

// ------------------------------------------------------------------ logos

const logos = logoManifest as Record<string, { src: string; png: string; width: number; height: number }>;
const clubList = Object.entries(clubs) as [ClubId, ClubInput][];

function crestOf(id: ClubId | null | undefined): Crest | null {
  if (!id) return null;
  const logo = logos[id];
  return logo ? { id, name: clubs[id].name, ...logo } : null;
}

/** Noms reconnus dans un nom d'équipe, du plus long au plus court (« White Star » avant « White »). */
const clubAliases = clubList
  .filter(([, club]) => club.kind !== "competition")
  .flatMap(([id, club]) => [club.name, ...(club.aliases ?? [])].map((alias) => ({ id, alias: plain(alias) })))
  .sort((a, b) => b.alias.length - a.alias.length);

/** Club d'une équipe d'après son nom : « Daring H1 » → daring, « Leopold H1 » → leopold. */
function clubOfTeam(team: string): ClubId | null {
  const name = plain(team);
  return clubAliases.find(({ alias }) => name === alias || name.startsWith(`${alias} `))?.id ?? null;
}

function resolveMatch({ homeClub, awayClub, ...match }: MatchInput): MatchInfo {
  return {
    ...match,
    homeCrest: crestOf(homeClub === undefined ? clubOfTeam(match.home) : homeClub),
    awayCrest: crestOf(awayClub === undefined ? clubOfTeam(match.away) : awayClub),
  };
}

// ------------------------------------------------------------- catégories

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allCategories: Category[] = [];
const albumInputs: { input: AlbumInput; category: Category }[] = [];

function resolveCategory(input: CategoryInput, parent?: Category): Category {
  if (!SLUG.test(input.slug)) fail(`catégorie « ${input.title} » : le slug « ${input.slug} » ne doit contenir que des minuscules, des chiffres et des tirets`);
  const sport = input.sport ?? parent?.sport;
  if (!sport) fail(`catégorie « ${input.title} » : précisez le sport (hockey, football ou rugby)`);
  const path = parent ? [...parent.path, input.slug] : [input.slug];
  const category: Category = {
    slug: input.slug,
    title: input.title,
    fullTitle: parent ? `${parent.fullTitle} ${input.title}` : input.title,
    kicker: input.kicker ?? (parent ? parent.title : SPORT_NAME[sport]),
    intro: input.intro,
    sport,
    path,
    href: `${ALBUMS_HREF}/${path.join("/")}`,
    parent,
    children: [],
    crest: input.club ? crestOf(input.club) : (parent?.crest ?? null),
    cover: null,
    albumCount: 0,
    photoCount: 0,
    latestDate: null,
  };
  if (allCategories.some((c) => c.href === category.href)) fail(`la catégorie « ${category.href} » est déclarée deux fois`);
  allCategories.push(category);
  for (const album of input.albums ?? []) albumInputs.push({ input: album, category });
  category.children = (input.children ?? []).map((child) => resolveCategory(child, category));
  return category;
}

const categories = albumTree.map((input) => resolveCategory(input));
const categoryByPath = new Map(allCategories.map((c) => [c.path.join("/"), c]));

// ----------------------------------------------------------------- albums

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const albumFolder = (path: string[]) => `${PHOTO_ROOT}/${path.join("/")}`;
const albumFolders = new Set(albumInputs.map(({ input, category }) => albumFolder([...category.path, input.slug])));

function checkAlbum(input: AlbumInput, category: Category) {
  const where = `album « ${input.slug} » (${category.fullTitle})`;
  if (!SLUG.test(input.slug)) fail(`${where} : le slug ne doit contenir que des minuscules, des chiffres et des tirets`);
  const [, y, m, d] = input.date.match(ISO_DATE) ?? [];
  if (!y || Number.isNaN(Date.parse(input.date))) fail(`${where} : date « ${input.date} » invalide (format attendu : AAAA-MM-JJ)`);
  if (!input.slug.startsWith(`${d}-${m}-${y}-`)) fail(`${where} : le slug doit commencer par la date du match, « ${d}-${m}-${y}-… »`);
  if (!input.match && !input.title) fail(`${where} : indiquez les équipes (\`match: { home, away }\`) ou un \`title\``);
  if (input.private && !input.accessCode) fail(`${where} : un album privé a besoin d'un \`accessCode\``);
}

/** Titres par défaut des chapitres les plus courants (le nom du dossier sinon). */
const CHAPTER_TITLES: Record<string, string> = {
  introduction: "Introduction",
  "avant-match": "Avant-match",
  arrivee: "Arrivée",
  echauffement: "Échauffement",
  "le-match": "Le match",
  action: "Action",
  "premiere-mi-temps": "Première mi-temps",
  "mi-temps": "Mi-temps",
  "seconde-mi-temps": "Seconde mi-temps",
  ambiance: "Ambiance",
  supporters: "Supporters",
  tribunes: "Tribunes",
  coulisses: "Coulisses",
  vestiaire: "Vestiaire",
  celebrations: "Célébrations",
  "apres-match": "Après-match",
  portraits: "Portraits",
  entrainement: "Entraînement",
};

/**
 * Chapitres d'un reportage, à partir des sous-dossiers « 01-avant-match/ »,
 * « 02-action/ »… Les photos posées directement dans le dossier de l'album
 * ouvrent le récit (« Introduction »).
 */
function buildChapters(folder: string, notes: AlbumInput["chapters"]): Chapter[] {
  const folders = getFolderChapters(folder, albumFolders);
  if (!folders.length) return [];
  const intro = getFolderPhotos(folder);
  const raw = [...(intro.length ? [{ name: "00-introduction", photos: intro }] : []), ...folders];
  let start = 0;
  return raw.map(({ name, photos }) => {
    const slug = name.replace(/^\d+[-_ ]*/, "") || name;
    const note = notes?.[slug];
    const chapter: Chapter = {
      slug,
      title: note?.title ?? CHAPTER_TITLES[slug] ?? slug.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase()),
      text: note?.text,
      start,
      photos,
    };
    start += photos.length;
    return chapter;
  });
}

/** Texte alternatif déduit d'un nom de fichier d'appareil (« DSC 1234 », « IMG 0042 », « Photographie »…). */
const GENERIC_ALT = /^(?:photographie|(?:dsc[fn]?|img|mg|pxl|p|photo|image|capture|untitled|sans titre)?[\s_-]*\d+(?:[\s_-]+\d+)*)$/i;

/**
 * Texte alternatif utile (accessibilité + Google Images) :
 * - nom de fichier générique → « Daring H1 vs Leo H1 — photo 12 (hockey sur gazon, 20 septembre 2026) » ;
 * - texte descriptif → complété par le match : « Célébration du but — Daring H1 vs Leo H1 ».
 */
function withContextAlt(photo: Photo, album: Album, n: number): Photo {
  if (GENERIC_ALT.test(photo.alt.trim())) {
    return { ...photo, alt: `${album.title} — photo ${n} (${SPORT_LABEL[album.category.sport]}, ${formatDate(album.date)})` };
  }
  if (plain(photo.alt).includes(plain(album.title))) return photo;
  return { ...photo, alt: `${photo.alt} — ${album.title}` };
}

function buildAlbum({ input, category }: { input: AlbumInput; category: Category }): Album {
  checkAlbum(input, category);
  const { match: matchInput, chapters: notes, cover: coverFile, title, location, event, ...rest } = input;
  const path = [...category.path, input.slug];
  const folder = albumFolder(path);
  const match = matchInput ? resolveMatch(matchInput) : undefined;
  const album: Album = {
    ...rest,
    title: title ?? `${match!.home} vs ${match!.away}`,
    href: `${ALBUMS_HREF}/${path.join("/")}`,
    path,
    folder,
    category,
    match,
    location: location ?? null,
    event: event ?? "Match",
    photos: [],
    chapters: [],
    cover: null,
  };

  const chapters = buildChapters(folder, notes);
  const raw = chapters.length ? chapters.flatMap((c) => c.photos) : getFolderPhotos(folder);
  const described = new Map(raw.map((photo, i) => [photo.id, withContextAlt(photo, album, i + 1)]));
  album.photos = raw.map((photo) => described.get(photo.id)!);
  album.chapters = chapters.map((chapter) => ({ ...chapter, photos: chapter.photos.map((photo) => described.get(photo.id)!) }));

  const chosen = coverFile ? album.photos.find((photo) => photo.id.endsWith(`/${coverFile}`)) : undefined;
  if (coverFile && !chosen && album.photos.length) console.warn(`[albums] ${input.slug} : couverture « ${coverFile} » introuvable, première photo utilisée.`);
  album.cover = chosen ?? album.photos[0] ?? null;
  return album;
}

/** Plus récents d'abord ; à date égale, l'ordre du fichier est conservé. */
const byDateDesc = (a: Album, b: Album) => b.date.localeCompare(a.date);

const albums = albumInputs.map(buildAlbum);
const albumByPath = new Map(albums.map((a) => [a.path.join("/"), a]));
{
  const seen = new Set<string>();
  for (const album of albums) {
    if (seen.has(album.slug)) fail(`le slug « ${album.slug} » est utilisé par deux albums : chaque album doit avoir le sien`);
    seen.add(album.slug);
  }
}

/** Albums visibles publiquement (listes, recherche, plan du site), les plus récents d'abord. */
const publicAlbums = albums.filter((a) => !a.private).sort(byDateDesc);
const ownAlbums = new Map<Category, Album[]>();
for (const album of publicAlbums) ownAlbums.set(album.category, [...(ownAlbums.get(album.category) ?? []), album]);

// Compteurs, date du dernier match et couverture, une fois les albums connus.
for (const category of allCategories) {
  const list = getCategoryAlbums(category);
  category.albumCount = list.length;
  category.photoCount = list.reduce((sum, album) => sum + album.photos.length, 0);
  category.latestDate = list[0]?.date ?? null;
  category.cover = list.find((album) => album.cover)?.cover ?? null;
}

// ----------------------------------------------------------------- public

/** Catégories principales (ordre de src/data/albums.ts), avec leurs sous-catégories. */
export function getCategories(): Category[] {
  return categories;
}

/** Toutes les catégories, sous-catégories comprises. */
export function getAllCategories(): Category[] {
  return allCategories;
}

export function getCategoryByPath(path: string[]): Category | undefined {
  return categoryByPath.get(path.join("/"));
}

/** Catégories principales regroupées par sport (menu, page Albums). */
export function getCategoryGroups(): { sport: Sport; label: string; categories: Category[] }[] {
  const sports = [...new Set(categories.map((c) => c.sport))];
  return sports.map((sport) => ({ sport, label: SPORT_NAME[sport], categories: categories.filter((c) => c.sport === sport) }));
}

/** Albums publics, les plus récents d'abord. */
export function getAlbums(): Album[] {
  return publicAlbums;
}

/** Tous les albums, privés compris (génération des pages uniquement). */
export function getAllAlbums(): Album[] {
  return albums;
}

export function getAlbumByPath(path: string[]): Album | undefined {
  return albumByPath.get(path.join("/"));
}

/** Albums publics d'une catégorie, sous-catégories comprises, les plus récents d'abord. */
export function getCategoryAlbums(category: Category): Album[] {
  return [...(ownAlbums.get(category) ?? []), ...category.children.flatMap(getCategoryAlbums)].sort(byDateDesc);
}

/** Albums mis en avant (`featured`) qui ont déjà des photos. */
export function getFeaturedAlbums(): Album[] {
  return publicAlbums.filter((a) => a.featured && a.cover);
}

/** Albums d'un sport, les plus récents d'abord. */
export function getSportAlbums(sport: Sport): Album[] {
  return publicAlbums.filter((a) => a.category.sport === sport);
}

/**
 * Une photo de page par identifiant (src/data/content.ts, services.ts) ;
 * à défaut la première photo du dossier `folder`, puis la couverture la plus récente.
 */
export function getPhotoById(id: string, folder?: string): Photo | null {
  const pool = [...SITE_FOLDERS.flatMap(getFolderPhotos), ...publicAlbums.flatMap((a) => a.photos)];
  return pool.find((p) => p.id === id) ?? (folder ? getFolderPhotos(folder)[0] : undefined) ?? publicAlbums.find((a) => a.cover)?.cover ?? null;
}

/**
 * Albums voisins dans le temps, au sein de la même catégorie (ou de la catégorie
 * parente s'il est seul) : `older` = le match précédent, `newer` = le suivant.
 */
export function getAdjacentAlbums(album: Album): { older?: Album; newer?: Album } {
  if (album.private) return {};
  let siblings = getCategoryAlbums(album.category);
  if (siblings.length < 2 && album.category.parent) siblings = getCategoryAlbums(album.category.parent);
  const index = siblings.findIndex((a) => a.href === album.href);
  return { newer: siblings[index - 1], older: siblings[index + 1] };
}

/** Catégorie voisine, pour inviter à poursuivre la visite. */
export function getNextCategory(category: Category): Category {
  const siblings = category.parent ? category.parent.children : categories;
  const index = siblings.findIndex((c) => c.href === category.href);
  if (category.parent && index === siblings.length - 1) return getNextCategory(category.parent);
  return siblings[(index + 1) % siblings.length];
}

/** Fil d'Ariane d'une catégorie (de la racine à elle-même). */
export function getCategoryTrail(category: Category): Category[] {
  return category.parent ? [...getCategoryTrail(category.parent), category] : [category];
}

/** « FIH Pro League · Femmes » */
export function categoryContext(category: Category) {
  return getCategoryTrail(category)
    .map((c) => c.title)
    .join(" · ");
}

/** Nom d'équipe pour les grands titres (version courte si fournie). */
export function teamShort(album: Album, side: "home" | "away") {
  const m = album.match!;
  return side === "home" ? (m.homeShort ?? m.home) : (m.awayShort ?? m.away);
}

/** Logos d'un album : ceux des équipes, sinon celui de la catégorie (compétition, club). */
export function albumCrests(album: Album): Crest[] {
  const teams = [album.match?.homeCrest, album.match?.awayCrest].filter((c): c is Crest => Boolean(c));
  const unique = teams.filter((c, i) => teams.findIndex((o) => o.id === c.id) === i);
  return unique.length ? unique : album.category.crest ? [album.category.crest] : [];
}
