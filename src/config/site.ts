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
    /** Initiales dessinées dans le monogramme (voir components/brand). */
    monogram: "RV",
  },
  /** Signature affichée sous le nom. */
  tagline: "Photographe sportif — Hockey · Rugby · Football",
  /** Description par défaut (SEO, partage). */
  description:
    "Photographe sportif — hockey, rugby et football. Reportages de match, portraits d'équipe et contenus pour clubs, au plus près du jeu.",
  /** Langue du contenu (attribut html lang + Open Graph). */
  locale: "fr_BE",
  language: "fr-BE",

  /** URL publique — définie via NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",

  contact: {
    /** Adresse affichée publiquement sur le site (pas forcément EMAIL_TO). */
    email: "" as string,
    /** Format international conseillé, ex. "+32 470 00 00 00". */
    phone: "" as string,
    /** Ville / zone d'intervention, ex. "Bruxelles, Belgique". */
    location: "" as string,
  },

  /** Réseaux sociaux : URL complète. Laisser vide pour masquer. */
  socials: {
    instagram: "" as string,
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
    area: "" as string,
    /** Codes de vérification (Google Search Console, Bing Webmaster Tools). */
    googleSiteVerification: "" as string,
    bingSiteVerification: "" as string,
  },

  /** Fuseau de l'heure affichée en direct dans le pied de page. */
  timeZone: "Europe/Brussels",

  /** Vidéo d'arrière-plan du hero (fichier dans /public), sinon null. */
  heroVideo: null as null | { src: string; type: string },
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
 * Navigation principale. Le méga-menu Portfolio est généré depuis data/categories.
 * Le logo mène à l'accueil ; « Mes photos » (bouton orange) mène aux galeries.
 */
export const mainNav = [
  { label: "Portfolio", href: "/portfolio", hasMegaMenu: true },
  { label: "Galeries", href: "/galeries" },
  { label: "Services", href: "/services" },
  { label: "À propos", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Accès aux photos : le parcours « je cherche mes photos », mis en avant partout. */
export const photoAccess = { label: "Mes photos", href: "/galeries" } as const;

export const isDev = process.env.NODE_ENV !== "production";
