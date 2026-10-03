"use client";

/**
 * Chargeur d'images pour le site statique (référencé dans next.config.ts).
 *
 * - Vos photos (/images/…) : déclinaisons WebP générées par `npm run photos`
 *   dans /_photos/ — on sert la plus petite qui couvre la largeur demandée.
 * - Photos temporaires Unsplash : leur CDN redimensionne et convertit lui-même.
 * - Autres fichiers (SVG…) : servis tels quels.
 */
import type { ImageLoaderProps } from "next/image";

/** Mêmes valeurs que VARIANT_WIDTHS dans scripts/photos.mjs. */
const VARIANT_WIDTHS = [640, 1080, 1600, 2400];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    url.searchParams.delete("fm");
    return url.toString();
  }

  if (/^\/images\/.+\.(jpe?g|png|webp|avif)$/i.test(src)) {
    const variant = VARIANT_WIDTHS.find((w) => w >= width) ?? VARIANT_WIDTHS.at(-1)!;
    const base = src.replace(/^\/images\//, "").replace(/\.[a-z]+$/i, "");
    return `${BASE_PATH}/_photos/${base}-${variant}.webp`;
  }

  if (src.startsWith("/")) return `${BASE_PATH}${src}`;
  return src;
}
