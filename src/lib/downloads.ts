/**
 * Téléchargement des photos — règles partagées par le site (src/lib/albums.ts)
 * et par le pipeline photo (scripts/photos.mjs), pour qu'ils ne divergent jamais.
 *
 * Volontairement sans import : ce fichier est aussi lu directement par Node.
 */

type Switch = { downloadEnabled?: boolean };

/**
 * Une galerie est-elle téléchargeable ? Le réglage le plus précis l'emporte :
 *   album (`downloadEnabled`, ou l'ancien `allowDownload`)
 *   → catégorie la plus proche (`downloadEnabled`, hérité par ses sous-catégories)
 *   → réglage global (`siteConfig.downloads.photos`).
 *
 * @param categories catégories de l'album, de la racine à la plus proche.
 */
export function isDownloadEnabled(album: Switch & { allowDownload?: boolean }, categories: Switch[], fallback: boolean): boolean {
  if (album.downloadEnabled !== undefined) return album.downloadEnabled;
  if (album.allowDownload !== undefined) return album.allowDownload;
  for (let i = categories.length - 1; i >= 0; i--) {
    if (categories[i].downloadEnabled !== undefined) return categories[i].downloadEnabled!;
  }
  return fallback;
}

/** « rayvo.captures0808 » → « rayvo-captures0808 » */
export function fileSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Nom du fichier téléchargé, lisible et triable :
 *   rayvo-captures0808-2026-05-23-daring-h1-namur-h1-07.jpg
 * La date (AAAA-MM-JJ) précède l'événement ; le slug de l'album perd sa date JJ-MM-AAAA.
 */
export function downloadFileName({ brand, date, slug, index, total }: { brand: string; date: string; slug: string; index: number; total: number }) {
  const event = slug.replace(/^\d{2}-\d{2}-\d{4}-/, "");
  const number = String(index + 1).padStart(Math.max(2, String(total).length), "0");
  return `${fileSlug(brand)}-${date}-${event}-${number}.jpg`;
}

/** Dossier des archives ZIP et des fichiers d'un album : « rayvo-captures0808-2026-05-23-daring-h1-namur-h1 ». */
export function downloadFolderName({ brand, date, slug }: { brand: string; date: string; slug: string }) {
  return `${fileSlug(brand)}-${date}-${slug.replace(/^\d{2}-\d{2}-\d{4}-/, "")}`;
}
