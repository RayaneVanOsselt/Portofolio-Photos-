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
    // Pas de serveur d'images : chaque photo est déclinée à l'avance en WebP
    // (npm run photos) et ce chargeur choisit la bonne taille.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Largeurs du srcset = déclinaisons réellement générées (scripts/photos.mjs) :
    // aucune entrée en double, le navigateur choisit le bon fichier du premier coup.
    deviceSizes: [640, 1080, 1600, 2400],
    imageSizes: [320],
  },
  poweredByHeader: false,
};

export default nextConfig;
