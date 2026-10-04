"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type CSSProperties } from "react";
import { ArrowUpRight, Search } from "@/components/ui/Icons";
import { SEARCH_TYPE_PLURAL, SEARCH_TYPES, searchItems, type SearchItem, type SearchType } from "@/lib/search";
import { Highlight, ResultMeta, Thumb } from "./SearchParts";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Résultats calculés dans le navigateur à partir de l'index généré au build (?q=…). */
export function SearchResults({ index }: { index: SearchItem[] }) {
  return (
    <Suspense fallback={<SearchResultsView index={index} query="" />}>
      <SearchResultsFromUrl index={index} />
    </Suspense>
  );
}

function SearchResultsFromUrl({ index }: { index: SearchItem[] }) {
  const query = (useSearchParams().get("q") ?? "").slice(0, 100).trim();
  return <SearchResultsView key={query} index={index} query={query} />;
}

function SearchResultsView({ index, query }: { index: SearchItem[]; query: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<SearchType | "Tout">("Tout");
  const all = useMemo(() => (query ? searchItems(index, query, 60) : []), [index, query]);
  const shown = filter === "Tout" ? all : all.filter((r) => r.type === filter);
  const categories = index.filter((i) => i.type === "Catégorie");
  const groups = SEARCH_TYPES.map((type) => ({ type, items: shown.filter((r) => r.type === type) })).filter((g) => g.items.length);

  return (
    <>
      <form
        role="search"
        action={`${BASE_PATH}/search/`}
        className="mt-10 flex items-center gap-4 rounded-full border border-line-strong bg-wash pr-2 pl-6 transition-colors focus-within:border-linen md:pl-8"
        onSubmit={(event) => {
          event.preventDefault();
          const q = new FormData(event.currentTarget).get("q")?.toString().trim() ?? "";
          router.replace(q ? `/search/?q=${encodeURIComponent(q)}` : "/search/", { scroll: false });
        }}
      >
        <Search size={22} className="shrink-0 text-flamingo" />
        <label htmlFor="q" className="sr-only">
          Rechercher
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          enterKeyHint="search"
          placeholder="Équipe, match, date, service…"
          className="h-16 w-full min-w-0 bg-transparent text-lg font-light text-linen outline-none placeholder:text-ash md:h-20 md:text-2xl [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" className="hidden h-12 shrink-0 items-center rounded-full bg-flamingo px-6 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-tango sm:inline-flex md:h-14">
          Rechercher
        </button>
      </form>

      {query ? (
        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="t-mono text-ash" aria-live="polite">
            {all.length ? (
              <>
                <span className="text-linen">{all.length}</span> résultat{all.length > 1 ? "s" : ""} pour « <span className="text-linen">{query}</span> »
              </>
            ) : (
              <>Aucun résultat pour « {query} »</>
            )}
          </p>
          {all.length ? (
            <div role="group" aria-label="Filtrer les résultats" className="flex flex-wrap gap-1.5">
              {(["Tout", ...SEARCH_TYPES] as const).map((type) => {
                const count = type === "Tout" ? all.length : all.filter((r) => r.type === type).length;
                if (!count) return null;
                const selected = filter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFilter(type)}
                    className={`flex h-9 items-center gap-2 rounded-full border px-4 text-[0.8125rem] transition-colors ${
                      selected ? "border-linen bg-linen text-ink" : "border-line text-taupe hover:border-line-strong hover:text-linen"
                    }`}
                  >
                    {type === "Tout" ? "Tout" : SEARCH_TYPE_PLURAL[type]}
                    <span className={`font-mono text-[0.6875rem] ${selected ? "text-ink/70" : "text-ash"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-8 t-small text-taupe">Saisissez un terme, ou choisissez une catégorie :</p>
      )}

      {groups.map((group) => (
        <section key={group.type} aria-label={SEARCH_TYPE_PLURAL[group.type]} className="mt-12">
          <h2 className="flex items-center gap-3 t-mono text-ash">
            {SEARCH_TYPE_PLURAL[group.type]}
            <span className="text-ash/70">{group.items.length}</span>
          </h2>
          <ul className="mt-4 border-t border-line">
            {group.items.map((item, i) => (
              <li key={item.href} className="result-in border-b border-line" style={{ "--i": i } as CSSProperties}>
                <Link href={item.href} className="group flex items-center gap-5 py-5 transition-colors hover:bg-wash md:px-3">
                  <Thumb item={item} size="size-16" sizes="72px" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xl font-light tracking-[-0.025em] text-linen transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 md:text-2xl">
                      <Highlight text={item.title} query={query} />
                    </span>
                    <span className="mt-1 block truncate t-small text-taupe">
                      <ResultMeta item={item} query={query} />
                    </span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-linen transition-[background-color,border-color,color] group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
                    <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {!query || !all.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {categories.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="photo-hover group relative block overflow-hidden rounded-[var(--radius-card)]">
                <span className="relative block aspect-[4/3]">
                  <Thumb item={item} size="size-full" sizes="(min-width: 768px) 320px, 50vw" />
                </span>
                <span aria-hidden className="scrim-bottom absolute inset-0" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block text-lg font-medium text-linen">{item.title}</span>
                  <span className="block t-mono text-linen/70">{item.context}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {query && !all.length ? (
        <p className="mt-10 t-small text-taupe">
          Votre match n&apos;est pas en ligne ?{" "}
          <Link href="/contact/?projet=demande-photo" className="text-linen underline underline-offset-4">
            Écrivez-moi
          </Link>
          .
        </p>
      ) : null}
    </>
  );
}
