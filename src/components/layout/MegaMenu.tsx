"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLink } from "@/components/ui/Button";
import { PhotoImage } from "@/components/ui/PhotoImage";
import type { NavCategory } from "@/lib/navigation";
import { pad } from "@/lib/utils";

type Props = {
  open: boolean;
  categories: NavCategory[];
  onNavigate: () => void;
  onPointerEnter: () => void;
};

/** Panneau « Portfolio » (desktop) : les catégories comme navigation visuelle. */
export function MegaMenu({ open, categories, onNavigate, onPointerEnter }: Props) {
  // Les vignettes ne sont chargées qu'à la première ouverture.
  const [primed, setPrimed] = useState(false);
  if (open && !primed) setPrimed(true);

  return (
    <div
      id="mega-menu"
      inert={!open}
      onPointerEnter={onPointerEnter}
      className={`glass absolute inset-x-0 top-full hidden border-b border-line duration-500 ease-[var(--ease-out-expo)] lg:block ${
        open
          ? "visible opacity-100 transition-[opacity,clip-path] [clip-path:inset(0_0_0_0)]"
          : "invisible opacity-0 transition-[opacity,clip-path,visibility] [clip-path:inset(0_0_100%_0)]"
      }`}
    >
      <div className="container-wide grid grid-cols-6 gap-4 pt-7 pb-8 xl:gap-6">
        {categories.map((category, i) => (
          <div
            key={category.href}
            className={`transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
            style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
          >
            <Link href={category.href} onClick={onNavigate} className="photo-hover group block">
              {primed ? (
                <PhotoImage photo={category.cover} fill sizes="(min-width: 1680px) 260px, 16vw" className="aspect-[4/5] rounded-[var(--radius-card)]" />
              ) : (
                <div className="aspect-[4/5] rounded-[var(--radius-card)] bg-ink-soft" />
              )}
              <span className="mt-4 block t-mono text-ash">{pad(i + 1)}</span>
              <span className="mt-1 block text-base font-medium tracking-[-0.01em] text-linen">
                <span className="link-underline">{category.title}</span>
              </span>
            </Link>
            {category.children.length ? (
              <ul className="mt-2 space-y-1">
                {category.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href} onClick={onNavigate} className="t-small text-taupe transition-colors hover:text-linen">
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
        <p className="t-mono text-ash">{categories.length} catégories</p>
        <div className="flex items-center gap-8">
          <ArrowLink href="/galeries" onClick={onNavigate}>
            Toutes les galeries
          </ArrowLink>
          <ArrowLink href="/portfolio" onClick={onNavigate}>
            Tout le portfolio
          </ArrowLink>
        </div>
      </div>
    </div>
  );
}
