import type { Metadata } from "next";
import { getSocialLinks, siteConfig } from "@/config/site";

type PageMeta = {
  /** Titre court de la page — devient « Nom du site — Titre ». */
  title: string;
  description?: string;
  /** Chemin canonique, ex. "/portfolio/rugby". */
  path: string;
  noIndex?: boolean;
};

/**
 * Metadata d'une page : title, description, canonical, Open Graph, Twitter/X.
 * Les images sociales viennent des fichiers opengraph-image.tsx de chaque route.
 */
export function pageMetadata({ title, description = siteConfig.description, path, noIndex }: PageMeta): Metadata {
  const fullTitle = `${siteConfig.name} — ${title}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path,
      title: fullTitle,
      description,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Données structurées de l'activité (schema.org). */
export function businessJsonLd() {
  const { email, phone, location } = siteConfig.contact;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absoluteUrl("/#business"),
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: absoluteUrl("/brand/monogram-light.svg"),
    image: absoluteUrl("/opengraph-image"),
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(location ? { areaServed: location } : {}),
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
