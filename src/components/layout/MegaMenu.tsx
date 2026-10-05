"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { ArrowLink } from "@/components/ui/Button";
import type { AlbumsNav, NavCategory } from "@/lib/navigation";
import { formatDateMedium } from "@/lib/utils";

type Props = {
  open: boolean;
  nav: AlbumsNav;
  onNavigate: () => void;
  onPointerEnter: () => void;
};

/**
 * Panneau « Albums » (desktop) : les catégories groupées par sport, chacune
 * avec son logo ; les sous-catégories (FIH Pro League → Hommes / Femmes)
 * juste dessous ; les derniers matchs à droite. Léger : aucune photo, et les
 * logos ne sont chargés qu'à la première ouverture.
 */
export function MegaMenu({ open, nav, onNavigate, onPointerEnter }: Props) {
  const [primed, setPrimed] = useState(false);
  if (open && !primed) setPrimed(true);

  // Les grands groupes (Hockey) occupent deux colonnes ; les petits (Football, Rugby) se partagent une colonne.
  const large = nav.groups.filter((g) => g.categories.length > 3);
  const small = nav.groups.filter((g) => g.categories.length <= 3);
  const reveal = (i: number) =>
    ({
      transitionDelay: open ? `${60 + i * 50}ms` : "0ms",
    }) as CSSProperties;
  const revealClass = `transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`;

  return (
    <div
      id="mega-menu"
      inert={!open}
      onPointerEnter={onPointerEnter}
      // Fond presque opaque : un panneau de texte doit rester lisible, quel que soit le titre de page dessous.
      className={`absolute inset-x-0 top-full hidden border-b border-line bg-[rgb(29_30_28/0.97)] backdrop-blur-xl duration-500 ease-[var(--ease-out-expo)] lg:block ${
        open
          ? "visible opacity-100 transition-[opacity,clip-path] [clip-path:inset(0_0_0_0)]"
          : "invisible opacity-0 transition-[opacity,clip-path,visibility] [clip-path:inset(0_0_100%_0)]"
      }`}
    >
      <div className="container-wide grid grid-cols-12 gap-x-10 pt-8 pb-8">
        {large.map((group, i) => (
          <div key={group.label} className={`col-span-6 ${revealClass}`} style={reveal(i)}>
            <p className="t-mono text-ash">{group.label}</p>
            <ul className="mt-3 columns-2 gap-x-8">
              {group.categories.map((category) => (
                <CategoryLink key={category.href} category={category} primed={primed} onNavigate={onNavigate} />
              ))}
            </ul>
          </div>
        ))}

        <div className={`col-span-3 space-y-7 ${revealClass}`} style={reveal(large.length)}>
          {small.map((group) => (
            <div key={group.label}>
              <p className="t-mono text-ash">{group.label}</p>
              <ul className="mt-3">
                {group.categories.map((category) => (
                  <CategoryLink key={category.href} category={category} primed={primed} onNavigate={onNavigate} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`col-span-3 ${revealClass}`} style={reveal(large.length + 1)}>
          <p className="t-mono text-ash">Derniers matchs</p>
          <ul className="mt-3 space-y-1">
            {nav.latest.map((album) => (
              <li key={album.href}>
                <Link href={album.href} onClick={onNavigate} className="group -mx-3 block rounded-[var(--radius-sm)] px-3 py-2 transition-colors hover:bg-wash-strong">
                  <span className="block t-mono text-taupe">{formatDateMedium(album.date)}</span>
                  <span className="mt-0.5 block truncate text-[0.9375rem] text-linen">{album.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-wide flex items-center justify-between border-t border-line py-4">
        <p className="t-mono text-ash">
          {nav.categoryCount} catégories · {nav.albumCount} albums
        </p>
        <div className="flex items-center gap-8">
          <ArrowLink href="/galeries" onClick={onNavigate}>
            Retrouver mes photos
          </ArrowLink>
          <ArrowLink href="/albums" onClick={onNavigate}>
            Tous les albums
          </ArrowLink>
        </div>
      </div>
    </div>
  );
}

/** Une catégorie : logo, nom, nombre d'albums ; ses sous-catégories en pastilles. */
function CategoryLink({ category, primed, onNavigate }: { category: NavCategory; primed: boolean; onNavigate: () => void }) {
  return (
    <li className="break-inside-avoid">
      <Link href={category.href} onClick={onNavigate} className="group -mx-2 flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 transition-colors hover:bg-wash-strong">
        {category.crest && primed ? (
          <ClubCrest crest={category.crest} size={30} />
        ) : (
          <span aria-hidden className={`size-[30px] shrink-0 rounded-full ${category.crest ? "bg-wash-strong" : "border border-line-strong"}`} />
        )}
        <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-linen">{category.title}</span>
        <span className="font-mono text-[0.6875rem] text-ash">{category.count}</span>
      </Link>
      {category.children.length ? (
        <ul className="mb-1 ml-[2.4rem] flex flex-wrap gap-1.5" aria-label={`${category.title} : catégories`}>
          {category.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className="flex h-8 items-center gap-2 rounded-full border border-line-strong px-3 text-[0.8125rem] text-linen/90 transition-colors hover:border-linen hover:text-linen"
              >
                {child.title}
                <span className="font-mono text-[0.625rem] text-ash">{child.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
