import { ButtonLink } from "@/components/ui/Button";
import { Instagram } from "@/components/ui/Icons";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";
import { InstagramFeed, usablePosts, type FeedPost } from "./InstagramFeed";

/** Posts affichés (le plan gratuit de Behold en fournit 6 au maximum). */
const COUNT = 6;

/**
 * Le flux est lu UNE fois, à la publication du site (`npm run build`), jamais pendant
 * les visites : le plan gratuit de Behold compte chaque lecture du flux (1 200 par mois),
 * et un site qui le lirait à chaque visite épuiserait vite ce quota. La GitHub Action
 * republie le site chaque matin : les nouveaux posts apparaissent dans la journée.
 * `force-cache` : en développement aussi, le flux n'est pas relu à chaque rechargement.
 */
async function loadPosts(url: string): Promise<FeedPost[]> {
  try {
    const response = await fetch(url, { cache: "force-cache", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as FeedPost[] | { posts?: FeedPost[] };
    return usablePosts(Array.isArray(data) ? data : (data.posts ?? []), COUNT);
  } catch (error) {
    // Flux indisponible (quota atteint, adresse erronée…) : la page se publie quand même, avec le bouton « Suivre ».
    console.warn(`[instagram] flux Behold illisible, posts non affichés : ${(error as Error).message}`);
    return [];
  }
}

/**
 * Bloc Instagram (accueil, À propos) : le compte, un bouton « Suivre » et, dès
 * qu'un flux est renseigné (siteConfig.instagramFeed), les derniers posts.
 * Sans profil Instagram configuré, rien n'est affiché.
 */
export async function InstagramSection({ className = "" }: { className?: string }) {
  const profile = siteConfig.socials.instagram;
  if (!profile) return null;
  const { handle } = siteConfig.credit;
  const posts = siteConfig.instagramFeed ? await loadPosts(siteConfig.instagramFeed) : [];

  return (
    <section aria-labelledby="instagram-title" className={`container-wide pb-[var(--section-space)] ${className}`}>
      <SectionStamp id="instagram-title" meta={handle}>
        Instagram
      </SectionStamp>
      <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
        <p className="max-w-lg t-lead text-taupe" data-reveal>
          Les coulisses, les dernières photos et les vidéos des matchs, au fil de la saison.
        </p>
        <ButtonLink href={profile} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
          <span className="inline-flex items-center gap-2.5">
            <Instagram size={17} /> Suivre {handle}
          </span>
        </ButtonLink>
      </div>
      {posts.length ? <InstagramFeed posts={posts} profileUrl={profile} handle={handle} /> : null}
    </section>
  );
}
