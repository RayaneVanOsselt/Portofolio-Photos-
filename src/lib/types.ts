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

export type CategoryInput = {
  slug: string;
  title: string;
  /** Petite ligne au-dessus du titre (ex. « Hockey — Division Honneur »). */
  kicker: string;
  /** Introduction courte affichée en tête de page. */
  intro: string;
  sport: Sport;
  children?: Omit<CategoryInput, "children" | "sport">[];
};

/** Catégorie résolue : chemin complet, parent, image de couverture. */
export type Category = {
  slug: string;
  title: string;
  kicker: string;
  intro: string;
  sport: Sport;
  /** Chemin depuis /portfolio, ex. ["fih-pro-league", "red-lions"]. */
  path: string[];
  href: string;
  parent?: Category;
  children: Category[];
  cover: Photo;
  photoCount: number;
};

/**
 * Fiche de match (football et autres sports d'équipe). Tout est facultatif sauf
 * les deux équipes ; un champ vide n'est jamais affiché. Le stade = `location`.
 */
export type MatchInfo = {
  /** Équipe à domicile, en entier : « Union Saint-Gilloise U23 ». */
  home: string;
  /** Équipe visiteuse : « RWDM ». */
  away: string;
  /** Versions courtes pour les grands titres : « Union SG U23 ». */
  homeShort?: string;
  awayShort?: string;
  /** Score final [domicile, visiteur] — laisser vide s'il n'est pas connu. */
  score?: [number, number];
  /** Compétition : « Championnat U23 », « Coupe de Belgique »… */
  competition?: string;
  /** Journée / tour : « J8 », « Quart de finale »… */
  round?: string;
};

/** Textes facultatifs d'un chapitre (clé = nom du sous-dossier sans numéro, ex. « avant-match »). */
export type ChapterNote = { title?: string; text?: string };

export type Chapter = {
  /** « avant-match » */
  slug: string;
  /** « Avant-match » */
  title: string;
  text?: string;
  /** Position de la première photo du chapitre dans la galerie. */
  start: number;
  photos: Photo[];
};

export type ProjectInput = {
  slug: string;
  title: string;
  /** Chemin de catégorie, ex. "fih-pro-league/red-lions". */
  category: string;
  description: string;
  /** Dossier dans public/images/portfolio (voir `npm run photos`). */
  folder: string;
  /** Date ISO (AAAA-MM-JJ) ou null si non renseignée. */
  date: string | null;
  location: string | null;
  /** Type d'événement affiché et recherchable (« Match », « Tournoi », « Portraits »…). */
  event?: string;
  /** Équipes, clubs ou personnes concernés — recherchables (« Union Saint-Gilloise », « U23 »…). */
  teams?: string[];
  /** Mise en avant sur l'accueil et le portfolio. */
  featured?: boolean;
  /**
   * Galerie privée : absente des listes, de la recherche et du plan du site.
   * Elle s'ouvre avec son code d'accès (page Galeries) ou son lien direct.
   * ⚠️ Discrétion, pas sécurité : les photos restent publiques pour qui connaît l'adresse.
   */
  private?: boolean;
  /** Code à communiquer au client (insensible à la casse et aux espaces). */
  accessCode?: string;
  /** Affiche un bouton « Télécharger » dans la visionneuse (photo d'origine). */
  allowDownload?: boolean;
  /** Fiche de match : active la mise en page « Matchday ». */
  match?: MatchInfo;
  /** Textes des chapitres (sous-dossiers 01-avant-match/, 02-action/…). */
  chapters?: Record<string, ChapterNote>;
  /** Photographe crédité (par défaut : le nom du site). */
  photographer?: string;
};

export type Project = Omit<ProjectInput, "category" | "chapters"> & {
  href: string;
  category: Category;
  /** Toutes les photos, dans l'ordre des chapitres. */
  photos: Photo[];
  /** Chapitres du reportage (vide si les photos ne sont pas réparties en sous-dossiers). */
  chapters: Chapter[];
  cover: Photo;
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
