import type { Metadata } from "next";
import { MatchCard } from "@/components/albums/MatchCard";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { PhotoAccessBand } from "@/components/sections/PhotoAccessBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getAlbums } from "@/lib/albums";
import { absoluteUrl, inArea, pageMetadata } from "@/lib/seo";
import type { Album } from "@/lib/types";
import { pad } from "@/lib/utils";

const PATH = "/matchs";

export const metadata: Metadata = pageMetadata({
  title: "Calendrier des matchs photographiés",
  description: `Tous les matchs photographiés, par année et par mois : hockey sur gazon, football et rugby. Ouvrez une date, retrouvez toutes les photos de la rencontre. Photographe sportif${inArea}.`,
  path: PATH,
});

type Month = { key: string; label: string; albums: Album[] };
type Year = { year: string; months: Month[]; count: number };

const monthName = (key: string) => {
  const label = new Intl.DateTimeFormat("fr-BE", { month: "long", timeZone: "UTC" }).format(new Date(`${key}-15T12:00:00Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Albums (déjà triés du plus récent au plus ancien) → années → mois. */
function calendar(albums: Album[]): Year[] {
  const years: Year[] = [];
  for (const album of albums) {
    const year = album.date.slice(0, 4);
    const key = album.date.slice(0, 7);
    let y = years.find((entry) => entry.year === year);
    if (!y) years.push((y = { year, months: [], count: 0 }));
    let m = y.months.find((entry) => entry.key === key);
    if (!m) y.months.push((m = { key, label: monthName(key), albums: [] }));
    m.albums.push(album);
    y.count += 1;
  }
  return years;
}

/**
 * Calendrier : tous les matchs, par année puis par mois, chacun avec sa photo
 * de couverture, sa date, sa catégorie et son nombre de photos. Les dossiers
 * étant nommés par date, c'est l'entrée naturelle pour retrouver « le match du 23 mai ».
 */
export default function MatchesPage() {
  const albums = getAlbums();
  const years = calendar(albums);
  const photos = albums.reduce((n, a) => n + a.photos.length, 0);
  let rank = 0;

  return (
    <>
      <PageIntro
        crumbs={[{ name: "Matchs", path: PATH }]}
        kicker={`Calendrier · ${years.map((y) => y.year).join(" · ")}`}
        title="Matchs"
        intro={<p>Tous les matchs photographiés, du plus récent au plus ancien. Choisissez une date : la galerie complète vous attend.</p>}
        aside={
          <MetaList
            items={[
              { label: "Matchs", value: pad(albums.length) },
              { label: "Mois", value: pad(years.reduce((n, y) => n + y.months.length, 0)) },
              { label: "Photos", value: photos },
            ]}
          />
        }
      />

      {/* Accès direct à un mois */}
      <nav aria-label="Aller au mois" className="sticky-below-header z-20 border-y border-line bg-ink/85 backdrop-blur-xl">
        <ol className="container-wide flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {years.flatMap((y) =>
            y.months.map((m, i) => (
              <li key={m.key} className="shrink-0">
                <a href={`#mois-${m.key}`} className="flex h-9 items-center gap-2 rounded-full border border-line px-4 text-[0.8125rem] text-linen/90 transition-colors hover:border-flamingo hover:text-linen">
                  {i === 0 ? <span className="font-mono text-[0.6875rem] text-flamingo">{y.year}</span> : null}
                  {m.label}
                  <span className="font-mono text-[0.6875rem] text-ash">{m.albums.length}</span>
                </a>
              </li>
            )),
          )}
        </ol>
      </nav>

      <div className="container-wide space-y-[var(--section-space-sm)] pt-[clamp(2.5rem,5vw,4.5rem)] pb-[var(--section-space)]">
        {years.map((y) => (
          <section key={y.year} aria-labelledby={`annee-${y.year}`}>
            <h2 id={`annee-${y.year}`} className="font-display text-[clamp(3.5rem,2rem+7vw,9rem)] leading-[0.85] font-extrabold tracking-[-0.03em] text-linen/90 [font-stretch:125%]">
              {y.year}
              <span className="ml-4 align-middle t-mono text-ash">{y.count} matchs</span>
            </h2>

            {y.months.map((m) => (
              <section key={m.key} id={`mois-${m.key}`} aria-labelledby={`mois-${m.key}-titre`} className="mt-[clamp(2.5rem,4vw,4rem)] scroll-mt-[calc(var(--header-height)+5rem)]">
                <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <h3 id={`mois-${m.key}-titre`} className="text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-light tracking-[-0.03em] text-linen">
                    {m.label} <span className="text-taupe">{y.year}</span>
                  </h3>
                  <p className="t-mono text-ash">
                    {m.albums.length} match{m.albums.length > 1 ? "s" : ""}
                  </p>
                </div>
                <ul className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {m.albums.map((album) => (
                    <li key={album.href} data-reveal>
                      <MatchCard album={album} headingLevel="h4" priority={rank++ < 2} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </section>
        ))}
      </div>

      <PhotoAccessBand />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Calendrier des matchs — ${siteConfig.name}`,
          url: absoluteUrl(PATH),
          inLanguage: siteConfig.language,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: albums.length,
            itemListElement: albums.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.title, url: absoluteUrl(a.href) })),
          },
        }}
      />
    </>
  );
}
