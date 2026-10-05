import type { CSSProperties } from "react";
import { ArrowLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionStamp } from "@/components/ui/SectionLabel";
import type { Photo } from "@/lib/types";

/** Le photographe, en bref : portrait, présentation, spécialités. */
export function AboutTeaser({ portrait, intro, specialties }: { portrait: Photo | null; intro: string; specialties: string[] }) {
  return (
    <section aria-labelledby="about-teaser-title" className="container-site section">
      <SectionStamp index="04" meta="À propos">
        Le photographe
      </SectionStamp>
      <div className="mt-12 grid items-end gap-12 md:mt-16 md:grid-cols-12">
        <div className="md:col-span-5" data-reveal="image">
          {portrait ? <PhotoImage photo={portrait} fill sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] rounded-[var(--radius-card)]" /> : null}
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pb-4">
          <h2 id="about-teaser-title" className="t-h2 text-linen" data-reveal>
            Au bord du terrain, <span className="text-taupe">là où le match se joue.</span>
          </h2>
          <p className="mt-8 max-w-lg t-lead text-taupe" data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
            {intro}
          </p>
          <ul className="mt-8 flex flex-wrap gap-2" data-reveal style={{ "--reveal-delay": "160ms" } as CSSProperties}>
            {specialties.map((s) => (
              <li key={s} className="rounded-full border border-line-strong px-4 py-1.5 text-[0.8125rem] text-linen/90">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-10" data-reveal style={{ "--reveal-delay": "220ms" } as CSSProperties}>
            <ArrowLink href="/about">Découvrir mon approche</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
