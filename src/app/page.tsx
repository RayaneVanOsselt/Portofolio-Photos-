import type { Metadata } from "next";
import { AlbumRow } from "@/components/albums/AlbumRow";
import { LatestAlbum } from "@/components/albums/LatestAlbum";
import { TrustedClubs } from "@/components/clubs/TrustedClubs";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Hero } from "@/components/home/Hero";
import { Spotlight } from "@/components/home/Spotlight";
import { InstagramSection } from "@/components/instagram/InstagramSection";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PhotoAccessBand } from "@/components/sections/PhotoAccessBand";
import { ArrowLink } from "@/components/ui/Button";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { VideoRail } from "@/components/videos/VideoRail";
import { isDev, siteConfig } from "@/config/site";
import { aboutContent, homeContent } from "@/data/content";
import { toIndexEntries } from "@/lib/index-entries";
import { categoryContext, getAlbums, getCategories, getFeaturedAlbums, getPhotoById } from "@/lib/albums";
import { homeTitle, inArea, pageMetadata } from "@/lib/seo";
import { isPlaceholder, pad } from "@/lib/utils";
import { getVideos, VIDEOS_HREF } from "@/lib/videos";

export const metadata: Metadata = pageMetadata({
  title: homeTitle,
  description: `Photographe sportif${inArea} : hockey sur gazon, football et rugby. Albums photo par club et par match — retrouvez vos photos en quelques secondes.`,
  path: "/",
});

/**
 * Accueil — quatre parcours évidents :
 * les clubs qui m'ont fait confiance et l'album phare (FIH Pro League), les derniers
 * matchs → les albums par club / compétition, retrouver ses photos (bloc orange),
 * connaître le photographe, le suivre sur Instagram, le contacter.
 */
export default function HomePage() {
  const albums = getAlbums();
  const featured = getFeaturedAlbums();
  const heroPhoto = getPhotoById(homeContent.hero.photoId, "site/home");
  // Légende du hero : l'album dont provient la photo, s'il est publié.
  const heroSource = heroPhoto ? albums.find((a) => a.photos.some((ph) => ph.id === heroPhoto.id)) : undefined;
  const categories = getCategories();
  // Le dernier album qui a des photos s'affiche en grand ; les autres en liste.
  const spotlight = albums.find((a) => a.cover);
  const recent = albums.filter((a) => a !== spotlight).slice(0, spotlight ? 4 : 6);
  // Présentation encore entre crochets : jamais publiée, la description du site la remplace.
  const aboutIntro = isDev || !isPlaceholder(aboutContent.intro) ? aboutContent.intro : siteConfig.description;
  const videos = getVideos();
  const star = categories.find((c) => c.slug === homeContent.spotlight.category);

  return (
    <>
      <Hero
        photo={heroPhoto}
        latest={albums[0]}
        {...homeContent.hero}
        caption={heroSource ? { label: `${heroSource.title} — ${categoryContext(heroSource.category)}`, href: heroSource.href } : undefined}
      />

      <TrustedClubs />

      {star ? <Spotlight category={star} photo={getPhotoById(homeContent.spotlight.photoId)} kicker={homeContent.spotlight.kicker} text={homeContent.spotlight.text} /> : null}

      <section aria-labelledby="latest-title" className="container-wide section">
        <SectionStamp id="latest-title" meta="Du plus récent au plus ancien">
          Derniers matchs
        </SectionStamp>
        <div className="mt-8 mb-10 flex flex-col gap-6 md:mt-10 md:mb-14 md:flex-row md:items-end md:justify-between">
          <p className="max-w-lg t-lead text-taupe" data-reveal>
            Chaque match a son album, en ligne sous {siteConfig.turnaround} : choisissez une rencontre, retrouvez toutes ses photos.
          </p>
          <ArrowLink href="/albums">Tous les albums</ArrowLink>
        </div>
        {spotlight ? (
          <div data-reveal className="mb-8">
            <LatestAlbum album={spotlight} label="Dernier album" />
          </div>
        ) : null}
        <ul className="border-t border-line">
          {recent.map((album) => (
            <li key={album.href} className="border-b border-line">
              <AlbumRow album={album} />
            </li>
          ))}
        </ul>
      </section>

      {videos.length ? (
        <section aria-labelledby="videos-title" className="container-wide pb-[var(--section-space)]">
          <SectionStamp id="videos-title" meta={`${pad(videos.length)} vidéo${videos.length > 1 ? "s" : ""} · Le match en mouvement`}>
            Vidéos
          </SectionStamp>
          <div className="mt-8 mb-10 flex flex-col gap-6 md:mt-10 md:mb-14 md:flex-row md:items-end md:justify-between">
            <p className="max-w-lg t-lead text-taupe" data-reveal>
              Résumés et coulisses des matchs, à regarder en plein écran ou à garder sur votre téléphone.
            </p>
            <ArrowLink href={VIDEOS_HREF}>Toutes les vidéos</ArrowLink>
          </div>
          <VideoRail videos={videos.slice(0, 5)} />
        </section>
      ) : null}

      {featured.length ? <FeaturedWork albums={featured} /> : null}

      <section aria-labelledby="categories-title" className="container-wide pb-[var(--section-space)]">
        <SectionStamp id="categories-title" meta={`${categories.length} catégories`}>
          Albums
        </SectionStamp>
        <div className="mt-8 mb-12 flex flex-col gap-6 md:mt-10 md:mb-16 md:flex-row md:items-end md:justify-between">
          <p className="max-w-lg t-lead text-taupe" data-reveal>
            Un club, une équipe, une compétition : choisissez votre terrain.
          </p>
          <ArrowLink href="/galeries">Retrouver mes photos</ArrowLink>
        </div>
        <CategoryIndex entries={toIndexEntries(categories)} />
      </section>

      <PhotoAccessBand />

      <AboutTeaser portrait={getPhotoById(aboutContent.portraitId, "site/about")} intro={aboutIntro} specialties={aboutContent.specialties} name={siteConfig.owner.firstName} />

      <InstagramSection />

      <ClosingCta />
    </>
  );
}
