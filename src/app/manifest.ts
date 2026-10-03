import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  // Fichier JSON brut : le sous-dossier de publication doit être ajouté à la main.
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return {
    name: siteConfig.name,
    short_name: siteConfig.logo.primary,
    description: siteConfig.description,
    start_url: `${base}/`,
    display: "standalone",
    background_color: "#012624",
    theme_color: "#012624",
    icons: [
      { src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml" },
      { src: `${base}/apple-icon.png`, sizes: "180x180", type: "image/png" },
    ],
  };
}

export const dynamic = "force-static";
