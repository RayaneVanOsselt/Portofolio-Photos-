import { services } from "@/data/services";
import { albumCrests, categoryContext, getAlbums, getAllCategories, SPORT_LABEL } from "@/lib/albums";
import type { SearchItem } from "@/lib/search";
import type { Album, Category } from "@/lib/types";
import { dateKeywords, formatDate } from "@/lib/utils";

/** Tout ce qu'un visiteur peut taper pour retrouver un album. */
export function albumKeywords(album: Album) {
  const { category } = album;
  return [
    SPORT_LABEL[category.sport],
    categoryContext(category),
    category.fullTitle,
    category.kicker,
    category.crest?.name,
    album.event,
    ...(album.teams ?? []),
    ...(album.match
      ? [album.match.home, album.match.away, album.match.homeShort, album.match.awayShort, album.match.competition, album.match.round, "match", album.match.score?.join("-")]
      : []),
    album.location,
    dateKeywords(album.date),
  ]
    .filter(Boolean)
    .join(" ");
}

/** Vignette : la couverture, sinon le logo du club ou de la compétition. */
function thumbOf(cover: Album["cover"], crest: Category["crest"]): SearchItem["thumb"] {
  if (cover) return { src: cover.src, color: cover.color };
  return crest ? { src: crest.src, logo: true } : undefined;
}

/** Index construit au build à partir des données (quelques Ko). Les albums privés en sont exclus. */
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const album of getAlbums()) {
    items.push({
      type: "Album",
      title: album.title,
      href: album.href,
      context: categoryContext(album.category),
      keywords: albumKeywords(album),
      thumb: thumbOf(album.cover, albumCrests(album)[0] ?? null),
      date: formatDate(album.date),
      count: album.photos.length,
    });
  }

  for (const category of getAllCategories()) {
    items.push({
      type: "Catégorie",
      title: category.fullTitle,
      href: category.href,
      context: category.parent ? category.parent.title : category.kicker,
      keywords: `${SPORT_LABEL[category.sport]} ${category.crest?.name ?? ""} ${category.children.map((c) => c.title).join(" ")} albums matchs`,
      thumb: thumbOf(category.cover, category.crest),
      count: category.photoCount,
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
    { type: "Page", title: "Albums", href: "/albums", context: "Tous les clubs, compétitions et matchs", keywords: "albums galeries photos matchs clubs compétitions portfolio" },
    { type: "Page", title: "Retrouver mes photos", href: "/galeries", context: "Recherche par équipe, match ou date", keywords: "mes photos match récupérer télécharger code accès client galeries" },
    { type: "Page", title: "Football — archive des matchs", href: "/football", context: "Matchs, clubs, saisons", keywords: "football foot soccer matchday archive matchs rwdm" },
    { type: "Page", title: "À propos", href: "/about", context: "Le photographe", keywords: "about biographie approche valeurs matériel" },
    { type: "Page", title: "Services", href: "/services", context: "Prestations", keywords: "offres prestations devis" },
    { type: "Page", title: "Contact", href: "/contact", context: "Demande de devis", keywords: "email message devis réserver disponibilité" },
  );

  return items;
}
