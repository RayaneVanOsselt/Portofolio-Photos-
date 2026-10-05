"use client";

import Link from "next/link";
import { useId, useState, type CSSProperties } from "react";
import { Logo } from "@/components/brand/Logo";
import { ClubCrest } from "@/components/clubs/ClubCrest";
import { ButtonLink } from "@/components/ui/Button";
import { Close, Plus } from "@/components/ui/Icons";
import { getSocialLinks, mainNav, photoAccess, siteConfig } from "@/config/site";
import { useAnimatedDialog } from "@/hooks/useAnimatedDialog";
import type { AlbumsNav } from "@/lib/navigation";
import { isActivePath, pad } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  nav: AlbumsNav;
  pathname: string;
};

/**
 * Menu plein écran (mobile & tablette) : grands liens, entrée en cascade, accès photos en bas.
 * « Albums » se déplie sur les catégories, groupées par sport, avec leurs logos
 * (chargés seulement à la première ouverture) et leurs sous-catégories (Hommes / Femmes).
 */
export function MobileMenu({ open, onClose, nav, pathname }: Props) {
  const dialogRef = useAnimatedDialog(open, onClose, 500);
  const [albumsOpen, setAlbumsOpen] = useState(false);
  const [primed, setPrimed] = useState(false);
  if (albumsOpen && !primed) setPrimed(true);
  const panelId = useId();
  const socials = getSocialLinks();
  const items = mainNav;

  return (
    <dialog ref={dialogRef} aria-label="Menu" className="mobile-menu m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-linen">
      <div className="mobile-menu-panel flex h-full flex-col overflow-y-auto overscroll-contain bg-ink">
        <div className="container-wide flex h-[var(--header-height)] shrink-0 items-center justify-between border-b border-line">
          <Link href="/" onClick={onClose} className="-m-2 p-2 text-linen" aria-label={`${siteConfig.name} — accueil`}>
            <Logo />
          </Link>
          <button type="button" onClick={onClose} data-autofocus className="-mr-2 flex h-11 items-center gap-3 rounded-full px-3 text-linen" aria-label="Fermer le menu">
            <span className="t-label hidden sm:inline">Fermer</span>
            <Close size={22} />
          </button>
        </div>

        <nav aria-label="Navigation mobile" className="container-wide flex-1 pt-4 pb-8">
          <ul>
            {items.map((item, i) => {
              const active = isActivePath(pathname, item.href);
              const style = { "--i": i } as CSSProperties;
              const label = (
                <>
                  <span className="w-7 t-mono text-ash">{pad(i + 1)}</span>
                  <span className={`text-[clamp(2rem,1.2rem+4vw,3rem)] leading-[1.1] font-light tracking-[-0.035em] ${active ? "text-linen" : "text-linen/85"}`}>{item.label}</span>
                  {active ? <span aria-hidden className="ml-1 size-2 self-center rounded-full bg-flamingo" /> : null}
                </>
              );

              if ("hasMegaMenu" in item) {
                return (
                  <li key={item.href} className="mobile-menu-item border-b border-line" style={style}>
                    <div className="flex items-center justify-between">
                      <Link href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className="flex flex-1 items-baseline gap-3 py-3.5">
                        {label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setAlbumsOpen((v) => !v)}
                        aria-expanded={albumsOpen}
                        aria-controls={panelId}
                        aria-label={albumsOpen ? "Masquer les catégories d'albums" : "Afficher les catégories d'albums"}
                        className="grid size-11 place-items-center rounded-full bg-wash-strong text-linen"
                      >
                        <Plus size={18} className={`transition-transform duration-500 ease-[var(--ease-out-expo)] ${albumsOpen ? "rotate-45" : ""}`} />
                      </button>
                    </div>
                    <div id={panelId} className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] ${albumsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden" inert={!albumsOpen}>
                        <div className="space-y-6 pt-1 pb-6 sm:pl-10">
                          {nav.groups.map((group) => (
                            <div key={group.label}>
                              <p className="t-mono text-ash">{group.label}</p>
                              <ul className="mt-2 grid gap-x-6 sm:grid-cols-2">
                                {group.categories.map((category) => (
                                  <li key={category.href}>
                                    <Link href={category.href} onClick={onClose} className="flex min-h-12 items-center gap-3 py-1.5">
                                      {category.crest && primed ? (
                                        <ClubCrest crest={category.crest} size={32} />
                                      ) : (
                                        <span aria-hidden className={`size-8 shrink-0 rounded-full ${category.crest ? "bg-wash-strong" : "border border-line-strong"}`} />
                                      )}
                                      <span className="flex-1 text-lg font-medium tracking-[-0.015em] text-linen">{category.title}</span>
                                      <span className="font-mono text-[0.6875rem] text-ash">{category.count}</span>
                                    </Link>
                                    {category.children.length ? (
                                      <ul className="mb-2 ml-11 flex flex-wrap gap-2">
                                        {category.children.map((child) => (
                                          <li key={child.href}>
                                            <Link
                                              href={child.href}
                                              onClick={onClose}
                                              className="flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-[0.9375rem] text-linen"
                                            >
                                              {child.title}
                                              <span className="font-mono text-[0.6875rem] text-ash">{child.count}</span>
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          <Link href="/albums" onClick={onClose} className="inline-flex h-11 items-center t-label text-linen underline decoration-line-strong underline-offset-4">
                            Tous les albums ({nav.albumCount})
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.href} className="mobile-menu-item border-b border-line" style={style}>
                  <Link href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className="flex items-baseline gap-3 py-3.5">
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mobile-menu-item container-wide shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))]" style={{ "--i": items.length } as CSSProperties}>
          <ButtonLink href={photoAccess.href} variant="signal" size="lg" onClick={onClose} className="w-full">
            Trouver mes photos
          </ButtonLink>
          {siteConfig.contact.email || socials.length ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 t-small text-taupe">
              {siteConfig.contact.email ? <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a> : null}
              <ul className="flex gap-5">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="t-label text-linen">
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
