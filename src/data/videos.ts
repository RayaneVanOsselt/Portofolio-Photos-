/**
 * VIDÉOS — la page /videos, en un seul endroit.
 *
 * Les vidéos ne peuvent pas être mises dans GitHub (fichiers trop lourds : la
 * limite est de 100 Mo, et .gitignore les refuse toutes). Elles sont donc
 * hébergées ailleurs, et ce fichier donne simplement leur adresse.
 *
 * ─── Héberger une vidéo (une seule fois : créer l'espace) ─────────────────
 * Conseillé : Cloudflare R2 (10 Go gratuits, aucun frais de bande passante).
 *   1. Créez un « bucket », activez l'accès public (« Public Development URL »
 *      ou votre sous-domaine, ex. videos.rayvocaptures0808.be).
 *   2. Réglages du bucket → CORS : autorisez GET depuis https://rayvocaptures0808.be
 *      [{ "AllowedOrigins": ["https://rayvocaptures0808.be"], "AllowedMethods": ["GET"] }]
 *      Indispensable pour le bouton « Télécharger » sur téléphone (enregistrement
 *      dans Photos / la galerie). Sans CORS, la vidéo s'ouvre simplement dans un onglet.
 *   3. Déposez vos fichiers MP4 (format H.264 : lisible partout, iPhone compris).
 *
 * ─── Ajouter une vidéo ────────────────────────────────────────────────────
 * Une entrée ci-dessous, dans n'importe quel ordre (le site trie par date) :
 *   {
 *     slug: "18-10-2026-daring-h1-oree-h1-resume",
 *     title: "Daring H1 vs Orée H1 — résumé",
 *     date: "2026-10-18",
 *     src: "https://videos.rayvocaptures0808.be/daring-oree-resume.mp4",
 *     poster: "https://videos.rayvocaptures0808.be/daring-oree-resume.jpg",
 *     club: "daring",
 *   },
 * Le slug commence par la date JJ-MM-AAAA (une incohérence bloque le build).
 *
 * Facultatif : `poster` (image d'aperçu), `description`, `club` (logo, voir
 * src/data/clubs.ts), `sport`, `duration` (« 1:24 »), `bytes` (taille affichée
 * sur le bouton), `vertical: true` (format 9:16, type Reels / TikTok),
 * `downloadEnabled: false` (lecture seule ; par défaut : siteConfig.downloads.videos).
 */
import type { VideoInput } from "@/lib/types";

export const videos: VideoInput[] = [];
