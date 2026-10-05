import Link from "next/link";
import type { CSSProperties } from "react";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { Parallax } from "@/components/effects/Parallax";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MetaList } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PhotoAccessBand } from "@/components/sections/PhotoAccessBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowLink } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ALBUMS_HREF, getCategoryAlbums, getCategoryTrail, getNextCategory } from "@/lib/albums";
import { categorySummary, collectionJsonLd } from "@/lib/seo";
import type { Category } from "@/lib/types";
import { formatDateShort, pad } from "@/lib/utils";
import { AlbumCard } from "./AlbumCard";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/**
 * Page d'une catégorie (club, équipe, compétition) :
 * H1 = la catégorie, avec son logo ; puis chaque match (H2), du plus récent
 * au plus ancien. Une catégorie découpée (FIH Pro League) présente d'abord
 * ses sous-catégories (Hommes / Femmes), chacune avec ses matchs.
 */
export function CategoryView({ category }: { category: Category }) {
  const albums = getCategoryAlbums(category);
  const trail = getCategoryTrail(category);
  const next = getNextCategory(category);
  const crumbs = [{ name: "Albums", path: ALBUMS_HREF }, ...trail.map((c) => ({ name: c.title, path: c.href }))];
  // Titres longs (« Woluwe Hockey Club H1 ») : corps H1 plutôt que « display », pour tenir sur mobile.
  const long = category.fullTitle.length > 14;

  return (
    <>
      <header className="container-wide page-top pb-[clamp(2.5rem,5vw,4rem)]">
        <Breadcrumbs items={crumbs} />
        <div className="anim-rise mt-10 flex items-center gap-4 md:mt-14" style={delay(120)}>
          {category.crest ? <ClubCrest crest={category.crest} size={64} eager className="md:[--crest:88px]" /> : null}
          <SectionLabel>{category.kicker}</SectionLabel>
        </div>
        <h1 className={`${long ? "t-h1" : "t-display"} mt-6 break-words text-linen md:mt-8`}>
          <span className="line-mask">
            <span style={delay(180)}>
              {category.parent ? (
                <>
                  {category.parent.fullTitle} <span className="text-taupe">{category.title}</span>
                </>
              ) : (
                category.title
              )}
            </span>
          </span>
        </h1>

        {/* Sur tablette, intro et chiffres s'empilent : la date du dernier match garde toute sa largeur. */}
        <div className="mt-10 grid gap-10 border-t border-line pt-8 md:mt-14 lg:grid-cols-12">
          <div className="anim-rise t-lead text-taupe lg:col-span-6" style={delay(380)}>
            <p>{category.intro ?? categorySummary(category)}</p>
          </div>
          <div className="anim-rise lg:col-span-5 lg:col-start-8" style={delay(480)}>
            <MetaList
              columns="2-3"
              items={[
                { label: "Albums", value: pad(category.albumCount) },
                { label: "Photos", value: category.photoCount },
                ...(category.latestDate ? [{ label: "Dernier match", value: formatDateShort(category.latestDate) }] : []),
              ]}
            />
          </div>
        </div>

        {/* Sous-menu (FIH Pro League → Hommes / Femmes) */}
        {category.children.length ? (
          <nav aria-label={`${category.title} : catégories`} className="anim-rise mt-10 md:mt-12" style={delay(560)}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {category.children.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className="group flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line-strong px-6 py-5 transition-colors duration-300 hover:border-linen hover:bg-wash"
                  >
                    <span>
                      <span className="block text-[clamp(1.375rem,1.1rem+1vw,2rem)] leading-tight font-light tracking-[-0.03em] text-linen">{child.title}</span>
                      <span className="mt-1 block t-mono text-ash">
                        {child.albumCount} album{child.albumCount > 1 ? "s" : ""}
                        {child.latestDate ? ` · ${formatDateShort(child.latestDate)}` : ""}
                      </span>
                    </span>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-linen transition-[background-color,border-color,color] duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
                      <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      {/* Couverture cinématique, dès que la catégorie a des photos */}
      {category.cover ? (
        <div className="container-wide pb-[var(--section-space-sm)]">
          <div className="relative h-[min(72vh,48rem)] min-h-[20rem] overflow-hidden rounded-[var(--radius-card)]">
            <Parallax strength={60} className="absolute inset-x-0 -top-16 -bottom-16">
              <PhotoImage photo={category.cover} fill priority sizes="(min-width: 1776px) 1680px, 100vw" className="h-full" />
            </Parallax>
          </div>
        </div>
      ) : null}

      {category.children.length ? (
        category.children.map((child) => {
          const childAlbums = getCategoryAlbums(child);
          return (
            <section key={child.href} aria-labelledby={`categorie-${child.slug}`} className="container-wide pb-[var(--section-space-sm)] last-of-type:pb-[var(--section-space)]">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-line pt-5">
                <h2 id={`categorie-${child.slug}`} className="t-h2 text-linen">
                  <Link href={child.href} className="link-underline">
                    {child.title}
                  </Link>
                </h2>
                <ArrowLink href={child.href}>Tous les albums {child.title}</ArrowLink>
              </div>
              <AlbumList albums={childAlbums} headingLevel="h3" />
            </section>
          );
        })
      ) : (
        <section aria-label={`Albums ${category.fullTitle}`} className="container-wide pb-[var(--section-space)]">
          <p className="flex items-center justify-between gap-6 border-t border-line pt-4 t-mono text-ash">
            <span>
              {albums.length} album{albums.length > 1 ? "s" : ""}
            </span>
            <span>Du plus récent au plus ancien</span>
          </p>
          <AlbumList albums={albums} headingLevel="h2" />
        </section>
      )}

      <PhotoAccessBand context={category.fullTitle} />

      <JsonLd data={collectionJsonLd(category, albums)} />
      <NextCategory category={next} />
      <ClosingCta />
    </>
  );
}

function AlbumList({ albums, headingLevel }: { albums: ReturnType<typeof getCategoryAlbums>; headingLevel: "h2" | "h3" }) {
  if (!albums.length) return <p className="mt-10 t-small text-taupe">Les albums de cette catégorie arrivent bientôt.</p>;
  return (
    <ul className="mt-10 flex flex-col gap-3 md:mt-14">
      {albums.map((album, i) => (
        // Les matchs avec photos respirent (grandes images) ; ceux sans photo forment un calendrier compact.
        <li key={album.href} className={album.cover ? "py-[clamp(1.5rem,4vw,3rem)]" : ""}>
          <AlbumCard album={album} headingLevel={headingLevel} priority={i === 0 && !album.category.cover} />
        </li>
      ))}
    </ul>
  );
}

/** Invitation à poursuivre : la catégorie suivante, en grand. */
function NextCategory({ category }: { category: Category }) {
  return (
    <section aria-label="Catégorie suivante" className="container-wide">
      <Link href={category.href} className="photo-hover group relative block overflow-hidden rounded-[var(--radius-card)] border border-line bg-wash">
        {category.cover ? (
          <>
            <PhotoImage photo={category.cover} fill sizes="(min-width: 1776px) 1680px, 100vw" className="aspect-[4/5] sm:aspect-[21/9]" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(19_20_18/0.85),rgb(19_20_18/0.1))]" />
          </>
        ) : (
          <div aria-hidden className="aspect-[16/10] sm:aspect-[21/7]" />
        )}
        <div className="absolute inset-0 flex flex-col justify-between p-[clamp(1.25rem,4vw,3.5rem)]">
          <p className="t-mono text-linen">+ Catégorie suivante</p>
          <div className="flex items-end justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-4">
                {category.crest ? <ClubCrest crest={category.crest} size={48} className="md:[--crest:64px]" /> : null}
                <p className="t-mono text-linen/75">{category.kicker}</p>
              </div>
              <p className="t-h1 mt-4 break-words text-[clamp(1.75rem,0.9rem+4vw,5.5rem)] text-linen">{category.title}</p>
            </div>
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-linen/15 text-linen backdrop-blur-md transition-colors duration-300 group-hover:bg-flamingo group-hover:text-ink">
              <ArrowUpRight size={22} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
