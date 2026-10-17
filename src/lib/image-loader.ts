"use client";

/**
 * Chargeur des composants `next/image` restants (vignettes de recherche…),
 * référencé dans next.config.ts. Les photos principales passent par
 * <PhotoPicture> (AVIF + repli WebP) ; ici, le WebP suffit pour de petites vignettes.
 *
 * - Vos photos (/images/…) : la plus petite version WebP (320 ou 640 px, produites
 *   pour toutes les photos) qui couvre la largeur demandée.
 * - Photos temporaires Unsplash : leur CDN redimensionne et convertit lui-même.
 * - Autres fichiers (SVG…) : servis tels quels.
 */
import type { ImageLoaderProps } from "next/image";
import { isLocalPhoto, unsplashUrl, variantUrl, WEBP_MAX_WITH_DOWNLOAD, WEBP_WIDTHS } from "@/lib/photo-sources";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const THUMB_WIDTHS = WEBP_WIDTHS.filter((w) => w <= WEBP_MAX_WITH_DOWNLOAD);

export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.startsWith("https://images.unsplash.com/")) return unsplashUrl(src, width);
  if (isLocalPhoto(src)) return variantUrl(src, THUMB_WIDTHS.find((w) => w >= width) ?? THUMB_WIDTHS.at(-1)!, "webp");
  if (src.startsWith("/")) return `${BASE_PATH}${src}`;
  return src;
}
