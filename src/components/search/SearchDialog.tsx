"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowRight, ArrowUpRight, Close, Search } from "@/components/ui/Icons";
import { useAnimatedDialog } from "@/hooks/useAnimatedDialog";
import { SEARCH_TYPE_PLURAL, SEARCH_TYPES, searchItems, type SearchItem, type SearchType } from "@/lib/search";
import { Highlight, ResultMeta, Thumb } from "./SearchParts";

type Props = {
  open: boolean;
  onClose: () => void;
  index: SearchItem[];
};

type Filter = "Tout" | SearchType;

const RECENT_KEY = "rayvo:recherches-recentes";
const RECENT_MAX = 5;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Une ligne navigable au clavier, quelle que soit la section qui l'affiche. */
type Entry = { key: string; item: SearchItem; section: string };

/**
 * Palette de recherche : résultats pendant la saisie (galeries, catégories,
 * équipes, services, pages), surlignage, filtres, navigation au clavier,
 * recherches récentes et suggestions quand le champ est vide.
 */
export function SearchDialog({ open, onClose, index }: Props) {
  const router = useRouter();
  const dialogRef = useAnimatedDialog(open, onClose, 350);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Tout");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<SearchItem[]>([]);
  const listId = useId();

  // Recherches récentes : lues dans le stockage local à la première ouverture.
  const [recentLoaded, setRecentLoaded] = useState(false);
  if (open && !recentLoaded) {
    setRecentLoaded(true);
    setRecent(readRecent().filter((s) => index.some((i) => i.href === s.href)));
  }

  const trimmed = query.trim();
  const allResults = useMemo(() => (trimmed ? searchItems(index, trimmed, 40) : []), [index, trimmed]);
  const counts = useMemo(() => {
    const c: Partial<Record<Filter, number>> = { Tout: allResults.length };
    for (const r of allResults) c[r.type] = (c[r.type] ?? 0) + 1;
    return c;
  }, [allResults]);
  const results = filter === "Tout" ? allResults : allResults.filter((r) => r.type === filter);

  const latest = useMemo(() => index.filter((i) => i.type === "Galerie").slice(0, 4), [index]);
  const categories = useMemo(() => index.filter((i) => i.type === "Catégorie"), [index]);
  const quickLinks = useMemo(() => index.filter((i) => i.type === "Page"), [index]);

  // Sections affichées + liste à plat pour la navigation clavier.
  const sections: { title: string; entries: Entry[]; layout: "rows" | "tiles" }[] = trimmed
    ? SEARCH_TYPES.map((type) => ({
        title: SEARCH_TYPE_PLURAL[type],
        layout: "rows" as const,
        entries: results.filter((r) => r.type === type).map((item) => ({ key: `${type}-${item.href}`, item, section: type })),
      })).filter((s) => s.entries.length)
    : [
        ...(recent.length ? [{ title: "Récentes", layout: "rows" as const, entries: recent.map((item) => ({ key: `recent-${item.href}`, item, section: "recent" })) }] : []),
        { title: "Dernières galeries", layout: "tiles" as const, entries: latest.map((item) => ({ key: `latest-${item.href}`, item, section: "latest" })) },
        { title: "Catégories", layout: "rows" as const, entries: categories.map((item) => ({ key: `cat-${item.href}`, item, section: "cat" })) },
        { title: "Accès rapide", layout: "rows" as const, entries: quickLinks.map((item) => ({ key: `page-${item.href}`, item, section: "page" })) },
      ];
  const flat = sections.flatMap((s) => s.entries);
  const activeIndex = Math.min(active, Math.max(flat.length - 1, 0));
  const activeEntry = flat[activeIndex];

  // L'élément actif reste visible lors de la navigation au clavier.
  useEffect(() => {
    if (!activeEntry) return;
    listRef.current?.querySelector(`[data-entry="${CSS.escape(activeEntry.key)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeEntry]);

  const remember = (item: SearchItem) => {
    const next = [item, ...recent.filter((r) => r.href !== item.href)].slice(0, RECENT_MAX);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* stockage indisponible : sans conséquence */
    }
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* idem */
    }
  };

  const close = () => {
    onClose();
    // Le champ est réinitialisé une fois le panneau refermé.
    window.setTimeout(() => {
      setQuery("");
      setFilter("Tout");
      setActive(0);
    }, 360);
  };

  const go = (item: SearchItem) => {
    remember(item);
    close();
    router.push(item.href);
  };

  const showAll = () => {
    if (!trimmed) return;
    close();
    router.push(`/search/?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((activeIndex + 1) % Math.max(flat.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((activeIndex - 1 + flat.length) % Math.max(flat.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeEntry) go(activeEntry.item);
      else showAll();
    } else if (event.key === "Tab" && trimmed && !event.shiftKey && allResults.length) {
      // Tab : passe au filtre suivant (comportement des palettes de commande).
      event.preventDefault();
      const available: Filter[] = ["Tout", ...SEARCH_TYPES.filter((t) => counts[t])];
      setFilter(available[(available.indexOf(filter) + 1) % available.length]);
      setActive(0);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Recherche"
      className="search-dialog m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-linen"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="search-panel flex h-dvh w-full flex-col overflow-hidden bg-ink sm:mx-auto sm:mt-[max(4.5rem,10vh)] sm:h-auto sm:max-h-[min(80vh,48rem)] sm:w-[calc(100%-2*var(--gutter))] sm:max-w-3xl sm:rounded-[var(--radius-card)] sm:border sm:border-line-strong">
        {/* Champ */}
        <form
          role="search"
          action={`${BASE_PATH}/search/`}
          className="flex shrink-0 items-center gap-3 border-b border-line px-4 sm:px-6"
          onSubmit={(event) => {
            event.preventDefault();
            showAll();
          }}
        >
          <Search size={22} className="shrink-0 text-flamingo" />
          <label htmlFor="site-search" className="sr-only">
            Rechercher une galerie, une équipe, un match, une date
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            placeholder="Équipe, match, date, catégorie…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              if (!event.target.value.trim()) setFilter("Tout");
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeEntry ? `${listId}-${activeIndex}` : undefined}
            className="h-16 w-full min-w-0 bg-transparent text-lg font-light tracking-[-0.015em] text-linen outline-none placeholder:text-ash sm:h-[4.5rem] sm:text-xl [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("Tout");
                setActive(0);
                document.getElementById("site-search")?.focus();
              }}
              className="shrink-0 rounded-full px-3 py-1.5 text-[0.8125rem] text-taupe transition-colors hover:bg-wash-strong hover:text-linen"
            >
              Effacer
            </button>
          ) : null}
          <button
            type="button"
            onClick={close}
            className="-mr-1 grid size-10 shrink-0 place-items-center rounded-full text-taupe transition-colors hover:bg-wash-strong hover:text-linen"
            aria-label="Fermer la recherche"
          >
            <Close size={20} />
          </button>
        </form>

        {/* Filtres */}
        {trimmed && allResults.length ? (
          <div role="group" aria-label="Filtrer les résultats" className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-line px-4 py-3 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
            {(["Tout", ...SEARCH_TYPES] as Filter[]).map((f) => {
              const count = counts[f] ?? 0;
              if (f !== "Tout" && !count) return null;
              const selected = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setFilter(f);
                    setActive(0);
                    document.getElementById("site-search")?.focus();
                  }}
                  className={`flex h-8 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[0.8125rem] transition-colors ${
                    selected ? "border-linen bg-linen text-ink" : "border-line text-taupe hover:border-line-strong hover:text-linen"
                  }`}
                >
                  {f === "Tout" ? "Tout" : SEARCH_TYPE_PLURAL[f]}
                  <span className={`font-mono text-[0.6875rem] ${selected ? "text-ink/70" : "text-ash"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Résultats */}
        <div ref={listRef} id={listId} role="listbox" aria-label="Résultats de recherche" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3">
          <p className="sr-only" aria-live="polite">
            {trimmed ? (results.length ? `${results.length} résultat${results.length > 1 ? "s" : ""}` : "Aucun résultat") : ""}
          </p>

          {trimmed && !results.length ? (
            <EmptyState query={trimmed} categories={categories} onPick={(item) => go(item)} onClose={close} />
          ) : (
            sections.map((section) => {
              const offset = flat.indexOf(section.entries[0]);
              return (
                <section key={section.title} className="mb-3 last:mb-0" role="group" aria-label={section.title}>
                  <div className="flex items-center justify-between px-3 pt-2 pb-2">
                    <h3 className="t-mono text-ash">
                      {section.title}
                      {trimmed ? <span className="ml-2 text-ash/70">{section.entries.length}</span> : null}
                    </h3>
                    {section.title === "Récentes" ? (
                      <button type="button" onClick={clearRecent} className="t-mono text-ash transition-colors hover:text-linen">
                        Effacer
                      </button>
                    ) : null}
                  </div>

                  {section.layout === "tiles" ? (
                    <div className="grid grid-cols-2 gap-2 px-1 sm:grid-cols-4">
                      {section.entries.map((entry, i) => (
                        <Tile key={entry.key} entry={entry} id={`${listId}-${offset + i}`} active={offset + i === activeIndex} onHover={() => setActive(offset + i)} onSelect={() => go(entry.item)} />
                      ))}
                    </div>
                  ) : (
                    section.entries.map((entry, i) => (
                      <Row
                        key={`${entry.key}-${trimmed}`}
                        entry={entry}
                        id={`${listId}-${offset + i}`}
                        query={trimmed}
                        recent={entry.section === "recent"}
                        order={offset + i}
                        active={offset + i === activeIndex}
                        onHover={() => setActive(offset + i)}
                        onSelect={() => go(entry.item)}
                      />
                    ))
                  )}
                </section>
              );
            })
          )}
        </div>

        {/* Pied */}
        <div className="hidden shrink-0 items-center justify-between gap-4 border-t border-line px-6 py-3 t-mono text-ash sm:flex">
          <span>{trimmed && allResults.length ? `${allResults.length} résultat${allResults.length > 1 ? "s" : ""}` : "Hockey · Rugby · Football"}</span>
          {trimmed && allResults.length ? (
            <button type="button" onClick={showAll} className="group flex items-center gap-2 text-linen">
              Voir tous les résultats
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <Link href="/galeries" onClick={close} className="group flex items-center gap-2 text-linen">
              Trouver mes photos
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </dialog>
  );
}

function readRecent(): SearchItem[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as SearchItem[];
  } catch {
    return [];
  }
}

/* --- Éléments ------------------------------------------------------------ */

type ItemProps = { entry: Entry; id: string; active: boolean; onHover: () => void; onSelect: () => void };

function Row({ entry, id, query, recent, order, active, onHover, onSelect }: ItemProps & { query: string; recent?: boolean; order: number }) {
  const { item } = entry;
  return (
    <Link
      id={id}
      href={item.href}
      role="option"
      aria-selected={active}
      tabIndex={-1}
      data-entry={entry.key}
      onMouseMove={onHover}
      onClick={(event) => {
        event.preventDefault();
        onSelect();
      }}
      className={`result-in group flex items-center gap-4 rounded-[var(--radius-btn)] px-3 py-2.5 transition-colors duration-150 ${active ? "bg-wash-strong" : ""}`}
      style={{ "--i": order } as CSSProperties}
    >
      <Thumb item={item} recent={recent} size="size-12" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-medium text-linen">
          <Highlight text={item.title} query={query} />
        </span>
        <span className="mt-0.5 block truncate text-xs text-taupe">
          <ResultMeta item={item} query={query} />
        </span>
      </span>
      <span className="hidden shrink-0 t-mono text-ash sm:inline">{item.type}</span>
      <span className={`grid size-8 shrink-0 place-items-center rounded-full transition-[opacity,background-color] ${active ? "bg-flamingo text-ink opacity-100" : "opacity-0"}`} aria-hidden>
        <ArrowUpRight size={14} />
      </span>
    </Link>
  );
}

function Tile({ entry, id, active, onHover, onSelect }: ItemProps) {
  const { item } = entry;
  return (
    <Link
      id={id}
      href={item.href}
      role="option"
      aria-selected={active}
      tabIndex={-1}
      data-entry={entry.key}
      onMouseMove={onHover}
      onClick={(event) => {
        event.preventDefault();
        onSelect();
      }}
      className={`group relative block overflow-hidden rounded-[var(--radius-btn)] outline-offset-2 transition-[outline-color] ${active ? "outline-2 outline-flamingo outline-solid" : "outline-transparent"}`}
    >
      <span className="relative block aspect-[4/5]" style={{ backgroundColor: item.thumb?.color }}>
        {item.thumb ? (
          <Image src={item.thumb.src} alt="" fill sizes="(min-width: 640px) 180px, 45vw" className={`object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] ${active ? "scale-105" : ""}`} />
        ) : null}
        <span aria-hidden className="scrim-bottom absolute inset-0" />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-3">
        <span className="block truncate text-sm font-medium text-linen">{item.title}</span>
        <span className="block truncate t-mono text-linen/70">{item.date ?? `${item.count ?? 0} photos`}</span>
      </span>
    </Link>
  );
}

function EmptyState({ query, categories, onPick, onClose }: { query: string; categories: SearchItem[]; onPick: (item: SearchItem) => void; onClose: () => void }) {
  return (
    <div className="px-4 py-10 text-center sm:py-14">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-wash-strong text-taupe">
        <Search size={20} />
      </span>
      <p className="mt-5 text-xl font-light tracking-[-0.02em] text-linen">Aucun résultat pour « {query} »</p>
      <p className="mx-auto mt-2 max-w-sm t-small text-taupe">Vérifiez l&apos;orthographe ou essayez une catégorie :</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c.href}
            type="button"
            onClick={() => onPick(c)}
            className="h-9 rounded-full border border-line px-4 text-[0.8125rem] text-taupe transition-colors hover:border-line-strong hover:text-linen"
          >
            {c.title}
          </button>
        ))}
      </div>
      <p className="mt-8 t-small text-taupe">
        Votre match n&apos;est pas en ligne ?{" "}
        <Link href="/contact/?projet=demande-photo" onClick={onClose} className="text-linen underline underline-offset-4">
          Écrivez-moi
        </Link>
      </p>
    </div>
  );
}
