/**
 * Prestations — liste provisoire, à adapter.
 * Aucun tarif n'est affiché : chaque service renvoie vers une demande de devis.
 * `photoId` : identifiant d'une photo (voir src/data/photos.ts) ; à défaut,
 * une photo de public/images/site/services/ est utilisée.
 */
import type { Service } from "@/lib/types";

export const services: Service[] = [
  {
    slug: "couverture-de-match",
    title: "Couverture de match",
    format: "Reportage",
    description:
      "Une rencontre racontée de bout en bout : l'échauffement, les temps forts, les visages et l'ambiance autour du terrain.",
    deliverables: ["Sélection d'images retouchées", "Galerie de livraison en ligne", "Formats web et réseaux sociaux"],
    photoId: "albums/rwdm-2026-2027/03-10-2026-union-sg-b-rwdm/IMG_7016.jpg",
  },
  {
    slug: "portraits-equipe",
    title: "Portraits d'équipe & joueurs",
    format: "Séance photo",
    description:
      "Photos officielles d'équipe, portraits individuels et media days, pensés pour la saison, la presse et les supports du club.",
    deliverables: ["Photo d'équipe", "Portraits individuels", "Déclinaisons pour la communication"],
    photoId: "albums/rwdm-2026-2027/12-09-2026-rwdm-charleroi-b/IMG_5905.jpg",
  },
  {
    slug: "contenus-clubs-partenaires",
    title: "Contenus clubs & partenaires",
    format: "Contenu",
    description:
      "Des images pour faire vivre un club toute la saison : annonces, réseaux sociaux, visibilité des partenaires et sponsors.",
    deliverables: ["Visuels pour réseaux sociaux", "Images pour partenaires", "Banque d'images de saison"],
    photoId: "albums/white-star-h1/04-10-2026-white-star-h1-louvain-la-neuve-h1/IMG_7865.jpg",
  },
  {
    slug: "evenements-sportifs",
    title: "Événements sportifs",
    format: "Événement",
    description:
      "Tournois, stages, remises de prix et soirées de club : l'événement couvert dans sa totalité, sur le terrain comme en dehors.",
    deliverables: ["Couverture de l'événement", "Sélection retouchée", "Galerie partageable"],
    photoId: "albums/rugby/16-05-2026-rugby-final-d1/IMG_2147.jpg",
  },
];
