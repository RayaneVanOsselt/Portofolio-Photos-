"use client";

import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Close, Plus } from "@/components/ui/Icons";
import { getSocialLinks, mainNav, siteConfig } from "@/config/site";
import { useAnimatedDialog } from "@/hooks/useAnimatedDialog";
import type { NavCategory } from "@/lib/navigation";
import { isActivePath } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: NavCategory[];
  pathname: string;
};

/** Menu plein écran (mobile & tablette) : grandes typographies, entrée en cascade. */
export function MobileMenu({ open, onClose, categories, pathname }: Props) {
  const dialogRef = useAnimatedDialog(open, onClose, 500);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const panelId = useId();
  const socials = getSocialLinks();

  return (
    <dialog ref={dialogRef} aria-label="Menu" className="mobile-menu m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-mist">
      <div className="mobile-menu-panel flex h-full flex-col overflow-y-auto overscroll-contain bg-deep">
        <div className="container-wide flex h-20 shrink-0 items-center justify-between">
          <Link href="/" onClick={onClose} className="-m-2 p-2 text-platinum" aria-label={`${siteConfig.name} — accueil`}>
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            data-autofocus
            className="-mr-2 flex h-11 items-center gap-3 px-2 text-platinum"
            aria-label="Fermer le menu"
          >
            <span className="t-nav hidden sm:inline">Fermer</span>
            <Close size={22} />
          </button>
        </div>

        <nav aria-label="Navigation mobile" className="container-wide flex-1 pt-6 pb-10">
          <ul className="border-t border-line">
            {mainNav.map((item, i) => {
              const active = isActivePath(pathname, item.href);
              const style = { "--i": i } as CSSProperties;
              const index = String(i + 1).padStart(2, "0");

              if ("hasMegaMenu" in item) {
                return (
                  <li key={item.href} className="mobile-menu-item border-b border-line" style={style}>
                    <div className="flex items-center justify-between">
                      <Link href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className="flex flex-1 items-baseline gap-4 py-4">
                        <span className="t-caption t-tabular text-silver">{index}</span>
                        <span className={`t-h2 ${active ? "text-phosphor" : "text-platinum"}`}>{item.label}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPortfolioOpen((v) => !v)}
                        aria-expanded={portfolioOpen}
                        aria-controls={panelId}
                        aria-label={portfolioOpen ? "Masquer les rubriques" : "Afficher les rubriques"}
                        className="grid size-12 place-items-center rounded-[var(--radius-sm)] bg-kelp-soft text-platinum"
                      >
                        <Plus size={18} className={`transition-transform duration-500 ease-[var(--ease-out-expo)] ${portfolioOpen ? "rotate-45" : ""}`} />
                      </button>
                    </div>
                    <div
                      id={panelId}
                      className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] ${portfolioOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden" inert={!portfolioOpen}>
                        <ul className="grid gap-x-6 gap-y-5 pt-1 pb-6 pl-9 sm:grid-cols-2">
                          {categories.map((category) => (
                            <li key={category.href}>
                              <Link href={category.href} onClick={onClose} className="text-lg font-medium tracking-[-0.02em] text-platinum">
                                {category.title}
                              </Link>
                              {category.children.length ? (
                                <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                                  {category.children.map((child) => (
                                    <li key={child.href}>
                                      <Link href={child.href} onClick={onClose} className="inline-block py-1 t-small text-silver">
                                        {child.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.href} className="mobile-menu-item border-b border-line" style={style}>
                  <Link href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className="flex items-baseline gap-4 py-4">
                    <span className="t-caption t-tabular text-silver">{index}</span>
                    <span className={`t-h2 ${active ? "text-phosphor" : "text-platinum"}`}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mobile-menu-item container-wide shrink-0 pb-[max(2rem,env(safe-area-inset-bottom))]" style={{ "--i": mainNav.length } as CSSProperties}>
          <ButtonLink href="/contact" variant="aurora" size="lg" onClick={onClose} className="w-full">
            Demander un devis
          </ButtonLink>
          {siteConfig.contact.email || socials.length ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 t-small text-silver">
              {siteConfig.contact.email ? <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a> : null}
              <ul className="flex gap-5">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="t-label text-platinum">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
