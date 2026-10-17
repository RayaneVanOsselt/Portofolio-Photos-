/**
 * VIDÉOS — page /videos, accueil et pages d'albums, en un seul endroit.
 *
 * ─── Ajouter une vidéo ────────────────────────────────────────────────────
 *   1. Déposez le fichier (MP4 ou MOV, tel qu'exporté) dans le dossier
 *      « Vidéo à rajouter », à la racine du projet. Il ne part jamais sur GitHub.
 *   2. Ajoutez sa fiche ci-dessous (n'importe quel ordre : le site trie par date).
 *      `npm run videos` propose la fiche toute prête, titre et date lus dans le nom
 *      du fichier (« Léo - Racing 11:10:26.mp4 »).
 *   3. Lancez `npm run videos` : version web 720p, aperçu animé, images, dans
 *      public/_videos/ (une quinzaine de secondes par vidéo).
 *   4. Commitez et publiez comme d'habitude : public/_videos/ part avec le site
 *      (le total photos + vidéos doit rester sous 1 Go, voir README, « Vidéos »).
 *
 * Champs facultatifs : `album` (slug de l'album photo du même match : logos, sport,
 * lien « Photos du match », et la vidéo apparaît sur la page de l'album),
 * `description`, `posterAt` (seconde de l'image d'aperçu), `teaser` (début des
 * 4 extraits de l'aperçu animé), `featured: true` (« À la une » ; par défaut la plus
 * récente), `club` / `sport` (sans album), `downloadEnabled: false` (lecture seule ;
 * par défaut : siteConfig.downloads.videos).
 * Le slug commence par la date JJ-MM-AAAA (une incohérence bloque le build).
 */
import type { VideoInput } from "@/lib/types";

export const videos: VideoInput[] = [
  {
    // Affichée « Vidéo à venir » tant que le fichier n'est pas dans « Vidéo à rajouter ».
    slug: "17-10-2026-uccle-sport-pingouin-u19b1",
    title: "Uccle Sport U19B1 – Pingouin U19B1",
    date: "2026-10-17",
    source: "Uccle Sport U19B1 - Pingouin U19B1 17:10:26.mp4",
    album: "17-10-2026-uccle-sport-u19b1-pingouin-u19b1",
  },
  {
    slug: "11-10-2026-leo-racing",
    title: "Léo – Racing",
    date: "2026-10-11",
    source: "Léo - Racing 11:10:26.mp4",
    album: "11-10-2026-leopold-h1-racing-h1",
    posterAt: 58,
    teaser: [10, 23, 40, 50],
  },
  {
    slug: "27-06-2026-belgique-pays-bas",
    title: "Belgique – Pays-Bas",
    date: "2026-06-27",
    source: "Belgique - Pays Bas 27:06:26.mp4",
    album: "27-06-2026-belgique-pays-bas-men",
    posterAt: 35,
    teaser: [35, 46, 64, 98],
  },
  {
    slug: "27-06-2026-australie-pays-bas-femmes",
    title: "Australie – Pays-Bas Femmes",
    date: "2026-06-27",
    source: "Australie - Pays Bas Femmes.mp4",
    album: "27-06-2026-pays-bas-australie-women",
    posterAt: 14,
    teaser: [14, 18, 28, 50],
  },
  {
    slug: "30-05-2026-woluwe-langeveld",
    title: "Woluwe – Langeveld",
    date: "2026-05-30",
    source: "Woluwe - Langeveld 30-05-26.mp4",
    album: "30-05-2026-woluwe-h1-langeveld-h1",
    posterAt: 16,
    teaser: [16, 28, 36, 52],
  },
  {
    slug: "23-05-2026-daring-namur-h1",
    title: "Daring – Namur H1",
    date: "2026-05-23",
    source: "Daring - Namur H1 23:05:26.mp4",
    album: "23-05-2026-daring-h1-namur-h1",
    posterAt: 36,
    teaser: [6, 30, 36, 44],
  },
];
