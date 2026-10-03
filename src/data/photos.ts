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
import { placeholderByFolder } from "./placeholder-photos";

type ManifestEntry = Omit<Photo, "id" | "credit"> & { file: string };
const realPhotos = manifest as Record<string, ManifestEntry[]>;

export function getFolderPhotos(folder: string): Photo[] {
  const real = realPhotos[folder];
  if (real?.length) {
    return real.map(({ file, ...photo }) => ({ ...photo, id: `${folder}/${file}` }));
  }
  return placeholderByFolder[folder] ?? [];
}

/** Vrai si au moins une photo temporaire est encore affichée sur le site. */
export function usesPlaceholderPhotos(folders: string[]) {
  return folders.some((folder) => !realPhotos[folder]?.length);
}
