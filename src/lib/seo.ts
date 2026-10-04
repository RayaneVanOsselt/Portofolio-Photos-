import type { Metadata } from "next";
import { getSocialLinks, siteConfig } from "@/config/site";
import { services } from "@/data/services";
import type { Category, Photo, Project } from "@/lib/types";

/* --------------------------------------------------------------- textes */

const area = siteConfig.seo.area.trim();

/** « à Bruxelles » si une zone est configurée, sinon rien. */
export const inArea = area ? ` à ${area}` : "";

/** Titre principal du site (page d'accueil). */
export const homeTitle = `Photographe sportif${inArea} — hockey, rugby & football`;

const SPORT_LABEL = { hockey: "hockey sur gazon", rugby: "rugby", football: "football" } as const;

export function sportLabel(category: Category) {
  return SPORT_LABEL[category.sport];
}

/* ------------------------------------------------------------- metadata */

type PageMeta = {
  /** Titre court de la page — devient « Titre | Nom du site ». */
  title: string;
  description?: string;
  /** Chemin canonique, ex. "/portfolio/rugby". */
  path: string;
  noIndex?: boolean;
};

/** Description limitée à ~160 caractères (ce que Google affiche), coupée proprement. */
function clampDescription(text: string, max = 158) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", max - 1))}…`;
}

/**
 * Metadata d'une page : title, description, canonical, Open Graph, Twitter/X.
 * Le mot-clé de la page vient en premier dans le titre (meilleur pour Google),
 * le nom du site en dernier. Les images sociales viennent des fichiers opengraph-image.
 */
export function pageMetadata({ title, description = siteConfig.description, path, noIndex }: PageMeta): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const desc = clampDescription(description);
  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path,
      title: fullTitle,
      description: desc,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
  };
}

/**
 * URL absolue d'une page ou d'un fichier. Les pages prennent un « / » final
 * (le site est exporté en dossiers : /portfolio/rugby/index.html).
 */
export function absoluteUrl(path: string) {
  const raw = path.startsWith("/") ? path : `/${path}`;
  const [, pathname = "/", suffix = ""] = raw.match(/^([^?#]*)(.*)$/) ?? [];
  const isFile = /\.[a-z0-9]+$/i.test(pathname);
  const clean = !isFile && !pathname.endsWith("/") ? `${pathname}/` : pathname;
  return `${siteConfig.url}${clean}${suffix}`;
}

/* ---------------------------------------------- données structurées */

const BUSINESS_ID = () => absoluteUrl("/#business");
const WEBSITE_ID = () => absoluteUrl("/#website");

/** Le site lui-même (nom affiché par Google dans les résultats). */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID(),
    name: siteConfig.name,
    alternateName: `${siteConfig.logo.primary} ${siteConfig.logo.secondary}`,
    url: absoluteUrl("/"),
    inLanguage: siteConfig.language,
    publisher: { "@id": BUSINESS_ID() },
  };
}

/** L'activité : photographe sportif, ses spécialités et ses prestations. */
export function businessJsonLd() {
  const { email, phone } = siteConfig.contact;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": BUSINESS_ID(),
    name: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/apple-icon.png"),
    image: absoluteUrl("/opengraph-image.png"),
    slogan: siteConfig.tagline,
    knowsAbout: ["Photographie sportive", "Hockey sur gazon", "Rugby", "Football", "Photographie de match", "Portrait d'équipe"],
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(area ? { areaServed: { "@type": "Place", name: area } } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Prestations photo",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.description, url: absoluteUrl(`/services/#${s.slug}`) },
      })),
    },
    sameAs: getSocialLinks().map((s) => s.href),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** URL du fichier image d'origine (pour Google Images et le sitemap). */
export function photoUrl(photo: Photo) {
  return photo.src.startsWith("http") ? photo.src : absoluteUrl(photo.src);
}

/**
 * Une photo pour Google Images. Vos propres photos reçoivent les informations
 * de licence (badge « Licence » dans Google Images, lien « Obtenir cette image »).
 * Les photos temporaires sont créditées à leur auteur, sans licence revendiquée.
 */
export function imageObjectJsonLd(photo: Photo, caption?: string) {
  const own = !photo.credit;
  return {
    "@type": "ImageObject",
    contentUrl: photoUrl(photo),
    width: photo.width,
    height: photo.height,
    caption: caption ?? photo.alt,
    description: photo.alt,
    ...(photo.exif?.date ? { dateCreated: photo.exif.date } : {}),
    creator: own ? { "@id": BUSINESS_ID() } : { "@type": "Person", name: photo.credit!.name, url: photo.credit!.url },
    ...(own
      ? {
          creditText: siteConfig.name,
          copyrightNotice: `© ${siteConfig.name}`,
          license: absoluteUrl("/legal/"),
          acquireLicensePage: absoluteUrl("/contact/?projet=demande-photo"),
        }
      : {}),
  };
}

/** Page de rubrique / équipe : une collection de photos. */
export function collectionJsonLd(category: Category, projects: Project[]) {
  const photos = projects.flatMap((p) => p.photos);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.title} — photos de ${sportLabel(category)}`,
    description: category.intro,
    url: absoluteUrl(category.href),
    inLanguage: siteConfig.language,
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@type": "Thing", name: category.parent ? `${category.title} (${category.parent.title})` : category.title },
    primaryImageOfPage: imageObjectJsonLd(category.cover),
    mainEntity: {
      "@type": "ImageGallery",
      name: category.title,
      numberOfItems: photos.length,
      image: photos.slice(0, 30).map((photo) => imageObjectJsonLd(photo)),
    },
  };
}

/** Page d'une série. */
export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: project.title,
    description: project.description,
    url: absoluteUrl(project.href),
    inLanguage: siteConfig.language,
    isPartOf: { "@id": WEBSITE_ID() },
    author: { "@id": BUSINESS_ID() },
    ...(project.date ? { dateCreated: project.date } : {}),
    ...(project.location ? { contentLocation: { "@type": "Place", name: project.location } } : {}),
    image: project.photos.map((photo) => imageObjectJsonLd(photo, `${project.title} — ${photo.alt}`)),
    ...(project.match ? { about: sportsEventJsonLd(project) } : {}),
  };
}

/** Le match photographié (schema.org SportsEvent) : équipes, date, stade, compétition. */
function sportsEventJsonLd(project: Project) {
  const match = project.match!;
  const sport = { football: "Football", hockey: "Hockey sur gazon", rugby: "Rugby" }[project.category.sport];
  return {
    "@type": "SportsEvent",
    name: `${match.home} – ${match.away}`,
    sport,
    ...(project.date ? { startDate: project.date } : {}),
    ...(project.location ? { location: { "@type": "Place", name: project.location } } : {}),
    ...(match.competition ? { superEvent: { "@type": "SportsEvent", name: match.competition } } : {}),
    homeTeam: { "@type": "SportsTeam", name: match.home, sport },
    awayTeam: { "@type": "SportsTeam", name: match.away, sport },
    competitor: [
      { "@type": "SportsTeam", name: match.home },
      { "@type": "SportsTeam", name: match.away },
    ],
  };
}

/* ------------------------------------------------ rubriques & séries */

/** « Red Lions (FIH Pro League) — photos de hockey sur gazon » */
export function categoryTitle(category: Category) {
  const name = category.parent ? `${category.title} (${category.parent.title})` : category.title;
  // Titre court (≈ 60 caractères max. avec le nom du site) : sport en version brève.
  const short = { hockey: "hockey", rugby: "rugby", football: "football" }[category.sport];
  return `${name} — photos ${short}`;
}

/** Phrase factuelle décrivant une rubrique (metadata + texte de page). */
export function categorySummary(category: Category, seriesCount: number) {
  const where = category.parent ? ` en ${category.parent.title}` : "";
  const teams = category.children.length ? `, ${category.children.length} équipes (${category.children.map((c) => c.title).join(", ")})` : "";
  const series = `${seriesCount} série${seriesCount > 1 ? "s" : ""}`;
  return `${category.title}${where} : ${category.photoCount} photos de ${sportLabel(category)}${teams}, ${series}.`;
}

export function categoryDescription(category: Category, seriesCount: number) {
  return `${categorySummary(category, seriesCount)} ${category.intro} Photographe sportif${inArea}.`;
}
