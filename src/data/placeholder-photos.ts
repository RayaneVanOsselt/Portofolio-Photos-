/**
 * ⚠️ PHOTOS TEMPORAIRES — À REMPLACER AVANT LA MISE EN LIGNE.
 *
 * Ces images proviennent d'Unsplash (licence Unsplash) et servent uniquement
 * à habiller les pages du site (accueil, À propos, Services) tant que vos
 * photos ne sont pas ajoutées. Elles ne représentent PAS le travail du
 * photographe. Les albums de matchs n'en utilisent jamais : un album sans
 * photo affiche « Photos à venir ».
 *
 * Dès qu'un dossier de public/images/site/ contient des photos (et que
 * `npm run photos` a été lancé), elles remplacent automatiquement ces
 * images (voir src/data/photos.ts).
 */
import type { Photo } from "@/lib/types";

type Row = [id: string, width: number, height: number, color: string, alt: string, author: string, username: string];

const toPhoto = ([id, width, height, color, alt, author, username]: Row): Photo => {
  // Taille d'origine limitée à 2400px : le CDN d'Unsplash redimensionne ensuite.
  const scale = Math.min(1, 2400 / Math.max(width, height));
  return {
    id: `ph-${id.replace(/^(flagged\/)?photo-/, "")}`,
    src: `https://images.unsplash.com/${id}?w=${width >= height ? 2400 : Math.round(2400 * (width / height))}&q=80&fm=jpg`,
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    color,
    alt: `Photo temporaire — ${alt.charAt(0).toUpperCase()}${alt.slice(1)}`,
    credit: { name: author, url: `https://unsplash.com/@${username}` },
  };
};

const site: Record<string, Row[]> = {
  // Hero de l'accueil
  "site/home": [["photo-1680010090687-6a5e4fe855b8", 6000, 4000, "#8ca6c0", "jeunes joueurs de hockey sur gazon", "Guillaume Didelet", "mejlivg"]],
  // Portrait et photo large de la page À propos
  "site/about": [
    ["photo-1777304012262-594db955dce9", 2563, 3845, "#595959", "photographe avec un appareil professionnel au bord d'un terrain", "Leo_Visions", "leo_visions_"],
    ["photo-1656603020708-e3810e667f97", 7952, 5304, "#262626", "photographe agenouillé tenant son appareil", "Yuanzhe Ma", "myz"],
    ["photo-1780509459807-d47e3571cc99", 5472, 3648, "#0c268c", "terrain bleu sous les projecteurs et un ciel violet", "Glen Carrie", "glencarrie"],
  ],
  // Une photo par prestation (src/data/services.ts)
  "site/services": [
    ["photo-1639509249768-cbf320b9dec7", 8256, 5504, "#408c40", "deux joueurs de hockey sur gazon en duel", "Pablo Arenas", "pabloarenas"],
    ["photo-1764967116421-342cb89025bf", 5760, 3840, "#d9d9f3", "joueur tenant son stick sur le gazon", "Arjun Baroi", "arjunbaroi365"],
    ["photo-1537752895990-7040fb41a932", 6000, 4000, "#262626", "équipe féminine réunie sur le terrain", "Jeffrey F Lin", "jeffreyflin"],
    ["photo-1629217855633-79a6925d6c47", 5377, 3585, "#262626", "supporters dans un stade de football", "Krzysztof Dubiel", "kris1902"],
  ],
};

/** Photos temporaires par dossier de public/images/site/. */
export const placeholderByFolder: Record<string, Photo[]> = Object.fromEntries(Object.entries(site).map(([folder, rows]) => [folder, rows.map(toPhoto)]));
