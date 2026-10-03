"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { SearchDialog } from "@/components/search/SearchDialog";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronDown, Search } from "@/components/ui/Icons";
import { mainNav, siteConfig } from "@/config/site";
import type { NavCategory } from "@/lib/navigation";
import type { SearchItem } from "@/lib/search";
import { isActivePath } from "@/lib/utils";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

type Props = { portfolioNav: NavCategory[]; searchIndex: SearchItem[] };

export function Header({ portfolioNav, searchIndex }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const hoverTimer = useRef<number | undefined>(undefined);
  const megaButtonRef = useRef<HTMLButtonElement>(null);
  const focusMegaOnOpen = useRef(false);

  useEffect(() => {
    if (!megaOpen || !focusMegaOnOpen.current) return;
    focusMegaOnOpen.current = false;
    document.querySelector<HTMLElement>("#mega-menu a")?.focus();
  }, [megaOpen]);

  // En-tête compact dès que l'on quitte le haut de page.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Raccourcis : ⌘K / Ctrl+K et « / » ouvrent la recherche.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setMegaOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMegaSoon = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setMegaOpen(true), 90);
  };
  const closeMegaSoon = () => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setMegaOpen(false), 180);
  };
  const closeMega = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
    setMegaOpen(false);
  }, []);

  const solid = scrolled || megaOpen;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{ viewTransitionName: "site-header" }}
        onPointerLeave={(event) => event.pointerType === "mouse" && closeMegaSoon()}
        onBlur={(event) => {
          // Le focus quitte l'en-tête : on referme le panneau.
          if (megaOpen && !event.currentTarget.contains(event.relatedTarget as Node | null)) closeMega();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && megaOpen) {
            closeMega();
            megaButtonRef.current?.focus();
          }
        }}
      >
        {/* Fond : transparent sur le hero, verre sombre une fois en défilement */}
        <div
          aria-hidden
          className={`absolute inset-0 border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${
            solid ? "border-line bg-abyss/85 backdrop-blur-xl" : "border-transparent bg-gradient-to-b from-deep/60 to-transparent"
          }`}
        />

        <div
          className={`container-wide relative flex items-center justify-between gap-6 transition-[height] duration-500 ease-[var(--ease-out-expo)] ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Link
            href="/"
            className="anim-fade relative z-10 -m-2 p-2 text-platinum"
            style={{ "--delay": "300ms" } as React.CSSProperties}
            aria-label={`${siteConfig.name} — accueil`}
            onClick={closeMega}
          >
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="anim-fade hidden lg:block" style={{ "--delay": "450ms" } as React.CSSProperties}>
            <ul className="flex items-center gap-7 whitespace-nowrap xl:gap-9">
              {mainNav.map((item) => {
                const active = isActivePath(pathname, item.href);
                if ("hasMegaMenu" in item) {
                  return (
                    <li key={item.href} className="flex items-center gap-1" onPointerEnter={(e) => e.pointerType === "mouse" && openMegaSoon()}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`t-nav link-underline transition-colors ${active || megaOpen ? "text-platinum" : "text-silver hover:text-platinum"}`}
                        onClick={closeMega}
                      >
                        {item.label}
                      </Link>
                      <button
                        ref={megaButtonRef}
                        type="button"
                        aria-expanded={megaOpen}
                        aria-controls="mega-menu"
                        aria-label="Afficher les rubriques du portfolio"
                        onClick={(event) => {
                          const opening = !megaOpen;
                          setMegaOpen(opening);
                          // Activation au clavier : le focus entre dans le panneau.
                          focusMegaOnOpen.current = opening && event.detail === 0;
                        }}
                        className="-my-2 -mr-2 grid size-8 place-items-center text-silver transition-colors hover:text-platinum"
                      >
                        <ChevronDown size={14} className={`transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`} />
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={item.href} onPointerEnter={(e) => e.pointerType === "mouse" && closeMegaSoon()}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`t-nav link-underline transition-colors ${active ? "text-platinum" : "text-silver hover:text-platinum"}`}
                      onClick={closeMega}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="anim-fade relative z-10 flex items-center gap-1 sm:gap-3" style={{ "--delay": "550ms" } as React.CSSProperties}>
            <button
              type="button"
              onClick={() => {
                closeMega();
                setSearchOpen(true);
              }}
              className="group flex h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-silver transition-colors hover:text-platinum"
              aria-label="Rechercher (raccourci : Ctrl + K)"
              aria-haspopup="dialog"
            >
              <Search size={18} />
              <span className="hidden t-nav xl:inline">Rechercher</span>
              <kbd className="hidden rounded-[4px] border border-line px-1.5 py-0.5 font-sans text-[0.625rem] text-silver xl:inline">⌘K</kbd>
            </button>

            <span className="hidden xl:block">
              <ButtonLink href="/contact" variant="outline" onClick={closeMega}>
                Travaillons ensemble
              </ButtonLink>
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="group -mr-2 flex h-11 items-center gap-3 rounded-[var(--radius-sm)] px-2 text-platinum lg:hidden"
              aria-label="Ouvrir le menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              <span className="t-nav hidden sm:inline">Menu</span>
              <span aria-hidden className="flex w-6 flex-col items-end gap-[5px]">
                <span className="h-px w-6 bg-current" />
                <span className="h-px w-4 bg-current transition-[width] duration-300 group-hover:w-6" />
              </span>
            </button>
          </div>
        </div>

        <MegaMenu
          open={megaOpen}
          categories={portfolioNav}
          onNavigate={closeMega}
          onPointerEnter={() => window.clearTimeout(hoverTimer.current)}
        />
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={portfolioNav} pathname={pathname} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} index={searchIndex} />
    </>
  );
}
