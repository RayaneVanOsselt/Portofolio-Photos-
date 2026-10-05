import type { ClubId } from "@/data/clubs";

export type Photo = {
  /** Identifiant stable (utilisé pour la lightbox et les clés React). */
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Couleur dominante, affichée pendant le chargement. */
  color?: string;
  /** Mini-aperçu flou (généré par `npm run photos`). */
  blurDataURL?: string;
  /** Réglages de prise de vue (lus par `npm run photos`), sans aucune donnée GPS. */
  exif?: { camera?: string; lens?: string; focal?: string; aperture?: string; shutter?: string; iso?: string; date?: string };
  /** Crédit — uniquement pour les photos temporaires. */
  credit?: { name: string; url: string };
};

export type Sport = "hockey" | "rugby" | "football";

/* ------------------------------------------------------------------ clubs */

/** Un club ou une compétition (src/data/clubs.ts). */
export type ClubInput = {
  name: string;
  /** Autres façons d'écrire le club dans un nom d'équipe (« Leopold » pour « Léopold »). */
  aliases?: string[];
  kind?: "club" | "competition";
};

/** Logo d'un club ou d'une compétition, optimisé par `npm run logos`. */
export type Crest = {
  id: ClubId;
  name: string;
  /** WebP pour le site. */
  src: string;
  /** PNG pour les images de partage. */
  png: string;
  width: number;
  height: number;
};

/* ------------------------------------------------------------- catégories */

/**
 * Une catégorie d'albums : un club, une équipe, une compétition, une saison…
 * Elle contient des albums (matchs) et/ou des sous-catégories, sur autant de
 * niveaux que nécessaire (Club → Saison → Compétition → Match).
 */
export type CategoryInput = {
  /** Segment d'URL et nom du dossier photos : « daring-h1 ». */
  slug: string;
  /** Titre affiché : « Daring H1 ». */
  title: string;
  /** Petite ligne au-dessus du titre. Par défaut : le sport, ou la catégorie parente. */
  kicker?: string;
  /** Texte court facultatif affiché en tête de page. */
  intro?: string;
  /** Sport — hérité de la catégorie parente s'il n'est pas précisé. */
  sport?: Sport;
  /** Club ou compétition dont le logo illustre la catégorie — hérité de la catégorie parente. */
  club?: ClubId;
  /** Les albums (matchs) de la catégorie, dans n'importe quel ordre : le site les trie par date. */
  albums?: AlbumInput[];
  /** Sous-catégories (FIH Pro League → Hommes / Femmes ; plus tard : saisons, compétitions…). */
  children?: CategoryInput[];
};

/** Catégorie résolue : chemin complet, parent, logo, couverture. */
export type Category = {
  slug: string;
  title: string;
  /** Titre complet, parents compris : « FIH Pro League Femmes ». */
  fullTitle: string;
  kicker: string;
  intro?: string;
  sport: Sport;
  /** Chemin depuis /albums, ex. ["fih-pro-league", "femmes"]. */
  path: string[];
  href: string;
  parent?: Category;
  children: Category[];
  /** Logo du club ou de la compétition (null si aucun). */
  crest: Crest | null;
  /** Photo de couverture : celle de l'album le plus récent qui a des photos. */
  cover: Photo | null;
  /** Albums publics, sous-catégories comprises. */
  albumCount: number;
  photoCount: number;
  /** Date du match le plus récent (AAAA-MM-JJ). */
  latestDate: string | null;
};

/* ----------------------------------------------------------------- albums */

/** Les deux équipes d'un match, telles qu'elles doivent s'afficher. */
export type MatchInput = {
  /** Première équipe du titre : « Daring H1 ». */
  home: string;
  /** Seconde équipe : « Leo H1 ». */
  away: string;
  /** Versions courtes pour les grands titres (facultatif). */
  homeShort?: string;
  awayShort?: string;
  /** Score final [première équipe, seconde équipe] — à laisser vide s'il n'est pas connu. */
  score?: [number, number];
  /** Compétition : « Championnat », « Coupe de Belgique »… (facultatif). */
  competition?: string;
  /** Journée / tour : « J8 », « Quart de finale »… (facultatif). */
  round?: string;
  /**
   * Club de chaque équipe, pour afficher son logo. Facultatif : il est reconnu
   * automatiquement d'après le nom de l'équipe (voir src/data/clubs.ts).
   * `null` pour n'afficher aucun logo.
   */
  homeClub?: ClubId | null;
  awayClub?: ClubId | null;
};

/** Fiche de match résolue (logos compris). Un champ vide n'est jamais affiché. */
export type MatchInfo = Omit<MatchInput, "homeClub" | "awayClub"> & {
  homeCrest: Crest | null;
  awayCrest: Crest | null;
};

/** Textes facultatifs d'un chapitre (clé = nom du sous-dossier sans numéro, ex. « avant-match »). */
export type ChapterNote = { title?: string; text?: string };

export type Chapter = {
  /** « avant-match » */
  slug: string;
  /** « Avant-match » */
  title: string;
  text?: string;
  /** Position de la première photo du chapitre dans l'album. */
  start: number;
  photos: Photo[];
};

/** Un album = un match (ou un événement) et sa galerie de photos. */
export type AlbumInput = {
  /**
   * Nom du dossier photos et fin de l'adresse : « 20-09-2026-daring-h1-leo-h1 ».
   * Commence par la date du match (JJ-MM-AAAA), en minuscules, sans accents.
   */
  slug: string;
  /** Date du match, AAAA-MM-JJ : sert au tri (plus récents d'abord) et à l'affichage (« 20 septembre 2026 »). */
  date: string;
  /** Les deux équipes : le titre « Daring H1 vs Leo H1 » en est déduit. */
  match?: MatchInput;
  /** Titre, si l'album n'oppose pas deux équipes nommées (« Rugby Final D1 »). Prioritaire sur le titre déduit. */
  title?: string;
  /** Lieu (stade, club) — affiché seulement s'il est renseigné. */
  location?: string;
  /** Texte facultatif sous le titre (contexte, enjeu, moment fort). */
  description?: string;
  /** Type d'événement (« Match » par défaut ; « Tournoi », « Portraits »…). */
  event?: string;
  /** Mots-clés de recherche supplémentaires (surnoms, catégories d'âge…). */
  teams?: string[];
  /** Fichier de la photo de couverture (« 12-but.jpg ») ; par défaut la première photo. */
  cover?: string;
  /** Mise en avant sur l'accueil (une fois les photos ajoutées). */
  featured?: boolean;
  /**
   * Album privé : absent des listes, de la recherche et du plan du site.
   * Il s'ouvre avec son code d'accès (page Galeries) ou son lien direct.
   * ⚠️ Discrétion, pas sécurité : les photos restent publiques pour qui connaît l'adresse.
   */
  private?: boolean;
  /** Code à communiquer au client (insensible à la casse et aux espaces). */
  accessCode?: string;
  /** Affiche un bouton « Télécharger » dans la visionneuse (photo d'origine). */
  allowDownload?: boolean;
  /** Textes des chapitres (sous-dossiers 01-avant-match/, 02-action/…). */
  chapters?: Record<string, ChapterNote>;
  /** Photographe crédité (par défaut : le nom du site). */
  photographer?: string;
};

export type Album = Omit<AlbumInput, "match" | "chapters" | "cover" | "title" | "location" | "event"> & {
  title: string;
  href: string;
  /** Chemin complet depuis /albums : catégories puis slug de l'album. */
  path: string[];
  /** Dossier des photos dans public/images/. */
  folder: string;
  category: Category;
  match?: MatchInfo;
  location: string | null;
  event: string;
  /** Toutes les photos, dans l'ordre des chapitres. */
  photos: Photo[];
  /** Chapitres du reportage (vide si les photos ne sont pas réparties en sous-dossiers). */
  chapters: Chapter[];
  /** Photo de couverture, ou null tant que l'album n'a pas de photos. */
  cover: Photo | null;
};

export type Service = {
  slug: string;
  title: string;
  /** Type de prestation affiché en libellé. */
  format: string;
  description: string;
  deliverables: string[];
  photoId: string;
};
