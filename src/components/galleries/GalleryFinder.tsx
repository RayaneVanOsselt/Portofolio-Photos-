"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useDeferredValue, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { Highlight } from "@/components/search/SearchParts";
import { ArrowUpRight, Close, Search } from "@/components/ui/Icons";
import type { GalleryEntry, GalleryFilter } from "@/lib/gallery-index";
import { scoreText, tokenize } from "@/lib/search";
import { pad } from "@/lib/utils";

type Props = {
  entries: GalleryEntry[];
  filters: GalleryFilter[];
  /** Recherches proposées tant que le champ est vide. */
  suggestions: string[];
};

/** Recherche instantanée des galeries : nom, équipe, adversaire, date, catégorie, lieu. */
export function GalleryFinder(props: Props) {
  return (
    <Suspense fallback={<FinderView {...props} initialQuery="" />}>
      <FinderFromUrl {...props} />
    </Suspense>
  );
}

function FinderFromUrl(props: Props) {
  const q = (useSearchParams().get("q") ?? "").slice(0, 100);
  return <FinderView {...props} initialQuery={q} />;
}

function FinderView({ entries, filters, suggestions, initialQuery }: Props & { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  // Nouvelle recherche arrivée par l'adresse (ex. depuis l'accueil) : on la reprend.
  // L'adresse que la page met elle-même à jour (même texte) ne change rien.
  const [prevInitial, setPrevInitial] = useState(initialQuery);
  if (initialQuery !== prevInitial) {
    setPrevInitial(initialQuery);
    if (initialQuery !== query.trim()) setQuery(initialQuery);
  }
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("all");
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const listId = useId();

  const years = useMemo(() => [...new Set(entries.map((e) => e.year).filter(Boolean) as string[])].sort().reverse(), [entries]);

  // Galeries correspondant à la recherche et à l'année (avant le filtre de catégorie).
  const matched = useMemo(() => {
    const tokens = tokenize(deferred);
    const pool = entries.filter((e) => year === "all" || e.year === year);
    if (!tokens.length) return pool;
    return pool
      .map((entry, order) => ({ entry, order, score: scoreText(entry.title, `${entry.context} ${entry.keywords}`, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.order - b.order)
      .map((r) => r.entry);
  }, [entries, deferred, year]);
  const results = category === "all" ? matched : matched.filter((e) => e.root === category);
  // Les compteurs des filtres suivent la recherche en cours.
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: matched.length };
    for (const e of matched) c[e.root] = (c[e.root] ?? 0) + 1;
    return c;
  }, [matched]);
  const hasDates = useMemo(() => entries.some((e) => e.date), [entries]);

  // L'adresse reflète la recherche (lien partageable), sans entrée d'historique.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const url = new URL(location.href);
      if (query.trim()) url.searchParams.set("q", query.trim());
      else url.searchParams.delete("q");
      history.replaceState(history.state, "", url);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const trimmed = deferred.trim();
  const filtered = category !== "all" || year !== "all";
  const reset = () => {
    setQuery("");
    setCategory("all");
    setYear("all");
    inputRef.current?.focus();
  };

  return (
    <div>
      {/* Champ de recherche */}
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          document.getElementById(listId)?.querySelector<HTMLElement>("a")?.focus();
        }}
        className="group flex h-16 items-center gap-4 rounded-full border border-line-strong bg-wash pr-2 pl-6 transition-[border-color,background-color] duration-300 focus-within:border-linen focus-within:bg-wash-strong md:h-20 md:pl-8"
      >
        <Search size={22} className="shrink-0 text-taupe transition-colors group-focus-within:text-flamingo" />
        <label htmlFor={inputId} className="sr-only">
          Rechercher une galerie : équipe, adversaire, date, catégorie
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Équipe, match, date (ex. « octobre 2026 »)…"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-controls={listId}
          aria-describedby={`${listId}-count`}
          className="h-full w-full min-w-0 bg-transparent text-lg font-light tracking-[-0.01em] text-linen outline-none placeholder:text-ash md:text-2xl [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="grid size-11 shrink-0 place-items-center rounded-full text-taupe transition-colors hover:bg-wash-strong hover:text-linen md:size-14"
            aria-label="Effacer la recherche"
          >
            <Close size={20} />
          </button>
        ) : null}
      </form>

      {/* Suggestions */}
      {!query ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 t-mono text-ash">Essayez</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s);
                inputRef.current?.focus();
              }}
              className="h-9 rounded-full bg-wash px-4 text-[0.8125rem] text-linen/90 transition-colors hover:bg-wash-strong hover:text-linen"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      {/* Filtres */}
      <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filtrer par catégorie" className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden">
          {[{ slug: "all", title: "Toutes" }, ...filters].map((f) => (
            <Chip key={f.slug} selected={category === f.slug} onClick={() => setCategory(f.slug)} count={counts[f.slug] ?? 0}>
              {f.title}
            </Chip>
          ))}
        </div>
        {years.length > 1 ? (
          <div role="group" aria-label="Filtrer par année" className="flex flex-wrap gap-2">
            {["all", ...years].map((y) => (
              <Chip key={y} selected={year === y} onClick={() => setYear(y)}>
                {y === "all" ? "Toutes années" : y}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      <p id={`${listId}-count`} className="mt-8 t-mono text-ash" aria-live="polite">
        <span className="text-linen">{pad(results.length)}</span> galerie{results.length > 1 ? "s" : ""}
        {trimmed ? <> pour « {trimmed} »</> : null}
        <span className="hidden sm:inline"> · les plus récentes d&apos;abord</span>
      </p>

      {/* Résultats */}
      {results.length ? (
        <ul id={listId} className="mt-4 border-t border-line" aria-label="Galeries">
          {results.map((entry, i) => (
            <li key={`${entry.slug}-${trimmed}-${category}-${year}`} className="result-in border-b border-line" style={{ "--i": i } as CSSProperties}>
              <ResultRow entry={entry} query={trimmed} hasDates={hasDates} />
            </li>
          ))}
        </ul>
      ) : (
        <div id={listId} className="mt-4 rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-14 text-center md:py-20">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-wash-strong text-taupe">
            <Search size={20} />
          </span>
          <p className="mt-6 text-xl font-light tracking-[-0.02em] text-linen">Aucune galerie {trimmed ? <>pour « {trimmed} »</> : "avec ces filtres"}</p>
          <p className="mx-auto mt-2 max-w-md t-small text-taupe">Vérifiez l&apos;orthographe, essayez le nom d&apos;une équipe ou retirez un filtre.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {trimmed || filtered ? (
              <button type="button" onClick={reset} className="h-11 rounded-full bg-wash-strong px-5 text-[0.9375rem] text-linen transition-colors hover:bg-[rgb(231_231_216/0.16)]">
                Tout afficher
              </button>
            ) : null}
            <Link href="/contact/?projet=demande-photo" className="flex h-11 items-center rounded-full border border-line-strong px-5 text-[0.9375rem] text-linen transition-colors hover:bg-wash-strong">
              Votre match n&apos;est pas en ligne ? Écrivez-moi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ selected, onClick, count, children }: { selected: boolean; onClick: () => void; count?: number; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-[0.8125rem] transition-colors duration-300 ${
        selected ? "border-linen bg-linen text-ink" : "border-line text-taupe hover:border-line-strong hover:text-linen"
      }`}
    >
      {children}
      {count !== undefined ? <span className={`font-mono text-[0.6875rem] ${selected ? "text-ink/70" : "text-ash"}`}>{count}</span> : null}
    </button>
  );
}

function ResultRow({ entry, query, hasDates }: { entry: GalleryEntry; query: string; hasDates: boolean }) {
  return (
    <Link
      href={entry.href}
      className={`group grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-4 transition-colors duration-300 hover:bg-wash sm:grid-cols-[8rem_1fr_auto] md:gap-6 md:px-3 ${
        hasDates ? "md:grid-cols-[8.5rem_7.5rem_1fr_9rem_auto]" : "md:grid-cols-[8.5rem_1fr_9rem_auto]"
      }`}
    >
      <span className="photo-frame relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)]" style={{ "--photo-color": entry.cover.color } as CSSProperties}>
        <Image src={entry.cover.src} alt="" fill sizes="(min-width: 640px) 136px, 88px" className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
      </span>
      {hasDates ? <span className="hidden t-mono text-taupe md:block">{entry.dateShort ?? "—"}</span> : null}
      <span className="min-w-0">
        <span className="block t-mono text-ash md:hidden">{[entry.dateShort, entry.event].filter(Boolean).join(" · ") || entry.context}</span>
        <span className="mt-1 line-clamp-2 block text-lg leading-snug font-medium tracking-[-0.015em] text-linen md:mt-0 md:truncate md:text-xl">
          <Highlight text={entry.title} query={query} />
        </span>
        <span className="mt-0.5 block truncate t-small text-taupe">
          <Highlight text={entry.context} query={query} />
          {entry.location ? ` · ${entry.location}` : ""}
        </span>
      </span>
      <span className="hidden t-mono text-taupe md:block">
        {entry.event ? <span className="block">{entry.event}</span> : null}
        <span className="block text-ash">{entry.count} photos</span>
      </span>
      <span className="flex items-center gap-3">
        <span className="hidden text-[0.875rem] text-linen lg:inline">Voir la galerie</span>
        <span className="grid size-10 place-items-center rounded-full border border-line-strong text-linen transition-[background-color,border-color,color] duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
          <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
        </span>
      </span>
    </Link>
  );
}
