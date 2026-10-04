import { services } from "@/data/services";
import { getCategories, getProjects } from "@/lib/portfolio";
import type { SearchItem } from "@/lib/search";
import type { Project } from "@/lib/types";
import { dateKeywords, formatDate } from "@/lib/utils";

const SPORT_LABEL = { hockey: "hockey sur gazon", rugby: "rugby", football: "football" } as const;

/** Tout ce qu'un visiteur peut taper pour retrouver une galerie. */
export function projectKeywords(project: Project) {
  const { category } = project;
  return [
    SPORT_LABEL[category.sport],
    category.parent?.title,
    category.title,
    category.kicker,
    project.event,
    ...(project.teams ?? []),
    project.location,
    dateKeywords(project.date),
  ]
    .filter(Boolean)
    .join(" ");
}

/** Index construit au build à partir des données (quelques Ko). Les galeries privées en sont exclues. */
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const project of getProjects()) {
    items.push({
      type: "Galerie",
      title: project.title,
      href: project.href,
      context: project.category.parent ? `${project.category.parent.title} · ${project.category.title}` : project.category.title,
      keywords: projectKeywords(project),
      thumb: { src: project.cover.src, color: project.cover.color },
      date: project.date ? formatDate(project.date) : undefined,
      count: project.photos.length,
    });
  }

  for (const category of getCategories()) {
    items.push({
      type: "Catégorie",
      title: category.title,
      href: category.href,
      context: category.kicker,
      keywords: `${SPORT_LABEL[category.sport]} ${category.intro} ${category.children.map((c) => c.title).join(" ")}`,
      thumb: { src: category.cover.src, color: category.cover.color },
      count: category.photoCount,
    });
    for (const child of category.children) {
      items.push({
        type: "Équipe",
        title: child.title,
        href: child.href,
        context: category.title,
        keywords: `${SPORT_LABEL[category.sport]} ${child.intro}`,
        thumb: { src: child.cover.src, color: child.cover.color },
        count: child.photoCount,
      });
    }
  }

  for (const service of services) {
    items.push({
      type: "Service",
      title: service.title,
      href: `/services#${service.slug}`,
      context: service.format,
      keywords: `${service.description} ${service.deliverables.join(" ")} prestation devis tarif`,
    });
  }

  items.push(
    { type: "Page", title: "Galeries — accès aux photos", href: "/galeries", context: "Retrouver ses photos", keywords: "mes photos match récupérer télécharger code accès client" },
    { type: "Page", title: "Portfolio", href: "/portfolio", context: "Le travail, par catégorie", keywords: "galerie photos travail sélection" },
    { type: "Page", title: "À propos", href: "/about", context: "Le photographe", keywords: "about biographie approche valeurs matériel" },
    { type: "Page", title: "Services", href: "/services", context: "Prestations", keywords: "offres prestations devis" },
    { type: "Page", title: "Contact", href: "/contact", context: "Demande de devis", keywords: "email message devis réserver disponibilité" },
  );

  return items;
}
