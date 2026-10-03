"use client";

import Link from "next/link";
import { useState } from "react";
import { PhotoImage } from "@/components/ui/PhotoImage";
import { ArrowLink } from "@/components/ui/Button";
import type { NavCategory } from "@/lib/navigation";

type Props = {
  open: boolean;
  categories: NavCategory[];
  onNavigate: () => void;
  onPointerEnter: () => void;
};

/** Panneau « Portfolio » (desktop) : les rubriques comme navigation visuelle. */
export function MegaMenu({ open, categories, onNavigate, onPointerEnter }: Props) {
  // Les vignettes ne sont chargées qu'à la première ouverture.
  const [primed, setPrimed] = useState(false);
  if (open && !primed) setPrimed(true);

  return (
    <div
      id="mega-menu"
      inert={!open}
      onPointerEnter={onPointerEnter}
      // Ouverture : visible immédiatement (focusable). Fermeture : masqué à la fin du fondu.
      className={`absolute inset-x-0 top-full hidden border-b border-line bg-abyss/95 backdrop-blur-xl duration-500 ease-[var(--ease-out-expo)] lg:block ${
        open
          ? "visible opacity-100 transition-[opacity,clip-path] [clip-path:inset(0_0_0_0)]"
          : "invisible opacity-0 transition-[opacity,clip-path,visibility] [clip-path:inset(0_0_100%_0)]"
      }`}
    >
      <div className="container-wide grid grid-cols-6 gap-5 pt-8 pb-10 xl:gap-8">
        {categories.map((category, i) => (
          <div
            key={category.href}
            className={`transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
          >
            <Link href={category.href} onClick={onNavigate} className="photo-hover group block" data-cursor="explore">
              {primed ? (
                <PhotoImage photo={category.cover} fill sizes="(min-width: 1680px) 260px, 16vw" className="aspect-[4/5]" />
              ) : (
                <div className="aspect-[4/5] rounded-[var(--radius-sm)] bg-kelp" />
              )}
              <span className="mt-4 block t-caption text-silver">{category.kicker}</span>
              <span className="mt-1.5 block text-xl font-medium tracking-[-0.02em] text-platinum">
                <span className="link-underline">{category.title}</span>
              </span>
            </Link>
            {category.children.length ? (
              <ul className="mt-3 space-y-1.5">
                {category.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href} onClick={onNavigate} className="t-small text-silver transition-colors hover:text-platinum">
                      {child.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
      <div className="container-wide flex items-center justify-between border-t border-line py-4">
        <p className="t-caption text-silver">{categories.length} rubriques</p>
        <ArrowLink href="/portfolio" onClick={onNavigate}>
          Tout le portfolio
        </ArrowLink>
      </div>
    </div>
  );
}
