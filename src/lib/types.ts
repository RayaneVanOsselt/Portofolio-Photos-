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
  featured?: boolean;
};

export type Project = Omit<ProjectInput, "category"> & {
  href: string;
  category: Category;
  photos: Photo[];
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
