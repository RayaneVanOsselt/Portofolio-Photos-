/**
 * Arborescence du portfolio (menus principaux et sous-menus).
 *
 * L'ordre ici = l'ordre dans la navigation, les filtres et le plan du site.
 * Ajouter une rubrique : ajouter un objet ; ajouter un sous-menu : l'ajouter
 * dans `children`. Les URL sont générées depuis les `slug`
 * (/portfolio/<rubrique>/<sous-rubrique>).
 *
 * Les introductions sont des textes de départ neutres — à personnaliser.
 */
import type { CategoryInput } from "@/lib/types";

export const categoryTree: CategoryInput[] = [
  {
    slug: "dh-hommes",
    title: "DH Hommes",
    kicker: "Hockey — Division Honneur",
    sport: "hockey",
    intro: "La Division Honneur messieurs, match après match. Vitesse, impacts et caractère sur le synthétique.",
    children: [
      { slug: "daring", title: "Daring", kicker: "DH Hommes", intro: "Le Daring en Division Honneur." },
      { slug: "leopold", title: "Léopold", kicker: "DH Hommes", intro: "Le Léopold en Division Honneur." },
    ],
  },
  {
    slug: "fih-pro-league",
    title: "FIH Pro League",
    kicker: "Hockey — International",
    sport: "hockey",
    intro: "Le plus haut niveau du hockey international. Les sélections nationales, leurs adversaires et l'intensité des grands rendez-vous.",
    children: [
      { slug: "red-panthers", title: "Red Panthers", kicker: "FIH Pro League", intro: "L'équipe nationale féminine belge en FIH Pro League." },
      { slug: "red-lions", title: "Red Lions", kicker: "FIH Pro League", intro: "L'équipe nationale masculine belge en FIH Pro League." },
      { slug: "pays-bas", title: "Pays-Bas", kicker: "FIH Pro League", intro: "Les Pays-Bas en FIH Pro League." },
    ],
  },
  {
    slug: "rugby",
    title: "Rugby",
    kicker: "Rugby",
    sport: "rugby",
    intro: "Contacts, mêlées et lignes de course. Le rugby dans ce qu'il a de plus brut.",
  },
  {
    slug: "rwdm",
    title: "RWDM",
    kicker: "Football",
    sport: "football",
    intro: "Le RWDM, côté terrain et côté tribunes.",
  },
  {
    slug: "national-2",
    title: "National 2",
    kicker: "Hockey — National 2",
    sport: "hockey",
    intro: "Le hockey de club en National 2, au plus près des équipes.",
    children: [
      { slug: "wolvendael-h1", title: "Wolvendael H1", kicker: "National 2", intro: "L'équipe première messieurs du Wolvendael." },
      { slug: "woluwe-h1", title: "Woluwe H1", kicker: "National 2", intro: "L'équipe première messieurs de Woluwe." },
    ],
  },
  {
    slug: "daring",
    title: "Daring",
    kicker: "Hockey — Club",
    sport: "hockey",
    intro: "Le Daring à travers ses équipes : premières, dames et jeunes.",
    children: [
      { slug: "messieurs-1", title: "Messieurs 1", kicker: "Daring", intro: "L'équipe première messieurs du Daring." },
      { slug: "dames-1", title: "Dames 1", kicker: "Daring", intro: "L'équipe première dames du Daring." },
      { slug: "u19b1", title: "U19B1", kicker: "Daring", intro: "Les U19B1 du Daring." },
    ],
  },
];
