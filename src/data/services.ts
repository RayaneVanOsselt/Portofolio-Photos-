/**
 * Prestations — liste provisoire, à adapter.
 * Aucun tarif n'est affiché : chaque service renvoie vers une demande de devis.
 * `photoId` : identifiant d'une photo du portfolio (voir src/data/photos.ts).
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
    photoId: "ph-1639509249768-cbf320b9dec7",
  },
  {
    slug: "portraits-equipe",
    title: "Portraits d'équipe & joueurs",
    format: "Séance photo",
    description:
      "Photos officielles d'équipe, portraits individuels et media days, pensés pour la saison, la presse et les supports du club.",
    deliverables: ["Photo d'équipe", "Portraits individuels", "Déclinaisons pour la communication"],
    photoId: "ph-1764967116421-342cb89025bf",
  },
  {
    slug: "contenus-clubs-partenaires",
    title: "Contenus clubs & partenaires",
    format: "Contenu",
    description:
      "Des images pour faire vivre un club toute la saison : annonces, réseaux sociaux, visibilité des partenaires et sponsors.",
    deliverables: ["Visuels pour réseaux sociaux", "Images pour partenaires", "Banque d'images de saison"],
    photoId: "ph-1537752895990-7040fb41a932",
  },
  {
    slug: "evenements-sportifs",
    title: "Événements sportifs",
    format: "Événement",
    description:
      "Tournois, stages, remises de prix et soirées de club : l'événement couvert dans sa totalité, sur le terrain comme en dehors.",
    deliverables: ["Couverture de l'événement", "Sélection retouchée", "Galerie partageable"],
    photoId: "ph-1629217855633-79a6925d6c47",
  },
];
