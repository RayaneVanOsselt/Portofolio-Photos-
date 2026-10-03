/**
 * Couche d'accès aux données du portfolio.
 * Les composants ne lisent jamais src/data directement : ils passent par ici.
 */
import { categoryTree } from "@/data/categories";
import { getFolderPhotos } from "@/data/photos";
import { projectInputs } from "@/data/projects";
import type { Category, CategoryInput, Photo, Project } from "@/lib/types";

const EMPTY_PHOTO: Photo = { id: "empty", src: "/brand/monogram-light.svg", width: 64, height: 64, alt: "" };

// ---------------------------------------------------------------- projects

const projectsByCategoryPath = new Map<string, Project[]>();

function buildProjects(categoryByPath: Map<string, Category>): Project[] {
  return projectInputs.map((input) => {
    const category = categoryByPath.get(input.category);
    if (!category) {
      throw new Error(`Projet « ${input.slug} » : catégorie inconnue « ${input.category} » (voir src/data/categories.ts).`);
    }
    const photos = getFolderPhotos(input.folder);
    return {
      ...input,
      href: `/project/${input.slug}`,
      category,
      photos,
      cover: photos[0] ?? EMPTY_PHOTO,
    };
  });
}

// -------------------------------------------------------------- categories

function resolveCategory(input: CategoryInput | Omit<CategoryInput, "children" | "sport">, sport: Category["sport"], parent?: Category): Category {
  const path = parent ? [...parent.path, input.slug] : [input.slug];
  const category: Category = {
    slug: input.slug,
    title: input.title,
    kicker: input.kicker,
    intro: input.intro,
    sport,
    path,
    href: `/portfolio/${path.join("/")}`,
    parent,
    children: [],
    cover: EMPTY_PHOTO,
    photoCount: 0,
  };
  if ("children" in input && input.children) {
    category.children = input.children.map((child) => resolveCategory(child, sport, category));
  }
  return category;
}

const categories = categoryTree.map((input) => resolveCategory(input, input.sport));
const allCategories = categories.flatMap((c) => [c, ...c.children]);
const categoryByPath = new Map(allCategories.map((c) => [c.path.join("/"), c]));
const projects = buildProjects(categoryByPath);

for (const project of projects) {
  const key = project.category.path.join("/");
  projectsByCategoryPath.set(key, [...(projectsByCategoryPath.get(key) ?? []), project]);
}

// Couverture + compteur, une fois les projets connus.
// Une rubrique parente prend la couverture de sa dernière équipe,
// pour ne pas répéter celle de la première tuile.
for (const category of allCategories) {
  const photos = getCategoryPhotos(category);
  const source = category.children.length ? getCategoryPhotos(category.children.at(-1)!) : photos;
  category.cover = source[0] ?? photos[0] ?? EMPTY_PHOTO;
  category.photoCount = photos.length;
}

// ------------------------------------------------------------------ public

/** Rubriques principales, avec leurs sous-rubriques. */
export function getCategories(): Category[] {
  return categories;
}

export function getCategoryByPath(path: string[]): Category | undefined {
  return categoryByPath.get(path.join("/"));
}

export function getAllCategoryPaths(): string[][] {
  return allCategories.map((c) => c.path);
}

export function getProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Projets d'une catégorie, sous-rubriques comprises. */
export function getCategoryProjects(category: Category): Project[] {
  const own = projectsByCategoryPath.get(category.path.join("/")) ?? [];
  return [...own, ...category.children.flatMap(getCategoryProjects)];
}

export function getCategoryPhotos(category: Category): Photo[] {
  return getCategoryProjects(category).flatMap((p) => p.photos);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

/** Toutes les photos, chacune avec son projet (pour le filtre du portfolio). */
export function getAllPhotoEntries() {
  return projects.flatMap((project) =>
    project.photos.map((photo) => ({ photo, project, rootSlug: project.category.path[0] })),
  );
}

/** Dossiers de photos hors portfolio (page À propos, etc.). */
const SITE_FOLDERS = ["site/about"];

/** Une photo par identifiant, sinon `fallback` ou la première du portfolio. */
export function getPhotoById(id: string, fallback?: Photo): Photo {
  const pool = [...projects.flatMap((p) => p.photos), ...SITE_FOLDERS.flatMap(getFolderPhotos)];
  return pool.find((p) => p.id === id) ?? fallback ?? projects.find((p) => p.photos.length)?.cover ?? EMPTY_PHOTO;
}

/** Photos d'un dossier du site (ex. "site/about"), dans l'ordre des fichiers. */
export function getSitePhotos(folder: (typeof SITE_FOLDERS)[number]): Photo[] {
  return getFolderPhotos(folder);
}

/** Rubrique voisine, pour inviter à poursuivre la visite. */
export function getNextCategory(category: Category): Category {
  const siblings = category.parent ? category.parent.children : categories;
  const index = siblings.findIndex((c) => c.href === category.href);
  if (category.parent && index === siblings.length - 1) return getNextCategory(category.parent);
  return siblings[(index + 1) % siblings.length];
}

export function getAdjacentProjects(project: Project) {
  const index = projects.findIndex((p) => p.slug === project.slug);
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}

/** Fil d'Ariane d'une catégorie (de la racine à elle-même). */
export function getCategoryTrail(category: Category): Category[] {
  return category.parent ? [...getCategoryTrail(category.parent), category] : [category];
}
