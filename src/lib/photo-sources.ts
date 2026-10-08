/**
 * Adresses des versions web d'une photo, générées par scripts/photos.mjs dans
 * public/_photos/ : AVIF (format principal) et WebP (repli des navigateurs
 * anciens, partage, données Google). Mêmes largeurs que le script — à modifier ensemble.
 */
import type { Photo } from "@/lib/types";

export const AVIF_WIDTHS = [320, 640, 1080, 1600, 2048];
export const WEBP_WIDTHS = [320, 640, 1080];

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const LOCAL = /^\/images\/.+\.(jpe?g|png|webp|avif|tiff?)$/i;

type Source = Pick<Photo, "src" | "width">;

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

/** srcset « …-320.avif 320w, …-640.avif 640w… » — le descripteur est la largeur réelle du fichier. */
export function srcSetFor(photo: Source, format: "avif" | "webp") {
  return widthsFor(format === "avif" ? AVIF_WIDTHS : WEBP_WIDTHS, photo.width)
    .map((w) => `${variantUrl(photo.src, w, format)} ${Math.min(w, photo.width)}w`)
    .join(", ");
}

/** Plus grande version d'un format. */
export function largestUrl(photo: Source, format: "avif" | "webp") {
  return variantUrl(photo.src, widthsFor(format === "avif" ? AVIF_WIDTHS : WEBP_WIDTHS, photo.width).at(-1)!, format);
}

/** Plus grande version WebP : image de repli universelle (navigateurs anciens, partage, Google). */
export const fallbackUrl = (photo: Source) => largestUrl(photo, "webp");

/** Chemin de la plus grande version WebP, sans sous-dossier de publication (URL absolues, sitemap). */
export const fallbackPath = (photo: Source) => variantPath(photo.src, widthsFor(WEBP_WIDTHS, photo.width).at(-1)!, "webp");

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
