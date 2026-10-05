/**
 * Accès aux photos.
 *
 * Les vraies photos sont déposées dans public/images/<dossier>/
 * (albums/<catégorie>/<album>/ pour les matchs, site/<page>/ pour les pages)
 * puis indexées par `npm run photos`, qui génère photo-manifest.json
 * (dimensions, couleur dominante, aperçu flou, texte alternatif).
 *
 * Tant qu'un dossier de site/ est vide, ses photos temporaires sont utilisées.
 * Un album vide n'a aucune photo : il affiche « Photos à venir ».
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

/**
 * Chapitres d'un reportage : les sous-dossiers directs du dossier de l'album,
 * dans l'ordre de leur nom (« 01-avant-match », « 02-action »…).
 */
export function getFolderChapters(folder: string, exclude: Set<string> = new Set()): { folder: string; name: string; photos: Photo[] }[] {
  const prefix = `${folder}/`;
  return (
    Object.keys(realPhotos)
      // Un sous-dossier qui est lui-même le dossier d'un autre album n'est pas un chapitre.
      .filter((key) => key.startsWith(prefix) && !key.slice(prefix.length).includes("/") && realPhotos[key].length && !exclude.has(key))
      .map((key) => key.slice(prefix.length))
      .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }))
      .map((name) => ({ folder: `${prefix}${name}`, name, photos: getFolderPhotos(`${prefix}${name}`) }))
  );
}
