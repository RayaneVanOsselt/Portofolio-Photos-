/**
 * ⚠️ PHOTO TEMPORAIRE — À REMPLACER PAR VOTRE PORTRAIT.
 *
 * L'accueil, les Services et la grande photo de la page À propos utilisent
 * déjà vos photos de match (src/data/content.ts, services.ts). Reste le
 * portrait de la page À propos : une image Unsplash (licence Unsplash) qui ne
 * représente PAS le photographe. Les albums de matchs n'en utilisent jamais :
 * un album sans photo affiche « Photos à venir ».
 *
 * Dès que public/images/site/about/ contient votre portrait (et que
 * `npm run photos` a été lancé), il remplace automatiquement cette image :
 * indiquez son identifiant (« site/about/portrait.jpg ») dans `portraitId`.
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
  // Portrait de la page À propos (et de l'accueil)
  "site/about": [
    ["photo-1777304012262-594db955dce9", 2563, 3845, "#595959", "photographe avec un appareil professionnel au bord d'un terrain", "Leo_Visions", "leo_visions_"],
  ],
};

/** Photos temporaires par dossier de public/images/site/. */
export const placeholderByFolder: Record<string, Photo[]> = Object.fromEntries(Object.entries(site).map(([folder, rows]) => [folder, rows.map(toPhoto)]));
