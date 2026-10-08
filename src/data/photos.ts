/**
 * Accès aux photos.
 *
 * `npm run photos` lit les photos des albums dans « Dossier photos/ » (champ
 * `source` de src/data/albums.ts) et celles des pages dans public/images/site/,
 * génère leurs versions web dans public/_photos/ et les décrit dans
 * photo-manifest.json (dimensions, couleur dominante, aperçu flou, texte
 * alternatif, fichier à télécharger). Chaque dossier du manifest a pour clé le
 * chemin de l'adresse : « albums/daring-h1/23-05-2026-daring-h1-namur-h1 ».
 *
 * Tant qu'un dossier de site/ est vide, ses photos temporaires sont utilisées.
 * Un album vide n'a aucune photo : il affiche « Photos à venir ».
 */
import type { Photo } from "@/lib/types";
import manifest from "./photo-manifest.json";
import { placeholderByFolder } from "./placeholder-photos";

type ManifestEntry = Omit<Photo, "id" | "credit" | "download"> & {
  file: string;
  /** Empreinte du fichier source (traitement incrémental). */
  hash: string;
  /** Fichier source, depuis la racine du projet (lecture au build uniquement). */
  source: string;
  /** Fichier à télécharger, dans public/_photos/ (galeries autorisées). */
  download?: { path: string; bytes: number };
};
const realPhotos = manifest as Record<string, ManifestEntry[]>;

export function getFolderPhotos(folder: string): Photo[] {
  const real = realPhotos[folder];
  if (real?.length) {
    // Empreinte et chemin source restent côté build : rien d'inutile dans les pages.
    return real.map(({ file, src, width, height, alt, color, blurDataURL, exif, download }) => ({
      id: `${folder}/${file}`,
      src,
      width,
      height,
      alt,
      color,
      blurDataURL,
      exif,
      ...(download ? { download: { url: `/_photos/${download.path}`, filename: download.path.split("/").at(-1)!, bytes: download.bytes } } : {}),
    }));
  }
  return placeholderByFolder[folder] ?? [];
}

/**
 * Chapitres d'un reportage : les sous-dossiers directs du dossier de l'album,
 * dans l'ordre de leur nom (« belgique », « pays-bas », « 01-avant-match »…).
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

const sourceById = new Map<string, string>(Object.entries(realPhotos).flatMap(([folder, list]) => list.map((p): [string, string] => [`${folder}/${p.file}`, p.source])));

/** Fichier source d'une photo (images de partage générées au build). */
export function getPhotoSourceFile(id: string): string | undefined {
  return sourceById.get(id);
}
