"use client";

/**
 * Chargeur des composants `next/image` restants (vignettes de recherche…),
 * référencé dans next.config.ts. Les photos principales passent par
 * <PhotoPicture> (AVIF + repli WebP) ; ici, le WebP suffit pour de petites vignettes.
 *
 * - Vos photos (/images/…) : la plus petite version WebP qui couvre la largeur demandée.
 * - Photos temporaires Unsplash : leur CDN redimensionne et convertit lui-même.
 * - Autres fichiers (SVG…) : servis tels quels.
 */
import type { ImageLoaderProps } from "next/image";
import { isLocalPhoto, unsplashUrl, variantUrl, WEBP_WIDTHS } from "@/lib/photo-sources";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function imageLoader({ src, width }: ImageLoaderProps) {
  if (src.startsWith("https://images.unsplash.com/")) return unsplashUrl(src, width);
  if (isLocalPhoto(src)) return variantUrl(src, WEBP_WIDTHS.find((w) => w >= width) ?? WEBP_WIDTHS.at(-1)!, "webp");
  if (src.startsWith("/")) return `${BASE_PATH}${src}`;
  return src;
}
