import { ButtonLink } from "@/components/ui/Button";
import { Instagram } from "@/components/ui/Icons";
import { SectionStamp } from "@/components/ui/SectionLabel";
import { siteConfig } from "@/config/site";
import { InstagramFeed } from "./InstagramFeed";

/**
 * Bloc Instagram (accueil, À propos) : le compte, un bouton « Suivre » et, dès
 * qu'un flux est renseigné (siteConfig.instagramFeed), les derniers posts.
 * Sans profil Instagram configuré, rien n'est affiché.
 */
export function InstagramSection({ className = "" }: { className?: string }) {
  const profile = siteConfig.socials.instagram;
  if (!profile) return null;
  const { handle } = siteConfig.credit;

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
      {siteConfig.instagramFeed ? <InstagramFeed feedUrl={siteConfig.instagramFeed} profileUrl={profile} handle={handle} /> : null}
    </section>
  );
}
