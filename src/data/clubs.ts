/**
 * Clubs et compétitions : déclarés une seule fois, réutilisés partout
 * (menu, pages d'albums, fiches de match, images de partage).
 *
 * Ajouter un club :
 *   1. une ligne ci-dessous, ex. `embourg: { name: "Embourg" }` ;
 *   2. son logo dans assets/logos/embourg.png (même identifiant) ;
 *   3. `npm run logos` (lancé automatiquement par `npm run dev` et `npm run build`).
 *
 * Le logo apparaît alors tout seul à côté de chaque équipe dont le nom commence
 * par `name` ou par l'un des `aliases` (« Embourg D1 », « Embourg H1 »…).
 * Sans fichier logo, le club s'affiche simplement sans logo — rien n'est inventé.
 */
import type { ClubInput } from "@/lib/types";

export const clubs = {
  daring: { name: "Daring" },
  leopold: { name: "Léopold", aliases: ["Leopold", "Leo"] },
  "louvain-la-neuve": { name: "Louvain-la-Neuve" },
  rwdm: { name: "RWDM" },
  "white-star": { name: "White Star" },
  woluwe: { name: "Woluwe Hockey Club", aliases: ["Woluwe"] },
  wolvendael: { name: "Wolvendael" },
  "fih-pro-league": { name: "FIH Pro League", kind: "competition" },
} satisfies Record<string, ClubInput>;

export type ClubId = keyof typeof clubs;
