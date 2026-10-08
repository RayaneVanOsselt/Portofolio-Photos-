import type { NextConfig } from "next";

/**
 * Site 100 % statique, publié sur GitHub Pages.
 *
 * `npm run build` produit le dossier `out/` (HTML, CSS, JS, images) : c'est
 * lui — et lui seul — qui est mis en ligne par la GitHub Action
 * (.github/workflows/deploy.yml). Aucun serveur n'est nécessaire.
 *
 * NEXT_PUBLIC_BASE_PATH : sous-dossier de publication, ex. "/Portofolio-Photos-"
 * pour https://<utilisateur>.github.io/Portofolio-Photos-/. Vide en local
 * ou avec un domaine personnalisé. Renseigné automatiquement par la GitHub Action.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    // Pas de serveur d'images : chaque photo est déclinée à l'avance (npm run photos).
    // Les photos principales passent par <PhotoPicture> (AVIF + WebP) ; next/image ne
    // sert plus que de petites vignettes, en WebP, via ce chargeur.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Largeurs du srcset = versions WebP réellement générées (scripts/photos.mjs) :
    // aucune entrée en double, le navigateur choisit le bon fichier du premier coup.
    deviceSizes: [640, 1080],
    imageSizes: [320],
  },
  poweredByHeader: false,
};

export default nextConfig;
