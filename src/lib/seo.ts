import type { Metadata } from "next";
import { getSocialLinks, siteConfig } from "@/config/site";
import { services } from "@/data/services";
import { categoryContext, SPORT_LABEL } from "@/lib/albums";
import { fallbackPath, isLocalPhoto } from "@/lib/photo-sources";
import type { Album, Category, Photo } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/* --------------------------------------------------------------- textes */

const area = siteConfig.seo.area.trim();

/** « à Bruxelles » si une zone est configurée, sinon rien. */
export const inArea = area ? ` à ${area}` : "";

/** Titre principal du site (page d'accueil). */
export const homeTitle = `Photographe sportif${inArea} — hockey, rugby & football`;

export function sportLabel(category: Category) {
  return SPORT_LABEL[category.sport];
}

/* ------------------------------------------------------------- metadata */

type PageMeta = {
  /** Titre court de la page — devient « Titre | Nom du site ». */
  title: string;
  description?: string;
  /** Chemin canonique, ex. "/albums/daring-h1". */
  path: string;
  noIndex?: boolean;
  /** Image de partage propre à la page (sinon celle du fichier opengraph-image le plus proche). */
  image?: { url: string; alt: string };
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
export function pageMetadata({ title, description = siteConfig.description, path, noIndex, image }: PageMeta): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const desc = clampDescription(description);
  // Toujours une image de partage : sinon une page qui définit son `openGraph` perd celle du site.
  const shared = image ?? { url: "/opengraph-image.png", alt: `${siteConfig.name} — ${siteConfig.tagline}` };
  const images = [{ url: absoluteUrl(shared.url), width: 1200, height: 630, alt: shared.alt, type: "image/png" }];
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
      images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc, images },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large" },
  };
}

/**
 * URL absolue d'une page ou d'un fichier. Les pages prennent un « / » final
 * (le site est exporté en dossiers : /albums/rugby/index.html).
 */
export function absoluteUrl(path: string) {
  const raw = path.startsWith("/") ? path : `/${path}`;
  const [, pathname = "/", suffix = ""] = raw.match(/^([^?#]*)(.*)$/) ?? [];
  const isFile = /\.[a-z0-9]+$/i.test(pathname);
  const clean = !isFile && !pathname.endsWith("/") ? `${pathname}/` : pathname;
  return `${siteConfig.url}${clean}${suffix}`;
}

/** Image de partage d'une page d'albums : « /albums/daring-h1 » → « /og/albums/daring-h1.png » (src/app/og/). */
export function ogImageHref(href: string) {
  return `/og${href.replace(/\/$/, "")}.png`;
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

/**
 * URL d'une photo pour Google Images et le sitemap : le JPEG haute qualité
 * quand la galerie est téléchargeable, sinon la plus grande version WebP.
 */
export function photoUrl(photo: Photo) {
  if (photo.src.startsWith("http")) return photo.src;
  if (photo.download) return absoluteUrl(photo.download.url);
  return absoluteUrl(isLocalPhoto(photo.src) ? fallbackPath(photo) : photo.src);
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

/** Page d'une catégorie : la liste de ses albums (et leurs photos, s'il y en a). */
export function collectionJsonLd(category: Category, albums: Album[]) {
  const photos = albums.flatMap((a) => a.photos).filter((p) => !p.credit);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.fullTitle} — albums photo ${sportLabel(category)}`,
    description: categorySummary(category),
    url: absoluteUrl(category.href),
    inLanguage: siteConfig.language,
    isPartOf: { "@id": WEBSITE_ID() },
    about: { "@type": "Thing", name: category.fullTitle },
    ...(category.cover && !category.cover.credit ? { primaryImageOfPage: imageObjectJsonLd(category.cover) } : {}),
    mainEntity: {
      "@type": "ItemList",
      name: `Albums ${category.fullTitle}`,
      numberOfItems: albums.length,
      itemListElement: albums.map((album, i) => ({ "@type": "ListItem", position: i + 1, name: `${album.title} — ${formatDate(album.date)}`, url: absoluteUrl(album.href) })),
    },
    ...(photos.length ? { image: photos.slice(0, 30).map((photo) => imageObjectJsonLd(photo)) } : {}),
  };
}

/** Page d'un album : la galerie de photos et, pour un match, l'événement sportif. */
export function albumJsonLd(album: Album) {
  const photos = album.photos.filter((p) => !p.credit);
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${album.title} — photos du match`,
    description: albumDescription(album),
    url: absoluteUrl(album.href),
    inLanguage: siteConfig.language,
    isPartOf: { "@id": WEBSITE_ID() },
    author: { "@id": BUSINESS_ID() },
    datePublished: album.date,
    ...(album.location ? { contentLocation: { "@type": "Place", name: album.location } } : {}),
    ...(photos.length ? { image: photos.map((photo) => imageObjectJsonLd(photo, photo.alt)) } : {}),
    about: sportsEventJsonLd(album),
  };
}

/**
 * Le match photographié (schema.org SportsEvent). Seules les données connues
 * sont déclarées : équipes (sans présumer qui reçoit), date, lieu, compétition.
 */
function sportsEventJsonLd(album: Album) {
  const sport = { football: "Football", hockey: "Hockey sur gazon", rugby: "Rugby" }[album.category.sport];
  const match = album.match;
  const competition = match?.competition ?? (album.category.parent ? categoryContext(album.category) : null);
  return {
    "@type": "SportsEvent",
    name: match ? `${match.home} – ${match.away}` : album.title,
    sport,
    startDate: album.date,
    eventStatus: "https://schema.org/EventScheduled",
    ...(album.location ? { location: { "@type": "Place", name: album.location } } : {}),
    ...(competition ? { superEvent: { "@type": "SportsEvent", name: competition } } : {}),
    ...(match
      ? {
          competitor: [
            { "@type": "SportsTeam", name: match.home, sport },
            { "@type": "SportsTeam", name: match.away, sport },
          ],
        }
      : {}),
  };
}

/* ------------------------------------------------ catégories & albums */

/** « Daring H1 — albums photo hockey » · « FIH Pro League Femmes — albums photo hockey » */
export function categoryTitle(category: Category) {
  const short = { hockey: "hockey", rugby: "rugby", football: "football" }[category.sport];
  return `${category.fullTitle} — albums photo ${short}`;
}

/** Phrase factuelle décrivant une catégorie (metadata + texte de page) — uniquement des données réelles. */
export function categorySummary(category: Category) {
  const n = category.albumCount;
  const matches = `${n} match${n > 1 ? "s" : ""} photographié${n > 1 ? "s" : ""}`;
  const sport = plainText(category.fullTitle).includes(plainText(sportLabel(category))) ? "" : ` en ${sportLabel(category)}`;
  const teams = category.children.length ? ` (${category.children.map((c) => c.title).join(" et ")})` : "";
  const photos = category.photoCount ? ` ${category.photoCount} photos en ligne.` : "";
  return `${category.fullTitle} : ${matches}${sport}${teams}.${photos}`;
}

export function categoryDescription(category: Category) {
  return `Albums photo ${category.fullTitle} : chaque match en images, du plus récent au plus ancien. ${categorySummary(category)} Photographe sportif${inArea}.`;
}

/**
 * Titre SEO d'un album : « Daring H1 vs Leo H1 — Photos du match ».
 * La compétition est ajoutée quand le titre ne la contient pas
 * (« Belgique vs Pays-Bas · FIH Pro League Femmes — Photos du match »).
 */
export function albumTitle(album: Album) {
  const title = plainText(album.title);
  const crest = album.category.crest;
  const root = album.category.parent ? album.category.parent : album.category;
  const named = title.includes(plainText(root.title)) || (crest !== null && title.includes(plainText(crest.name.split(" ")[0])));
  return `${album.title}${named ? "" : ` · ${album.category.fullTitle}`} — Photos du match`;
}

/** Description factuelle d'un album : équipes, date, catégorie, lieu, nombre de photos. */
export function albumDescription(album: Album) {
  const count = album.photos.length;
  const photos = count ? `${count} photos` : "Photos à venir";
  const where = album.location ? ` à ${album.location}` : "";
  const context = categoryContext(album.category);
  const sport = plainText(`${album.title} ${context}`).includes(plainText(sportLabel(album.category))) ? "" : `, ${sportLabel(album.category)}`;
  return `${album.title}, ${formatDate(album.date)}${where} — ${context}${sport}. ${photos}. Photographe sportif${inArea}.`;
}

const plainText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
