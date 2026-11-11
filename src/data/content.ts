/**
 * Textes des pages. Tout ce qui est entre crochets [ … ] est un emplacement
 * réservé à remplacer par le vrai contenu — rien n'a été inventé. Tant qu'il
 * n'est pas remplacé, il n'est visible qu'en développement : en ligne, la
 * présentation est remplacée par la description du site et un principe
 * d'« Approche » non rédigé est masqué.
 *
 * Les références aux photos utilisent leur identifiant (voir src/data/photos.ts),
 * ex. « site/home/hero.jpg » ou « albums/daring-h1/20-09-2026-daring-h1-leo-h1/12-but.jpg ».
 * Si un identifiant n'existe plus (ex. photos temporaires remplacées), la première
 * photo du dossier de la page est utilisée (public/images/site/home/, site/about/…).
 */

export const homeContent = {
  hero: {
    photoId: "albums/fih-pro-league/hommes/27-06-2026-belgique-pays-bas-men/belgique/IMG_3563.jpg",
    eyebrow: "Photographe sportif · Bruxelles & Brabant wallon",
    /** Deux lignes, affichées en très grand (capitales étendues). */
    title: ["Au cœur", "du jeu."] as [string, string],
    lead: "Hockey, football et rugby à Bruxelles et en Brabant wallon : matchs, équipes et clubs photographiés au bord du terrain. Vos photos en ligne sous 48 h après le match.",
    primaryCta: { label: "Voir les albums", href: "/albums" },
    secondaryCta: { label: "Trouver mes photos", href: "/galeries" },
  },
  /**
   * « À la une » sous le hero : la catégorie la plus prestigieuse, en très grand.
   * `category` = slug d'une catégorie principale de src/data/albums.ts.
   */
  spotlight: {
    category: "fih-pro-league",
    photoId: "albums/fih-pro-league/hommes/27-06-2026-belgique-pays-bas-men/belgique/IMG_3620.jpg",
    kicker: "À la une · Hockey international",
    text: "Belgique – Pays-Bas chez les hommes et chez les femmes, Pays-Bas – Australie : trois matchs de FIH Pro League, le plus haut niveau du hockey mondial, vécus au bord du terrain.",
  },
};

export const aboutContent = {
  portraitId: "site/about/rayane-photographe-sportif-au-bord-du-terrain.jpg",
  /** Spécialités (puces de la page À propos et de l'accueil). */
  specialties: ["Hockey sur gazon", "Rugby", "Football", "Portraits d'équipe", "Contenus pour clubs"],
  wideId: "albums/rwdm/2026-2027/03-10-2026-union-sg-b-rwdm/IMG_6956.jpg",
  /** Mini-bio (4-5 phrases) : page À propos et accueil. */
  intro:
    "Je m'appelle Rayane, photographe sportif à Bruxelles et en Brabant wallon. J'adore la photographie de sport : l'intensité d'un duel, la tension avant un corner, la joie d'une équipe qui célèbre ensemble. Hockey, football ou rugby, du championnat de Belgique jusqu'à la FIH Pro League, je photographie chaque match au bord du terrain, au plus près des joueurs. Mon objectif : saisir l'instant qui ne se rejoue pas et le rendre aussi fort que sur le terrain. Chaque rencontre devient un album en ligne sous 48 h, pour que joueurs, clubs et supporters retrouvent leurs plus beaux moments.",
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
};

export const contactContent = {
  title: "Parlons de votre *projet*.",
  intro: "Match, saison, événement, portraits ou contenus pour votre club : décrivez votre besoin, je vous réponds rapidement.",
};
