/**
 * Accès aux photos.
 *
 * Les vraies photos sont déposées dans public/images/portfolio/<dossier>/
 * puis indexées par `npm run photos`, qui génère photo-manifest.json
 * (dimensions, couleur dominante, aperçu flou, texte alternatif).
 *
 * Tant qu'un dossier est vide, les photos temporaires sont utilisées.
 */
import type { Photo } from "@/lib/types";
import manifest from "./photo-manifest.json";
import { placeholderByFolder, placeholderChapters } from "./placeholder-photos";

type ManifestEntry = Omit<Photo, "id" | "credit"> & { file: string };
const realPhotos = manifest as Record<string, ManifestEntry[]>;

export function getFolderPhotos(folder: string): Photo[] {
  const real = realPhotos[folder];
  if (real?.length) {
    return real.map(({ file, ...photo }) => ({ ...photo, id: `${folder}/${file}` }));
  }
  return placeholderByFolder[folder] ?? [];
}

/**
 * Chapitres d'un reportage : les sous-dossiers directs du dossier de la galerie,
 * dans l'ordre de leur nom (« 01-avant-match », « 02-action »…).
 */
export function getFolderChapters(folder: string, exclude: Set<string> = new Set()): { folder: string; name: string; photos: Photo[] }[] {
  const prefix = `${folder}/`;
  const names = Object.keys(realPhotos)
    // Un sous-dossier qui est lui-même le dossier d'une autre galerie n'est pas un chapitre.
    .filter((key) => key.startsWith(prefix) && !key.slice(prefix.length).includes("/") && realPhotos[key].length && !exclude.has(key))
    .map((key) => key.slice(prefix.length))
    .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
  if (names.length) return names.map((name) => ({ folder: `${prefix}${name}`, name, photos: getFolderPhotos(`${prefix}${name}`) }));
  const placeholder = placeholderChapters[folder];
  if (placeholder && !realPhotos[folder]?.length) {
    return Object.entries(placeholder).map(([name, photos]) => ({ folder: `${prefix}${name}`, name, photos }));
  }
  return [];
}

/** Vrai si au moins une photo temporaire est encore affichée sur le site. */
export function usesPlaceholderPhotos(folders: string[]) {
  return folders.some((folder) => !realPhotos[folder]?.length);
}
