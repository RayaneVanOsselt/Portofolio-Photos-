import type { Metadata } from "next";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { VideoShowcase } from "@/components/videos/VideoShowcase";
import { inArea, pageMetadata, videosPageJsonLd } from "@/lib/seo";
import { formatDateMedium, formatDuration, pad } from "@/lib/utils";
import { getFeaturedVideo, getVideos, VIDEOS_HREF } from "@/lib/videos";

export const metadata: Metadata = pageMetadata({
  title: "Vidéos de match — hockey, football, rugby",
  description: `Les matchs en vidéo : résumés, ambiance et coulisses, au plus près du terrain. À regarder en ligne ou à télécharger en HD dans la galerie de votre téléphone. Vidéaste sportif${inArea}.`,
  path: VIDEOS_HREF,
});

/**
 * Vidéos (src/data/videos.ts, préparées par `npm run videos`) : la dernière à la une,
 * puis toutes les autres. Lecture plein écran, téléchargement
 * (iPhone : Enregistrer dans Photos ; Android : galerie).
 */
export default function VideosPage() {
  const videos = getVideos();
  const featured = getFeaturedVideo();

  return (
    <>
      <PageIntro
        crumbs={[{ name: "Vidéos", path: VIDEOS_HREF }]}
        kicker="Le match en mouvement"
        title="Vidéos"
        intro={
          <p>
            Résumés, ambiance et coulisses, au plus près du jeu. Regardez en plein écran, ou touchez « Télécharger » : la vidéo s&apos;enregistre en HD dans la galerie de
            votre téléphone.
          </p>
        }
        aside={
          videos.length ? (
            <MetaList
              items={[
                { label: "Vidéos", value: pad(videos.length) },
                { label: "Durée totale", value: formatDuration(videos.reduce((sum, v) => sum + v.duration, 0)) },
                { label: "Dernière", value: formatDateMedium(videos[0].date) },
              ]}
            />
          ) : null
        }
      />

      {videos.length && featured ? (
        <>
          <VideoShowcase videos={videos} featured={featured.slug} />
          <JsonLd data={videosPageJsonLd(videos)} />
        </>
      ) : (
        <section aria-label="Vidéos" className="container-wide pb-[var(--section-space)]">
          <div className="flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-line bg-wash px-[clamp(1.5rem,4vw,3rem)] py-[clamp(2.5rem,6vw,4.5rem)]">
            <p className="t-mono text-ash">Bientôt</p>
            <p className="t-h2 max-w-[22ch] text-linen">Les premières vidéos arrivent très vite.</p>
            <p className="t-lead max-w-[48ch] text-taupe">En attendant, retrouvez tous les matchs en photos.</p>
            <ButtonLink href="/albums" variant="signal">
              Voir les albums
            </ButtonLink>
          </div>
        </section>
      )}

      <ClosingCta />
    </>
  );
}
