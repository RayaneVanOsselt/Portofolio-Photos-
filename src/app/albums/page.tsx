import type { Metadata } from "next";
import { AlbumTimeline } from "@/components/albums/AlbumRow";
import { CategoryCard } from "@/components/albums/CategoryCard";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PhotoAccessBand } from "@/components/sections/PhotoAccessBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowLink } from "@/components/ui/Button";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";
import { ALBUMS_HREF, getAlbums, getCategories } from "@/lib/albums";
import { absoluteUrl, inArea, pageMetadata } from "@/lib/seo";
import { pad } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Albums photo — hockey, football, rugby",
  description: `Tous les albums photo, par club et par compétition : ${getCategories()
    .map((c) => c.title)
    .join(", ")}. Chaque match en images, du plus récent au plus ancien. Photographe sportif${inArea}.`,
  path: ALBUMS_HREF,
});

/**
 * Albums : Club / Compétition → Match → Photos.
 * Les catégories d'abord (un logo, un nom, le dernier match), puis les derniers
 * matchs ; au-delà de RECENT, le reste est dans le calendrier (/matchs), classé
 * par année et par mois : la page garde la même longueur, quel que soit le nombre d'albums.
 */
const RECENT = 12;

export default function AlbumsPage() {
  const categories = getCategories();
  const albums = getAlbums();
  const photos = albums.reduce((sum, a) => sum + a.photos.length, 0);
  const recent = albums.slice(0, RECENT);
  const more = albums.length > recent.length;

  return (
    <>
      <PageIntro
        crumbs={[{ name: "Albums", path: ALBUMS_HREF }]}
        kicker="Hockey · Football · Rugby"
        title="Albums"
        intro={<p>Choisissez un club ou une compétition, puis un match : toutes les photos de la rencontre vous attendent.</p>}
        aside={
          <MetaList
            items={[
              { label: "Catégories", value: pad(categories.length) },
              { label: "Albums", value: pad(albums.length) },
              { label: "Photos", value: photos },
            ]}
          />
        }
      />

      <section aria-labelledby="categories-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="categories-title" index="01" meta={`${categories.length} catégories`} className="mb-10 md:mb-14">
          Clubs & compétitions
        </SectionStamp>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {categories.map((category) => (
            <li key={category.href}>
              <CategoryCard category={category} headingLevel="h3" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="matches-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="matches-title" index="02" meta={more ? `${recent.length} sur ${albums.length} albums · du plus récent au plus ancien` : `${albums.length} albums · du plus récent au plus ancien`}>
          {more ? "Derniers matchs" : "Tous les matchs"}
        </SectionStamp>
        <div className="mt-10 md:mt-14">
          <AlbumTimeline albums={recent} />
        </div>
        {more ? (
          <div className="mt-10 border-t border-line pt-6 md:mt-14">
            <ArrowLink href="/matchs">Tous les {albums.length} matchs, par année et par mois</ArrowLink>
          </div>
        ) : null}
      </section>

      <PhotoAccessBand />
      <ClosingCta />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Albums photo — ${siteConfig.name}`,
          url: absoluteUrl(ALBUMS_HREF),
          inLanguage: siteConfig.language,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: categories.length,
            itemListElement: categories.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: absoluteUrl(c.href) })),
          },
        }}
      />
    </>
  );
}
