import type { Metadata } from "next";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Hero } from "@/components/home/Hero";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PhotoAccessBand } from "@/components/sections/PhotoAccessBand";
import { ArrowLink } from "@/components/ui/Button";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { aboutContent, homeContent } from "@/data/content";
import { toIndexEntries } from "@/lib/index-entries";
import { categoryContext, getCategories, getFeaturedProjects, getPhotoById, getProjects } from "@/lib/portfolio";
import { homeTitle, inArea, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: homeTitle,
  description: `Photographe sportif${inArea} : hockey sur gazon, rugby et football. Reportages de match, portraits d'équipe et contenus pour clubs — retrouvez vos photos en quelques secondes.`,
  path: "/",
});

/**
 * Accueil — quatre parcours évidents :
 * découvrir le travail (Sélection → Catégories), retrouver ses photos (bloc orange),
 * connaître le photographe, le contacter.
 */
export default function HomePage() {
  const featured = getFeaturedProjects();
  const latest = getProjects()[0];
  const heroPhoto = getPhotoById(homeContent.hero.photoId, featured[0]?.cover);
  // Légende du hero : la galerie dont provient la photo, si elle est publiée.
  const heroSource = getProjects().find((p) => p.photos.some((ph) => ph.id === heroPhoto.id));
  const categories = getCategories();

  return (
    <>
      <Hero
        photo={heroPhoto}
        latest={latest}
        {...homeContent.hero}
        caption={heroSource ? { label: `${heroSource.title} — ${categoryContext(heroSource.category)}`, href: heroSource.href } : undefined}
      />

      <FeaturedWork projects={featured} />

      <section aria-labelledby="categories-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="categories-title" index="02" meta={`${categories.length} catégories`}>
          Catégories
        </SectionStamp>
        <div className="mt-8 mb-12 flex flex-col gap-6 md:mt-10 md:mb-16 md:flex-row md:items-end md:justify-between">
          <p className="max-w-lg t-lead text-taupe" data-reveal>
            Une compétition, un club, une équipe : choisissez votre terrain.
          </p>
          <ArrowLink href="/galeries">Toutes les galeries</ArrowLink>
        </div>
        <CategoryIndex entries={toIndexEntries(categories)} />
      </section>

      <PhotoAccessBand />

      <AboutTeaser portrait={getPhotoById(aboutContent.portraitId)} intro={aboutContent.intro} specialties={aboutContent.specialties} />

      <ClosingCta />
    </>
  );
}
