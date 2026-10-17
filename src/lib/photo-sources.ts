/**
 * Adresses des versions web d'une photo, générées par scripts/photos.mjs dans
 * public/_photos/ : AVIF (format principal) et WebP (repli des navigateurs
 * anciens, vignettes). Mêmes largeurs que le script — à modifier ensemble.
 */
import type { Photo } from "@/lib/types";

export const AVIF_WIDTHS = [320, 640, 1080, 1600, 2048];
export const WEBP_WIDTHS = [320, 640, 1080];
/**
 * Photo téléchargeable : WebP jusqu'à 640 px seulement. Au-delà, le repli des
 * navigateurs sans AVIF (~5 % des visiteurs) est le JPEG à télécharger, déjà
 * publié et plus fin (2048 px) : ~110 Ko de moins par photo. Même règle dans le script.
 */
export const WEBP_MAX_WITH_DOWNLOAD = 640;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const LOCAL = /^\/images\/.+\.(jpe?g|png|webp|avif|tiff?)$/i;

type Source = Pick<Photo, "src" | "width" | "download">;

/** Photo du site (versions générées), par opposition aux photos temporaires Unsplash. */
export const isLocalPhoto = (src: string) => LOCAL.test(src);

/**
 * Largeurs produites pour une photo : celles inférieures à sa largeur, plus la
 * première qui la dépasse (encodée à la taille d'origine). Même règle que le script.
 */
export function widthsFor(list: number[], sourceWidth: number) {
  const below = list.filter((w) => w < sourceWidth);
  const cap = list.find((w) => w >= sourceWidth);
  return cap ? [...below, cap] : below;
}

/** /images/albums/x/IMG_1.jpg → /_photos/albums/x/IMG_1-640.avif (chemin du site, sans sous-dossier de publication). */
export function variantPath(src: string, width: number, format: "avif" | "webp") {
  return `/_photos/${src.replace(/^\/images\//, "").replace(/\.[a-z]+$/i, "")}-${width}.${format}`;
}

/** Adresse servie au navigateur (sous-dossier de publication compris). */
export const variantUrl = (src: string, width: number, format: "avif" | "webp") => `${BASE_PATH}${variantPath(src, width, format)}`;

/** Largeurs WebP produites pour une photo (voir WEBP_MAX_WITH_DOWNLOAD). */
export function webpWidths(photo: Source) {
  return widthsFor(photo.download ? WEBP_WIDTHS.filter((w) => w <= WEBP_MAX_WITH_DOWNLOAD) : WEBP_WIDTHS, photo.width);
}

/**
 * srcset « …-320.avif 320w, …-640.avif 640w… » — le descripteur est la largeur réelle du fichier.
 * En WebP, le JPEG à télécharger (s'il existe) sert de grande version.
 */
export function srcSetFor(photo: Source, format: "avif" | "webp") {
  const widths = format === "avif" ? widthsFor(AVIF_WIDTHS, photo.width) : webpWidths(photo);
  const set = widths.map((w) => `${variantUrl(photo.src, w, format)} ${Math.min(w, photo.width)}w`);
  if (format === "webp" && photo.download && photo.width > WEBP_MAX_WITH_DOWNLOAD) set.push(`${BASE_PATH}${photo.download.url} ${photo.width}w`);
  return set.join(", ");
}

/** Plus grande version d'un format. */
export function largestUrl(photo: Source, format: "avif" | "webp") {
  return variantUrl(photo.src, (format === "avif" ? widthsFor(AVIF_WIDTHS, photo.width) : webpWidths(photo)).at(-1)!, format);
}

/** Image de repli universelle (navigateurs anciens) : le JPEG à télécharger s'il existe, sinon la plus grande version WebP. */
export const fallbackUrl = (photo: Source) => (photo.download ? `${BASE_PATH}${photo.download.url}` : largestUrl(photo, "webp"));

/** Chemin de l'image de repli, sans sous-dossier de publication (URL absolues, sitemap). */
export const fallbackPath = (photo: Source) => photo.download?.url ?? variantPath(photo.src, webpWidths(photo).at(-1)!, "webp");

/** Photos temporaires Unsplash : leur CDN redimensionne et choisit le format lui-même. */
export function unsplashUrl(src: string, width: number) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", "75");
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.delete("fm");
  return url.toString();
}
