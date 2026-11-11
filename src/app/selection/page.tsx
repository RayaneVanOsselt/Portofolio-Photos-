import type { Metadata } from "next";
import { Gallery } from "@/components/gallery/Gallery";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowLink } from "@/components/ui/Button";
import { CreditNote } from "@/components/ui/CreditNote";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";
import { categoryContext, getAlbums, getSelection, SPORT_NAME } from "@/lib/albums";
import { absoluteUrl, inArea, pageMetadata, photoUrl } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

const picks = getSelection();
const total = getAlbums().reduce((sum, a) => sum + a.photos.length, 0);

export const metadata: Metadata = pageMetadata({
  title: `Sélection — les meilleures photos de sport${inArea}`,
  description: `${picks.length} photos choisies parmi plus de ${Math.floor(total / 50) * 50} : FIH Pro League, hockey, football et rugby. Le meilleur de ${siteConfig.name}, photographe sportif${inArea}.`,
  path: "/selection",
});

/**
 * Sélection : les 20 à 30 meilleures photos du site (src/data/selection.ts), en
 * composition éditoriale ; chaque photo s'ouvre en plein écran et mène à son album.
 */
export default function SelectionPage() {
  const albums = [...new Set(picks.map((p) => p.album))];
  const sports = [...new Set(albums.map((a) => SPORT_NAME[a.category.sport]))];

  return (
    <>
      <PageIntro
        crumbs={[{ name: "Sélection", path: "/selection" }]}
        kicker={`Sélection · ${sports.join(" · ")}`}
        title="Le meilleur *du terrain.*"
        intro={
          <p>
            {picks.length} images choisies parmi les {total} photos du site : la FIH Pro League, le championnat de Belgique de hockey, le football et le rugby. Les instants qui résument ma façon de voir le sport.
          </p>
        }
        aside={
          <MetaList
            items={[
              { label: "Photos", value: picks.length },
              { label: "Matchs", value: albums.length },
              { label: "Sports", value: sports.length },
            ]}
          />
        }
      />

      <section aria-labelledby="selection-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="selection-title" meta="Cliquez sur une photo pour l'ouvrir en plein écran">
          La sélection
        </SectionStamp>
        <CreditNote className="mt-6" />
        <div className="mt-10 md:mt-14">
          <Gallery
            id="selection"
            items={picks.map(({ photo, album }) => ({ photo, title: album.title, context: `${categoryContext(album.category)} · ${formatDate(album.date)}` }))}
            label="Sélection — les meilleures photos"
            priorityCount={2}
            defaultView="editorial"
            toolbar
          />
        </div>
        <div className="mt-[clamp(3rem,6vw,5rem)] flex flex-wrap items-center justify-between gap-6 border-t border-line pt-6">
          <p className="t-small text-taupe">Envie de voir le reste du match ? Chaque photo vient d&apos;un album complet.</p>
          <ArrowLink href="/albums">Tous les albums</ArrowLink>
        </div>
      </section>

      <ClosingCta title="Une saison à *raconter* ?" body="Matchs, portraits d'équipe, contenus pour le club : parlons de votre projet." />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: `Sélection — ${siteConfig.name}`,
          url: absoluteUrl("/selection"),
          inLanguage: siteConfig.language,
          numberOfItems: picks.length,
          image: picks.map(({ photo }) => photoUrl(photo)),
        }}
      />
    </>
  );
}
