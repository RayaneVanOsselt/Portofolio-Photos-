import type { Metadata } from "next";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { SelectedProject } from "@/components/home/SelectedProject";
import { ServicesTeaser } from "@/components/home/ServicesTeaser";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { aboutContent, homeContent } from "@/data/content";
import { services } from "@/data/services";
import { toIndexEntries } from "@/lib/index-entries";
import { getCategories, getFeaturedProjects, getPhotoById, getProjectBySlug, getProjects } from "@/lib/portfolio";
import { homeTitle, inArea, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: homeTitle,
  description: `Photographe sportif${inArea} : hockey sur gazon, rugby et football. Reportages de match, portraits d'équipe et contenus pour clubs, au plus près du jeu.`,
  path: "/",
});

export default function HomePage() {
  const featured = getFeaturedProjects();
  const selected = getProjectBySlug(homeContent.selectedProjectSlug) ?? getProjects()[0];
  const heroPhoto = getPhotoById(homeContent.hero.photoId, featured[0]?.cover);

  return (
    <>
      <Hero photo={heroPhoto} {...homeContent.hero} />
      <Intro {...homeContent.intro} />
      <FeaturedWork projects={featured.filter((p) => p.slug !== selected.slug)} />

      <section aria-labelledby="categories-title" className="section container-wide">
        <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionLabel index="03">Univers</SectionLabel>
            <h2 id="categories-title" className="t-h2 mt-6 text-platinum" data-reveal>
              Chaque terrain, <span className="t-serif text-phosphor">une même</span> exigence.
            </h2>
          </div>
          <p className="t-lead text-silver md:col-span-5 md:col-start-8 md:self-end" data-reveal>
            Choisissez une compétition ou une équipe pour parcourir ses images.
          </p>
        </div>
        <CategoryIndex entries={toIndexEntries(getCategories())} />
      </section>

      <SelectedProject project={selected} />
      <AboutTeaser portrait={getPhotoById(aboutContent.portraitId)} intro={aboutContent.intro} />
      <ServicesTeaser services={services} />
      <ClosingCta {...homeContent.closing} />
    </>
  );
}
