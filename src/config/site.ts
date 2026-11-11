/**
 * Configuration centrale du site.
 *
 * Tout ce qui concerne l'identité (nom, signature, coordonnées, réseaux)
 * est défini ici. Modifier ce fichier suffit pour renommer le site :
 * logo, metadata, footer, e-mails et images sociales se mettent à jour.
 *
 * Une valeur vide ("") signifie « pas encore fournie » : l'élément est
 * masqué en production et signalé comme « à configurer » en développement.
 */

export const siteConfig = {
  /** Nom complet, utilisé dans les titres, metadata et e-mails. */
  name: "rayvo.captures0808",
  /** Les deux lignes du logo (affichées telles quelles, en minuscules). */
  logo: {
    primary: "rayvo.",
    secondary: "captures0808",
  },
  /** Le photographe (mentions légales, À propos, données structurées). */
  owner: {
    firstName: "Rayane",
    lastName: "Van Osselt",
  },
  /** Signature affichée sous le nom. */
  tagline: "Photographe sportif à Bruxelles et en Brabant wallon — Hockey · Rugby · Football",
  /** Description par défaut (SEO, partage). */
  description:
    "Photographe sportif à Bruxelles et en Brabant wallon — hockey, rugby et football. Reportages de match, portraits d'équipe et contenus pour clubs, photos en ligne sous 48 h.",
  /** Langue du contenu (attribut html lang + Open Graph). */
  locale: "fr_BE",
  language: "fr-BE",

  /** URL publique — définie via NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",

  contact: {
    /** Adresse affichée publiquement sur le site (pas forcément EMAIL_TO). */
    email: "vanosselt.rayane@gmail.com" as string,
    /** Format international conseillé, ex. "+32 470 00 00 00". */
    phone: "+32 483 73 07 15" as string,
    /** Ville / zone d'intervention, ex. "Bruxelles, Belgique". */
    location: "Bruxelles & Brabant wallon" as string,
  },

  /**
   * Crédit demandé quand une photo est partagée (réseaux, presse, site d'un club) :
   * affiché près des boutons de téléchargement, dans la visionneuse et les mentions légales.
   */
  credit: {
    handle: "@rayvo.captures0808",
  },

  /**
   * Délai de mise en ligne des photos après un match, annoncé sur le site
   * (accueil, albums « Photos à venir », page Retrouver mes photos).
   */
  turnaround: "48 h",

  /**
   * Derniers posts Instagram (accueil, À propos) : adresse du flux JSON Behold
   * (https://behold.so), ex. "https://feeds.behold.so/AbCdEf123". Lu une fois à chaque
   * publication du site (et la GitHub Action republie chaque matin) : jamais pendant les
   * visites, pour rester dans le quota gratuit. Vide = un simple bouton « Suivre ».
   */
  instagramFeed: "https://feeds.behold.so/1f59XhMifq6IRLE6OJEP" as string,

  /** Réseaux sociaux : URL complète. Laisser vide pour masquer. */
  socials: {
    instagram: "https://www.instagram.com/rayvo.captures0808/" as string,
    tiktok: "" as string,
    linkedin: "" as string,
    facebook: "" as string,
    youtube: "" as string,
  },

  /** Référencement (SEO). */
  seo: {
    /**
     * Ville ou région où vous travaillez, ex. "Bruxelles" ou "Bruxelles et Brabant wallon".
     * Ajoutée aux titres, descriptions et données structurées : c'est ce qui vous fait
     * apparaître sur « photographe sportif <ville> ». Laisser vide si non souhaité.
     */
    area: "Bruxelles et Brabant wallon" as string,
    /** La même zone dans une phrase : « Photographe sportif à Bruxelles et en Brabant wallon ». */
    areaPhrase: "à Bruxelles et en Brabant wallon" as string,
    /** Lieux servis, pour Google (données structurées). */
    areaServed: ["Bruxelles", "Brabant wallon"] as string[],
    /** Codes de vérification (Google Search Console, Bing Webmaster Tools). */
    googleSiteVerification: "" as string,
    bingSiteVerification: "" as string,
  },

  /** Vidéo d'arrière-plan du hero (fichier dans /public), sinon null. */
  heroVideo: null as null | { src: string; type: string },

  /**
   * Vidéos : vide = servies par le site lui-même (public/_videos/, préparé par
   * `npm run videos`). Pour les héberger ailleurs plus tard (le site approche de la
   * limite de 1 Go de GitHub Pages), y copier le contenu de public/_videos/ et
   * indiquer ici son adresse, sans « / » final, ex. "https://videos.rayvocaptures0808.be".
   */
  videoHost: "" as string,

  /**
   * Téléchargement des photos par les visiteurs (bouton « Télécharger »,
   * sélection en ZIP, galerie complète) : JPEG haute qualité au nom propre.
   * Réglage par défaut — chaque catégorie ou album peut le changer avec
   * `downloadEnabled: true | false` dans src/data/albums.ts.
   */
  downloads: {
    photos: true as boolean,
    /** Vidéos (src/data/videos.ts) : bouton « Télécharger », enregistrement dans Photos / la galerie sur téléphone. */
    videos: true as boolean,
    /** Au-delà, l'archive ZIP est refusée (elle est préparée dans le navigateur). */
    maxArchiveBytes: 400 * 1024 * 1024,
  },
} as const;

export type SocialKey = keyof typeof siteConfig.socials;

export const socialLabels: Record<SocialKey, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
};

/** Réseaux renseignés, dans l'ordre de déclaration. */
export function getSocialLinks() {
  return (Object.keys(siteConfig.socials) as SocialKey[])
    .filter((key) => siteConfig.socials[key])
    .map((key) => ({ key, label: socialLabels[key], href: siteConfig.socials[key] }));
}

/**
 * Navigation principale — volontairement courte. Le panneau « Albums »
 * (catégories groupées par sport, FIH Pro League → Hommes / Femmes) est
 * généré depuis src/data/albums.ts. Le logo mène aussi à l'accueil ;
 * « Mes photos » (bouton orange) mène à la recherche de photos.
 */
export const mainNav = [
  { label: "Accueil", href: "/" },
  { label: "Albums", href: "/albums", hasMegaMenu: true },
  { label: "Sélection", href: "/selection" },
  { label: "Matchs", href: "/matchs" },
  { label: "Vidéos", href: "/videos" },
  { label: "À propos", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Pages secondaires : pied de page et recherche (hors du menu principal pour le garder léger). */
export const secondaryNav = [
  { label: "Retrouver mes photos", href: "/galeries" },
  { label: "Football", href: "/football" },
  { label: "Services", href: "/services" },
] as const;

/** Accès aux photos : le parcours « je cherche mes photos », mis en avant partout. */
export const photoAccess = { label: "Mes photos", href: "/galeries" } as const;

export const isDev = process.env.NODE_ENV !== "production";
