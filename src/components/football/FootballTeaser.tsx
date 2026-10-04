import { ArrowLink } from "@/components/ui/Button";
import { SectionStamp } from "@/components/ui/SectionLabel";
import type { Project } from "@/lib/types";
import { ArchiveRow, LatestMatch } from "./MatchCards";

/** Accueil : le football en évidence — le dernier matchday et les reportages récents. */
export function FootballTeaser({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;
  const [latest, ...others] = [...projects.filter((p) => p.match), ...projects.filter((p) => !p.match)];
  return (
    <section aria-labelledby="football-title" className="container-wide pb-[var(--section-space)]">
      <SectionStamp id="football-title" meta="Matchday">
        Football
      </SectionStamp>
      <div className="mt-8 mb-10 flex flex-col gap-6 md:mt-10 md:mb-14 md:flex-row md:items-end md:justify-between">
        <p className="max-w-xl t-lead text-taupe" data-reveal>
          Chaque match raconté comme une histoire : l&apos;avant-match, l&apos;action, les tribunes, les coulisses, le coup de sifflet final.
        </p>
        <ArrowLink href="/football">Toute l&apos;archive football</ArrowLink>
      </div>
      <div data-reveal>
        <LatestMatch project={latest} />
      </div>
      {others.length ? (
        <ul className="mt-8 border-t border-line">
          {others.slice(0, 3).map((p) => (
            <li key={p.slug} className="border-b border-line">
              <ArchiveRow project={p} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
