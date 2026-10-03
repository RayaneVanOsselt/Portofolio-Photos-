import { services } from "@/data/services";
import { getCategories, getProjects } from "@/lib/portfolio";
import type { SearchItem } from "@/lib/search";

const SPORT_LABEL = { hockey: "hockey sur gazon", rugby: "rugby", football: "football" } as const;

/** Index construit côté serveur à partir des données (quelques Ko). */
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const category of getCategories()) {
    items.push({
      type: "Rubrique",
      title: category.title,
      href: category.href,
      context: category.kicker,
      keywords: `${SPORT_LABEL[category.sport]} ${category.intro} ${category.children.map((c) => c.title).join(" ")}`,
      thumb: { src: category.cover.src, color: category.cover.color },
    });
    for (const child of category.children) {
      items.push({
        type: "Équipe",
        title: child.title,
        href: child.href,
        context: category.title,
        keywords: `${SPORT_LABEL[category.sport]} ${child.intro}`,
        thumb: { src: child.cover.src, color: child.cover.color },
      });
    }
  }

  for (const project of getProjects()) {
    items.push({
      type: "Série",
      title: project.title,
      href: project.href,
      context: project.category.parent ? `${project.category.parent.title} · ${project.category.title}` : project.category.title,
      keywords: `${SPORT_LABEL[project.category.sport]} ${project.location ?? ""} ${project.date ?? ""}`,
      thumb: { src: project.cover.src, color: project.cover.color },
    });
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
    { type: "Page", title: "Portfolio", href: "/portfolio", context: "Toutes les photos", keywords: "galerie photos travail" },
    { type: "Page", title: "À propos", href: "/about", context: "Le photographe", keywords: "about biographie approche valeurs" },
    { type: "Page", title: "Services", href: "/services", context: "Prestations", keywords: "offres prestations devis" },
    { type: "Page", title: "Contact", href: "/contact", context: "Demande de devis", keywords: "email message devis réserver disponibilité" },
  );

  return items;
}
