"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { SearchDialog } from "@/components/search/SearchDialog";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronDown, Search } from "@/components/ui/Icons";
import { mainNav, photoAccess, siteConfig } from "@/config/site";
import type { AlbumsNav } from "@/lib/navigation";
import { isActivePath } from "@/lib/utils";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";

type Props = { albumsNav: AlbumsNav };

/**
 * Barre de navigation en verre dépoli : la photo du dessous reste visible.
 * Elle s'efface quand on descend (les photos prennent tout l'écran) et
 * revient dès qu'on remonte.
 */
export function Header({ albumsNav }: Props) {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
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

  // Masquée en descendant, visible en remontant (et toujours en haut de page).
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 320);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
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

  const tucked = hidden && !megaOpen && !menuOpen && !searchOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out-expo)] ${tucked ? "-translate-y-full" : "translate-y-0"}`}
        style={{ viewTransitionName: "site-header" }}
        onPointerLeave={(event) => event.pointerType === "mouse" && closeMegaSoon()}
        onFocus={() => setHidden(false)}
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
        <div aria-hidden className="glass absolute inset-0 border-b border-line" />

        <div className="container-wide relative flex h-[var(--header-height)] items-center justify-between gap-6">
          <Link href="/" className="relative z-10 -m-2 p-2 text-linen" aria-label={`${siteConfig.name} — accueil`} onClick={closeMega}>
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul className="flex items-center gap-1 whitespace-nowrap">
              {mainNav.map((item) => {
                const active = isActivePath(pathname, item.href);
                const linkClass = `relative inline-flex h-10 items-center px-3 t-label transition-colors duration-300 ${
                  active ? "text-linen" : "text-taupe hover:text-linen"
                }`;
                const dot = (
                  <span
                    aria-hidden
                    className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-flamingo transition-[opacity,transform] duration-300 ${
                      active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  />
                );
                if ("hasMegaMenu" in item) {
                  return (
                    <li key={item.href} className="flex items-center" onPointerEnter={(e) => e.pointerType === "mouse" && openMegaSoon()}>
                      <Link href={item.href} aria-current={active ? "page" : undefined} className={`${linkClass} pr-1 ${megaOpen ? "text-linen" : ""}`} onClick={closeMega}>
                        {item.label}
                        {dot}
                      </Link>
                      <button
                        ref={megaButtonRef}
                        type="button"
                        aria-expanded={megaOpen}
                        aria-controls="mega-menu"
                        aria-label="Afficher les catégories d'albums"
                        onClick={(event) => {
                          const opening = !megaOpen;
                          setMegaOpen(opening);
                          // Activation au clavier : le focus entre dans le panneau.
                          focusMegaOnOpen.current = opening && event.detail === 0;
                        }}
                        className="grid size-8 place-items-center text-taupe transition-colors hover:text-linen"
                      >
                        <ChevronDown size={13} className={`transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`} />
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={item.href} onPointerEnter={(e) => e.pointerType === "mouse" && closeMegaSoon()}>
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={linkClass} onClick={closeMega}>
                      {item.label}
                      {dot}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeMega();
                setSearchOpen(true);
              }}
              className="grid size-11 place-items-center rounded-full text-linen transition-colors duration-300 hover:bg-wash-strong"
              aria-label="Rechercher une galerie, une équipe, un match"
              aria-haspopup="dialog"
            >
              <Search size={19} />
            </button>

            <span className="hidden sm:block">
              <ButtonLink href={photoAccess.href} variant="signal" size="sm" icon={false} onClick={closeMega}>
                {photoAccess.label}
              </ButtonLink>
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="group -mr-2 flex h-11 items-center gap-3 rounded-full px-3 text-linen lg:hidden"
              aria-label="Ouvrir le menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              <span className="t-label hidden sm:inline">Menu</span>
              <span aria-hidden className="flex w-6 flex-col items-end gap-[6px]">
                <span className="h-[1.5px] w-6 bg-current" />
                <span className="h-[1.5px] w-4 bg-current transition-[width] duration-300 group-hover:w-6" />
              </span>
            </button>
          </div>
        </div>

        <MegaMenu open={megaOpen} nav={albumsNav} onNavigate={closeMega} onPointerEnter={() => window.clearTimeout(hoverTimer.current)} />
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} nav={albumsNav} pathname={pathname} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
