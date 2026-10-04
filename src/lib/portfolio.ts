/**
 * Couche d'accès aux données du portfolio.
 * Les composants ne lisent jamais src/data directement : ils passent par ici.
 *
 * Vocabulaire : une « catégorie » regroupe des galeries (compétition, club,
 * équipe) ; une « galerie » (= projet / série) contient les photos d'un match
 * ou d'un événement.
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
      throw new Error(`Galerie « ${input.slug} » : catégorie inconnue « ${input.category} » (voir src/data/categories.ts).`);
    }
    if (input.private && !input.accessCode) {
      throw new Error(`Galerie privée « ${input.slug} » : ajoutez un accessCode (voir src/data/projects.ts).`);
    }
    const photos = getFolderPhotos(input.folder).map((photo) => withContextAlt(photo, category));
    return {
      ...input,
      href: `/galeries/${input.slug}`,
      category,
      photos,
      cover: photos[0] ?? EMPTY_PHOTO,
    };
  });
}

/**
 * Texte alternatif enrichi (accessibilité + Google Images) : pour vos photos,
 * l'équipe et la compétition sont ajoutées si elles n'y figurent pas déjà.
 * Ex. « Mêlée en touche » → « Mêlée en touche — Rugby ».
 */
function withContextAlt(photo: Photo, category: Category): Photo {
  if (photo.credit) return photo; // photos temporaires : texte d'origine
  const context = category.parent ? `${category.title}, ${category.parent.title}` : category.title;
  const plain = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (plain(photo.alt).includes(plain(category.title))) return photo;
  return { ...photo, alt: `${photo.alt} — ${context}` };
}

/** Plus récentes d'abord ; les galeries sans date gardent l'ordre du fichier, après les datées. */
function byDateDesc(a: Project, b: Project) {
  if (a.date && b.date) return b.date.localeCompare(a.date);
  if (a.date) return -1;
  if (b.date) return 1;
  return 0;
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
/** Galeries visibles publiquement (listes, recherche, plan du site), les plus récentes d'abord. */
const publicProjects = projects.filter((p) => !p.private).sort(byDateDesc);

for (const project of publicProjects) {
  const key = project.category.path.join("/");
  projectsByCategoryPath.set(key, [...(projectsByCategoryPath.get(key) ?? []), project]);
}

// Couverture + compteur, une fois les galeries connues.
// Une catégorie parente prend la couverture de sa dernière équipe,
// pour ne pas répéter celle de la première tuile.
for (const category of allCategories) {
  const photos = getCategoryPhotos(category);
  const source = category.children.length ? getCategoryPhotos(category.children.at(-1)!) : photos;
  category.cover = source[0] ?? photos[0] ?? EMPTY_PHOTO;
  category.photoCount = photos.length;
}

// ------------------------------------------------------------------ public

/** Catégories principales, avec leurs sous-catégories. */
export function getCategories(): Category[] {
  return categories;
}

export function getCategoryByPath(path: string[]): Category | undefined {
  return categoryByPath.get(path.join("/"));
}

export function getAllCategoryPaths(): string[][] {
  return allCategories.map((c) => c.path);
}

/** Galeries publiques, les plus récentes d'abord. */
export function getProjects(): Project[] {
  return publicProjects;
}

/** Toutes les galeries, privées comprises (génération des pages uniquement). */
export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Galeries publiques d'une catégorie, sous-catégories comprises. */
export function getCategoryProjects(category: Category): Project[] {
  const own = projectsByCategoryPath.get(category.path.join("/")) ?? [];
  return [...own, ...category.children.flatMap(getCategoryProjects)].sort(byDateDesc);
}

export function getCategoryPhotos(category: Category): Photo[] {
  return getCategoryProjects(category).flatMap((p) => p.photos);
}

export function getFeaturedProjects(): Project[] {
  return publicProjects.filter((p) => p.featured);
}

/** Dossiers de photos hors portfolio (page À propos, etc.). */
const SITE_FOLDERS = ["site/about"];

/** Une photo par identifiant, sinon `fallback` ou la première du portfolio. */
export function getPhotoById(id: string, fallback?: Photo): Photo {
  const pool = [...publicProjects.flatMap((p) => p.photos), ...SITE_FOLDERS.flatMap(getFolderPhotos)];
  return pool.find((p) => p.id === id) ?? fallback ?? publicProjects.find((p) => p.photos.length)?.cover ?? EMPTY_PHOTO;
}

/** Catégorie voisine, pour inviter à poursuivre la visite. */
export function getNextCategory(category: Category): Category {
  const siblings = category.parent ? category.parent.children : categories;
  const index = siblings.findIndex((c) => c.href === category.href);
  if (category.parent && index === siblings.length - 1) return getNextCategory(category.parent);
  return siblings[(index + 1) % siblings.length];
}

/** Galeries voisines (publiques) — une galerie privée renvoie vers les plus récentes. */
export function getAdjacentProjects(project: Project) {
  const index = publicProjects.findIndex((p) => p.slug === project.slug);
  const count = publicProjects.length;
  if (index === -1) return { previous: publicProjects[count - 1], next: publicProjects[0] };
  return {
    previous: publicProjects[(index - 1 + count) % count],
    next: publicProjects[(index + 1) % count],
  };
}

/** Fil d'Ariane d'une catégorie (de la racine à elle-même). */
export function getCategoryTrail(category: Category): Category[] {
  return category.parent ? [...getCategoryTrail(category.parent), category] : [category];
}

/** « FIH Pro League · Red Lions » */
export function categoryContext(category: Category) {
  return getCategoryTrail(category)
    .map((c) => c.title)
    .join(" · ");
}
