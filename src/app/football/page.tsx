import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { AlbumTimeline } from "@/components/albums/AlbumRow";
import { LatestAlbum } from "@/components/albums/LatestAlbum";
import { PitchLines } from "@/components/football/PitchLines";
import { GalleryFinder } from "@/components/galleries/GalleryFinder";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { SectionLabel, SectionStamp } from "@/components/ui/SectionLabel";
import { getCategories, getSportAlbums, teamShort } from "@/lib/albums";
import { getGalleryEntries } from "@/lib/gallery-index";
import { inArea, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Photographe football${inArea} — matchs, clubs, saisons`,
  description: `Reportages de football : matchs, équipes, supporters, coulisses. Chaque match en images — retrouvez vos photos par équipe ou par date.`,
  path: "/football",
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** L'archive football : le dernier match, la recherche, puis tous les matchs par mois. */
export default function FootballPage() {
  const albums = getSportAlbums("football");
  const latest = albums[0];
  const footballRoots = new Set(getCategories().filter((c) => c.sport === "football").map((c) => c.slug));
  const entries = getGalleryEntries().filter((e) => footballRoots.has(e.root));
  const filters = getCategories()
    .filter((c) => footballRoots.has(c.slug))
    .map((c) => ({ slug: c.slug, title: c.title, count: entries.filter((e) => e.root === c.slug).length }));
  const suggestions = [...new Set(albums.flatMap((a) => (a.match ? [teamShort(a, "home"), teamShort(a, "away")] : (a.teams ?? []))))].slice(0, 6);

  return (
    <>
      <header className="relative isolate overflow-hidden">
        <PitchLines className="pointer-events-none absolute top-[var(--header-height)] right-[-18%] -z-10 hidden h-[90%] w-[70%] text-linen/[0.06] md:block" />
        <div className="container-wide page-top pb-[clamp(2rem,4vw,3.5rem)]">
          <Breadcrumbs items={[{ name: "Football", path: "/football" }]} />
          <div className="anim-rise mt-8 md:mt-10" style={delay(120)}>
            <SectionLabel>Photographie de football</SectionLabel>
          </div>
          <h1 className="t-display mt-6 text-linen">
            <span className="line-mask">
              <span style={delay(180)}>Football</span>
            </span>
          </h1>
          <p className="anim-rise mt-8 max-w-2xl t-lead text-taupe" style={delay(380)}>
            Matchs, équipes, supporters et coulisses. Chaque rencontre racontée en images — de l&apos;avant-match au coup de sifflet final.
          </p>
        </div>
      </header>

      {latest ? (
        <section aria-label="Dernier match" className="container-wide">
          <LatestAlbum album={latest} priority />
        </section>
      ) : null}

      <section aria-labelledby="find-title" className="container-wide section-sm">
        <SectionStamp id="find-title" index="01" meta={`${entries.length} album${entries.length > 1 ? "s" : ""}`} className="mb-10 md:mb-14">
          Votre match
        </SectionStamp>
        <GalleryFinder entries={entries} filters={filters} suggestions={suggestions} />
      </section>

      <section aria-labelledby="archive-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="archive-title" index="02" meta="Du plus récent au plus ancien">
          Archive
        </SectionStamp>
        <div className="mt-10 md:mt-14">
          <AlbumTimeline albums={albums} />
        </div>
      </section>

      <ClosingCta stamp="Clubs & équipes" title="Votre prochain *matchday* ?" body="Couverture de match, contenus pour le club, portraits d'équipe : parlons de votre saison." />
    </>
  );
}
