import Link from "next/link";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import type { Category } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/**
 * Une catégorie (club, équipe, compétition) sur la page Albums : son logo,
 * son nom, le nombre d'albums et la date du dernier match ; la photo de
 * couverture dès qu'il y en a une. Les sous-catégories (FIH Pro League →
 * Hommes / Femmes) sont accessibles directement depuis la carte.
 */
export function CategoryCard({ category, headingLevel = "h2" }: { category: Category; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const albums = `${category.albumCount} album${category.albumCount > 1 ? "s" : ""}`;

  return (
    <article className="photo-hover group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-wash transition-colors duration-300 hover:border-line-strong has-[a:focus-visible]:border-flamingo">
      {category.cover ? (
        <PhotoImage photo={category.cover} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10]" />
      ) : null}

      <div className="flex flex-1 flex-col gap-8 p-[clamp(1.25rem,2vw,1.75rem)]">
        <div className="flex items-start justify-between gap-4">
          {category.crest ? <ClubCrest crest={category.crest} size={category.cover ? 48 : 72} /> : <span className="t-mono text-ash">{category.kicker}</span>}
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-linen transition-[background-color,border-color,color] duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
            <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
          </span>
        </div>

        <div className="mt-auto">
          {category.crest ? <p className="t-mono text-ash">{category.kicker}</p> : null}
          <Heading className="mt-2 text-[clamp(1.5rem,1.15rem+1.2vw,2.25rem)] leading-[1.05] font-light tracking-[-0.035em] text-linen">
            {/* Lien étiré : toute la carte est cliquable, les sous-catégories restent des liens distincts. */}
            <Link
              href={category.href}
              className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-card)] after:content-['']"
            >
              <span className="link-underline">{category.title}</span>
            </Link>
          </Heading>
          <p className="mt-2 t-small text-taupe">
            {albums}
            {category.latestDate ? <> · dernier match le {formatDate(category.latestDate)}</> : null}
          </p>
        </div>

        {category.children.length ? (
          <ul className="relative z-10 flex flex-wrap gap-2" aria-label={`${category.title} : catégories`}>
            {category.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className="flex h-10 items-center gap-2.5 rounded-full border border-line-strong px-4 text-[0.875rem] text-linen transition-colors duration-300 hover:border-linen hover:bg-wash-strong"
                >
                  {child.title}
                  <span className="font-mono text-[0.6875rem] text-ash">{child.albumCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
