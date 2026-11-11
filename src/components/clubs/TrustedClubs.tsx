import Link from "next/link";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { getAlbums, getCategories } from "@/lib/albums";
import type { Category } from "@/lib/types";

/**
 * « Ils m'ont fait confiance » : les clubs et compétitions photographiés, en
 * deux bandeaux qui défilent en sens contraire — les logos (liens vers leurs
 * albums) puis leurs noms en très grand, en contour. Pause au survol ; sans
 * animation si le visiteur l'a demandé (la liste s'affiche alors à plat).
 * Générée depuis src/data/albums.ts : un nouveau club apparaît tout seul.
 */
export function TrustedClubs({ className = "" }: { className?: string }) {
  // Catégories avec un logo (le logo générique « Rugby » n'est pas un club).
  const clubs = getCategories().filter((c): c is Category & { crest: NonNullable<Category["crest"]> } => Boolean(c.crest) && c.crest?.id !== "rugby" && c.albumCount > 0);
  if (clubs.length < 3) return null;
  const matches = getAlbums().filter((a) => a.photos.length).length;

  return (
    <section aria-labelledby="trust-title" className={`trust-marquee relative overflow-hidden border-y border-line bg-night py-[clamp(2.5rem,5vw,4.5rem)] ${className}`}>
      <div className="container-wide flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2.5 t-mono text-taupe">
            <span aria-hidden className="text-sm leading-none text-flamingo">
              +
            </span>
            Ils m&apos;ont fait confiance
          </p>
          <h2 id="trust-title" className="mt-4 max-w-2xl text-[clamp(1.5rem,1.1rem+1.6vw,2.75rem)] leading-[1.08] font-light tracking-[-0.035em] text-linen" data-reveal>
            Des clubs du championnat de Belgique <span className="text-taupe">jusqu&apos;au plus haut niveau international.</span>
          </h2>
        </div>
        <p className="t-mono text-ash">
          {clubs.length} clubs & compétitions · {matches} matchs photographiés
        </p>
      </div>

      {/* Bandeau 1 : les logos, cliquables (la seconde copie, qui assure la boucle, est masquée aux lecteurs d'écran). */}
      <div className="marquee marquee-mask mt-10 md:mt-14">
        <div className="marquee-track trust-track flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1 || undefined} data-copy={copy || undefined}>
              {clubs.map((club) => (
                <li key={club.href} className="pr-[clamp(2rem,4vw,4rem)]">
                  <Link href={club.href} tabIndex={copy ? -1 : undefined} className="group flex items-center gap-4 rounded-full py-1 pr-2">
                    <ClubCrest crest={club.crest} size={64} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110 md:[--crest:76px]" />
                    <span className="flex flex-col">
                      <span className="text-lg font-medium whitespace-nowrap text-linen/85 transition-colors group-hover:text-linen md:text-xl">{club.title}</span>
                      <span className="t-mono whitespace-nowrap text-ash">
                        {club.albumCount} album{club.albumCount > 1 ? "s" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Bandeau 2 : les noms en très grand, en sens inverse — décoratif. */}
      <div aria-hidden className="marquee marquee-reverse marquee-mask mt-8 md:mt-10">
        <div className="marquee-track trust-track-slow flex w-max">
          {[0, 1].map((copy) => (
            <p key={copy} className="flex shrink-0 items-center" data-copy={copy || undefined}>
              {clubs.map((club, i) => (
                <span key={club.href} className="marquee-item flex items-center pr-[clamp(1.5rem,3vw,3rem)]">
                  <span className={i % 2 ? "text-linen/[0.12]" : "marquee-outline"}>{club.title}</span>
                  <span className="ml-[clamp(1.5rem,3vw,3rem)] text-[0.5em] text-flamingo">+</span>
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
