"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";

const UNSPLASH = "https://images.unsplash.com/";

/**
 * Photos temporaires : le CDN d'Unsplash redimensionne et convertit
 * (AVIF/WebP) lui-même — inutile de les faire transiter par le serveur.
 */
function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.delete("fm");
  return url.toString();
}

/** next/image + loader adapté à la source. Les photos locales passent par l'optimiseur Next. */
export function SmartImage(props: ImageProps) {
  const isUnsplash = typeof props.src === "string" && props.src.startsWith(UNSPLASH);
  // eslint-disable-next-line jsx-a11y/alt-text -- alt transmis via props
  return <Image {...props} loader={isUnsplash ? unsplashLoader : props.loader} />;
}
