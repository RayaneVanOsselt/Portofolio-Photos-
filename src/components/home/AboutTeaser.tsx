import type { CSSProperties } from "react";
import { ArrowLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Photo } from "@/lib/types";

export function AboutTeaser({ portrait, intro }: { portrait: Photo; intro: string }) {
  return (
    <section aria-labelledby="about-teaser-title" className="section container-site">
      <div className="grid items-end gap-12 md:grid-cols-12">
        <div className="md:col-span-5" data-reveal="image">
          <PhotoImage photo={portrait} fill sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5]" />
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pb-8">
          <SectionLabel index="05">À propos</SectionLabel>
          <h2 id="about-teaser-title" className="t-h2 mt-6 text-platinum" data-reveal>
            Derrière <span className="t-serif text-phosphor">l&apos;objectif</span>
          </h2>
          <p className="mt-8 max-w-lg t-lead text-silver" data-reveal style={{ "--reveal-delay": "100ms" } as CSSProperties}>
            {intro}
          </p>
          <div className="mt-10" data-reveal style={{ "--reveal-delay": "200ms" } as CSSProperties}>
            <ArrowLink href="/about">Découvrir mon approche</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
