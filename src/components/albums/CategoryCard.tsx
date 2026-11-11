import Link from "next/link";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import type { Category } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/**
 * Format d'une tuile dans la mosaïque de la page Albums (3 colonnes sur grand écran) :
 * - `hero` : 2 colonnes × 2 rangées — la catégorie mise en avant (FIH Pro League) ;
 * - `wide` : grand format horizontal, 2 colonnes ;
 * - `tall` : grand format vertical, 2 rangées ;
 * - `full` : bandeau sur toute la largeur ;
 * - `std`  : une case.
 */
export type TileLayout = "hero" | "wide" | "tall" | "full" | "std";

/**
 * Formats de la mosaïque, calculés pour remplir exactement la grille de 3 colonnes,
 * quel que soit le nombre de catégories : un bloc d'ouverture (la vedette + deux cases),
 * puis des blocs de 4 qui alternent grand vertical à gauche / à droite, puis un final
 * qui comble la dernière rangée.
 */
export function mosaicLayouts(count: number): TileLayout[] {
  if (count < 3) return Array.from({ length: count }, () => "wide" as const);
  const layouts: TileLayout[] = ["hero", "std", "std"];
  let left = count - 3;
  let tallFirst = true;
  while (left >= 4) {
    // Bloc de 4 sur 2 rangées : grand vertical + grand horizontal + deux cases.
    layouts.push(...(tallFirst ? (["tall", "wide", "std", "std"] as const) : (["wide", "tall", "std", "std"] as const)));
    tallFirst = !tallFirst;
    left -= 4;
  }
  if (left === 3) layouts.push("std", "std", "std");
  else if (left === 2) layouts.push("wide", "std");
  else if (left === 1) layouts.push("full");
  return layouts;
}

const SPAN: Record<TileLayout, string> = {
  hero: "sm:col-span-2 lg:row-span-2",
  wide: "lg:col-span-2",
  tall: "lg:row-span-2",
  full: "sm:col-span-2 lg:col-span-3",
  std: "",
};

/** Hauteur sur téléphone et tablette (sur grand écran, la rangée de la grille décide). */
const FRAME: Record<TileLayout, string> = {
  hero: "aspect-[4/5] sm:aspect-[16/10]",
  wide: "aspect-[16/11]",
  tall: "aspect-[4/5]",
  full: "aspect-[4/5] sm:aspect-[21/9]",
  std: "aspect-[16/11]",
};

const SIZES: Record<TileLayout, string> = {
  hero: "(min-width: 1024px) 66vw, 100vw",
  wide: "(min-width: 1024px) 66vw, (min-width: 640px) 50vw, 100vw",
  tall: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  full: "100vw",
  std: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
};

/**
 * Une catégorie (club, équipe, compétition) dans la mosaïque de la page Albums :
 * la photo de couverture en plein cadre, le logo, le nom, le nombre d'albums et la
 * date du dernier match ; les sous-catégories (FIH Pro League → Hommes / Femmes)
 * restent accessibles directement depuis la tuile.
 */
export function CategoryCard({
  category,
  layout = "std",
  headingLevel = "h2",
  priority = false,
  className = "",
}: {
  category: Category;
  layout?: TileLayout;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
  /** Dans la mosaïque : `lg:aspect-auto lg:h-full` (la rangée de la grille donne la hauteur). */
  className?: string;
}) {
  const Heading = headingLevel;
  const albums = `${category.albumCount} album${category.albumCount > 1 ? "s" : ""}`;
  const big = layout === "hero" || layout === "full";

  return (
    <article
      className={`photo-hover group relative isolate flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-wash transition-colors duration-300 hover:border-line-strong has-[a:focus-visible]:border-flamingo ${FRAME[layout]} ${className}`}
    >
      {category.cover ? (
        <>
          <PhotoImage photo={category.cover} fill priority={priority} sizes={SIZES[layout]} className="absolute inset-0 -z-10 h-full w-full" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(19_20_18/0.55)_0%,rgb(19_20_18/0.05)_35%,rgb(19_20_18/0.25)_55%,rgb(19_20_18/0.92)_100%)]" />
        </>
      ) : null}

      <div className="flex flex-1 flex-col p-[clamp(1.125rem,2vw,1.75rem)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {category.crest ? <ClubCrest crest={category.crest} size={big ? 60 : 44} eager={priority} /> : null}
            <span className="truncate t-mono text-linen/80">{category.kicker}</span>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-linen/15 text-linen backdrop-blur-md transition-[background-color,color] duration-300 group-hover:bg-flamingo group-hover:text-ink">
            <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
          </span>
        </div>

        <div className="mt-auto pt-8">
          {layout === "hero" ? <p className="mb-3 t-mono text-flamingo">+ À la une</p> : null}
          <Heading
            className={`font-light tracking-[-0.035em] text-linen ${
              big ? "text-[clamp(2rem,1.2rem+3vw,4.5rem)] leading-[0.98]" : "text-[clamp(1.5rem,1.15rem+1.2vw,2.25rem)] leading-[1.05]"
            }`}
          >
            {/* Lien étiré : toute la tuile est cliquable, les sous-catégories restent des liens distincts. */}
            <Link href={category.href} className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-card)] after:content-['']">
              <span className="link-underline">{category.title}</span>
            </Link>
          </Heading>
          <p className="mt-2 t-small text-linen/75">
            {albums}
            {category.latestDate ? <> · dernier match le {formatDate(category.latestDate)}</> : null}
          </p>

          {category.children.length > 1 ? (
            <ul className="relative z-10 mt-4 flex flex-wrap gap-2" aria-label={`${category.title} : catégories`}>
              {category.children.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className="flex h-9 items-center gap-2 rounded-full bg-ink/45 px-3.5 text-[0.8125rem] text-linen backdrop-blur-md transition-colors duration-300 hover:bg-linen hover:text-ink"
                  >
                    {child.title}
                    <span className="font-mono text-[0.6875rem] opacity-70">{child.albumCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Classes de la case de grille qui porte une tuile (à poser sur le <li>). */
export function tileSpan(layout: TileLayout) {
  return SPAN[layout];
}
