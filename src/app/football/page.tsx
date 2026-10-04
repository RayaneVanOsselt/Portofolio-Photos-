import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArchiveRow, LatestMatch } from "@/components/football/MatchCards";
import { PitchLines } from "@/components/football/PitchLines";
import { GalleryFinder } from "@/components/galleries/GalleryFinder";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { SectionLabel, SectionStamp } from "@/components/ui/SectionLabel";
import { getGalleryEntries } from "@/lib/gallery-index";
import { getCategories, getFootballProjects, teamShort } from "@/lib/portfolio";
import { inArea, pageMetadata } from "@/lib/seo";
import type { Project } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: `Photographe football${inArea} — matchs, clubs, jeunes`,
  description: `Reportages de football : matchs, derbys, équipes U23 et jeunes, supporters, coulisses. Chaque match raconté en chapitres — retrouvez vos photos par équipe ou par date.`,
  path: "/football",
});

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;
const monthName = (iso: string) => new Intl.DateTimeFormat("fr-BE", { month: "long", timeZone: "UTC" }).format(new Date(`${iso.slice(0, 7)}-15T12:00:00Z`));

/** L'archive football : le dernier matchday, la recherche, puis toutes les saisons. */
export default function FootballPage() {
  const projects = getFootballProjects();
  const latest = projects.find((p) => p.match) ?? projects[0];
  const footballRoots = new Set(getCategories().filter((c) => c.sport === "football").map((c) => c.slug));
  const entries = getGalleryEntries().filter((e) => footballRoots.has(e.root));
  const filters = getCategories()
    .filter((c) => footballRoots.has(c.slug))
    .map((c) => ({ slug: c.slug, title: c.title, count: entries.filter((e) => e.root === c.slug).length }));
  const suggestions = [...new Set(projects.flatMap((p) => (p.match ? [teamShort(p, "home"), teamShort(p, "away")] : (p.teams ?? []))))].slice(0, 6);

  // Archive : année → mois → reportages (les non datés à la fin).
  const years = new Map<string, Map<string, Project[]>>();
  const undated: Project[] = [];
  for (const p of projects) {
    if (!p.date) {
      undated.push(p);
      continue;
    }
    const year = p.date.slice(0, 4);
    const month = p.date.slice(0, 7);
    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year)!;
    months.set(month, [...(months.get(month) ?? []), p]);
  }

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
            Matchs, derbys, équipes de jeunes, supporters et coulisses. Chaque rencontre est racontée comme une histoire — de l&apos;avant-match au coup de sifflet final.
          </p>
        </div>
      </header>

      {latest ? <LatestMatch project={latest} priority /> : null}

      <section aria-labelledby="find-title" className="container-wide section-sm">
        <SectionStamp id="find-title" index="01" meta={`${entries.length} reportage${entries.length > 1 ? "s" : ""}`} className="mb-10 md:mb-14">
          Votre match
        </SectionStamp>
        <GalleryFinder entries={entries} filters={filters} suggestions={suggestions} />
      </section>

      <section aria-labelledby="archive-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="archive-title" index="02" meta="Par saison">
          Archive
        </SectionStamp>
        <div className="mt-10 space-y-16 md:mt-14">
          {[...years.entries()].map(([year, months]) => (
            <div key={year} className="grid gap-6 md:grid-cols-12">
              <h2 className="font-mono text-[clamp(1.5rem,1rem+1.6vw,2.5rem)] tracking-[0.12em] text-linen md:col-span-2">{year}</h2>
              <div className="space-y-10 md:col-span-10">
                {[...months.entries()].map(([month, items]) => (
                  <div key={month}>
                    <h3 className="t-mono text-flamingo">{monthName(month)}</h3>
                    <ul className="mt-3 border-t border-line">
                      {items.map((p) => (
                        <li key={p.slug} className="border-b border-line">
                          <ArchiveRow project={p} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {undated.length ? (
            <div className="grid gap-6 md:grid-cols-12">
              <h2 className="t-mono text-ash md:col-span-2">Sans date</h2>
              <ul className="border-t border-line md:col-span-10">
                {undated.map((p) => (
                  <li key={p.slug} className="border-b border-line">
                    <ArchiveRow project={p} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <ClosingCta stamp="Clubs & équipes" title="Votre prochain *matchday* ?" body="Couverture de match, contenus pour le club, portraits d'équipe : parlons de votre saison." />
    </>
  );
}
