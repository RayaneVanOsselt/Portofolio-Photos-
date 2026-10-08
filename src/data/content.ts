/**
 * Textes des pages. Tout ce qui est entre crochets [ … ] est un emplacement
 * réservé à remplacer par le vrai contenu — rien n'a été inventé.
 *
 * Les références aux photos utilisent leur identifiant (voir src/data/photos.ts),
 * ex. « site/home/hero.jpg » ou « albums/daring-h1/20-09-2026-daring-h1-leo-h1/12-but.jpg ».
 * Si un identifiant n'existe plus (ex. photos temporaires remplacées), la première
 * photo du dossier de la page est utilisée (public/images/site/home/, site/about/…).
 */

export const homeContent = {
  hero: {
    photoId: "albums/fih-pro-league/hommes/27-06-2026-belgique-pays-bas-men/belgique/IMG_3563.jpg",
    eyebrow: "Photographe sportif — Hockey · Rugby · Football",
    /** Deux lignes, affichées en très grand (capitales étendues). */
    title: ["Au cœur", "du jeu."] as [string, string],
    lead: "Matchs, équipes et clubs photographiés au bord du terrain — l'effort, le geste, l'émotion, au moment exact où tout bascule.",
    primaryCta: { label: "Voir les albums", href: "/albums" },
    secondaryCta: { label: "Trouver mes photos", href: "/galeries" },
  },
};

export const aboutContent = {
  portraitId: "ph-1777304012262-594db955dce9",
  /** Spécialités (puces de la page À propos et de l'accueil). */
  specialties: ["Hockey sur gazon", "Rugby", "Football", "Portraits d'équipe", "Contenus pour clubs"],
  /** Matériel : laisser vide pour masquer la section (rien n'est inventé). Ex. "Sony A1", "70-200 mm f/2.8". */
  equipment: [] as string[],
  wideId: "albums/rwdm-2026-2027/03-10-2026-union-sg-b-rwdm/IMG_6956.jpg",
  intro: "[VOTRE PRÉSENTATION — deux ou trois phrases authentiques : qui vous êtes, d'où vous venez, ce qui vous a amené à la photo de sport.]",
  approach: [
    { title: "Ma manière de travailler", body: "[COMMENT VOUS TRAVAILLEZ — préparation, placement au bord du terrain, échanges avec le club.]" },
    { title: "Ma vision", body: "[VOTRE VISION — ce que vous cherchez à montrer dans une image de sport.]" },
    { title: "La lumière", body: "[VOTRE APPROCHE DE LA LUMIÈRE — projecteurs, matchs en journée, salles, contre-jours.]" },
    { title: "Les personnes", body: "[VOTRE RAPPORT AUX JOUEURS, STAFFS ET SUPPORTERS.]" },
    { title: "Les événements", body: "[VOTRE APPROCHE DES ÉVÉNEMENTS ET DES GRANDS RENDEZ-VOUS.]" },
    { title: "Mon objectif", body: "[VOTRE OBJECTIF PHOTOGRAPHIQUE.]" },
  ],
  values: [
    { title: "Authenticité", body: "Montrer le jeu tel qu'il est, sans mise en scène." },
    { title: "Créativité", body: "Chercher l'angle, la lumière et le moment que personne n'attend." },
    { title: "Précision", body: "Anticiper l'action pour être prêt à la fraction de seconde." },
    { title: "Émotion", body: "Garder la trace de ce que le match a fait ressentir." },
  ],
  /**
   * Chiffres clés : laisser `value` à null tant qu'ils ne sont pas connus.
   * Les chiffres null sont masqués en production (jamais de faux chiffres).
   */
  stats: [
    { label: "Années d'expérience", value: null as string | null },
    { label: "Matchs couverts", value: null as string | null },
    { label: "Clubs & partenaires", value: null as string | null },
  ],
  /** Clubs, médias, partenaires : à compléter avec de vraies références uniquement. */
  clients: [] as string[],
};

export const contactContent = {
  title: "Parlons de votre *projet*.",
  intro: "Match, saison, événement, portraits ou contenus pour votre club : décrivez votre besoin, je vous réponds rapidement.",
};
