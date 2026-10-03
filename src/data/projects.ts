/**
 * Projets (séries / reportages). Chaque projet est rattaché à une rubrique
 * et lit ses photos dans public/images/portfolio/<folder>/.
 *
 * Pour un nouveau match : créer le dossier, y déposer les photos,
 * lancer `npm run photos`, puis ajouter une entrée ci-dessous.
 *
 * Les textes entre crochets sont à compléter. `date` et `location`
 * restent à null tant qu'ils ne sont pas renseignés (rien n'est affiché).
 */
import type { ProjectInput } from "@/lib/types";

const TODO_DESCRIPTION = "[DESCRIPTION DE LA SÉRIE — match, adversaire, contexte]";

export const projectInputs: ProjectInput[] = [
  {
    slug: "red-lions-serie-01",
    title: "Red Lions — Série 01",
    category: "fih-pro-league/red-lions",
    folder: "portfolio/fih-pro-league/red-lions",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
    featured: true,
  },
  {
    slug: "red-panthers-serie-01",
    title: "Red Panthers — Série 01",
    category: "fih-pro-league/red-panthers",
    folder: "portfolio/fih-pro-league/red-panthers",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
    featured: true,
  },
  {
    slug: "pays-bas-serie-01",
    title: "Pays-Bas — Série 01",
    category: "fih-pro-league/pays-bas",
    folder: "portfolio/fih-pro-league/pays-bas",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
  },
  {
    slug: "dh-daring-serie-01",
    title: "Daring — DH Série 01",
    category: "dh-hommes/daring",
    folder: "portfolio/dh-hommes/daring",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
    featured: true,
  },
  {
    slug: "dh-leopold-serie-01",
    title: "Léopold — DH Série 01",
    category: "dh-hommes/leopold",
    folder: "portfolio/dh-hommes/leopold",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
  },
  {
    slug: "rugby-serie-01",
    title: "Rugby — Série 01",
    category: "rugby",
    folder: "portfolio/rugby",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
    featured: true,
  },
  {
    slug: "rwdm-serie-01",
    title: "RWDM — Série 01",
    category: "rwdm",
    folder: "portfolio/rwdm",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
    featured: true,
  },
  {
    slug: "wolvendael-h1-serie-01",
    title: "Wolvendael H1 — Série 01",
    category: "national-2/wolvendael-h1",
    folder: "portfolio/national-2/wolvendael-h1",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
  },
  {
    slug: "woluwe-h1-serie-01",
    title: "Woluwe H1 — Série 01",
    category: "national-2/woluwe-h1",
    folder: "portfolio/national-2/woluwe-h1",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
  },
  {
    slug: "daring-messieurs-1-serie-01",
    title: "Daring Messieurs 1 — Série 01",
    category: "daring/messieurs-1",
    folder: "portfolio/daring/messieurs-1",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
  },
  {
    slug: "daring-dames-1-serie-01",
    title: "Daring Dames 1 — Série 01",
    category: "daring/dames-1",
    folder: "portfolio/daring/dames-1",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
  },
  {
    slug: "daring-u19b1-serie-01",
    title: "Daring U19B1 — Série 01",
    category: "daring/u19b1",
    folder: "portfolio/daring/u19b1",
    description: TODO_DESCRIPTION,
    date: null,
    location: null,
  },
];
