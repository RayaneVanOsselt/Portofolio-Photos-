"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ArrowUpRight, Search } from "@/components/ui/Icons";
import { SEARCH_TYPES, searchItems, type SearchItem } from "@/lib/search";
import { Highlight, Thumb } from "./SearchParts";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const PLURAL: Record<SearchItem["type"], string> = { Rubrique: "Rubriques", Équipe: "Équipes", Série: "Séries", Service: "Services", Page: "Pages" };

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
  const [filter, setFilter] = useState<SearchItem["type"] | "Tout">("Tout");
  const all = useMemo(() => (query ? searchItems(index, query, 60) : []), [index, query]);
  const shown = filter === "Tout" ? all : all.filter((r) => r.type === filter);
  const categories = index.filter((i) => i.type === "Rubrique");
  const groups = SEARCH_TYPES.map((type) => ({ type, items: shown.filter((r) => r.type === type) })).filter((g) => g.items.length);

  return (
    <>
      <form
        role="search"
        action={`${BASE_PATH}/search/`}
        className="mt-10 flex items-center gap-4 rounded-[var(--radius-lg)] border border-line bg-deep px-5 transition-colors focus-within:border-phosphor/60 md:px-7"
        onSubmit={(event) => {
          event.preventDefault();
          const q = new FormData(event.currentTarget).get("q")?.toString().trim() ?? "";
          router.replace(q ? `/search/?q=${encodeURIComponent(q)}` : "/search/", { scroll: false });
        }}
      >
        <Search size={24} className="shrink-0 text-phosphor" />
        <label htmlFor="q" className="sr-only">
          Rechercher
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          enterKeyHint="search"
          placeholder="Une équipe, une compétition, un service…"
          className="h-16 w-full min-w-0 bg-transparent text-lg text-platinum outline-none placeholder:text-silver/60 md:h-20 md:text-2xl [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" className="hidden h-11 shrink-0 items-center rounded-[var(--radius-sm)] bg-kelp px-5 t-label text-platinum transition-colors hover:bg-[#0a4743] sm:inline-flex">
          Rechercher
        </button>
      </form>

      {query ? (
        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="t-small text-silver" aria-live="polite">
            {all.length ? (
              <>
                <span className="font-medium text-platinum t-tabular">{all.length}</span> résultat{all.length > 1 ? "s" : ""} pour « <span className="text-platinum">{query}</span> »
              </>
            ) : (
              <>Aucun résultat pour « {query} ».</>
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
                    className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-medium tracking-[0.04em] transition-colors ${
                      selected ? "border-phosphor/60 bg-phosphor/10 text-platinum" : "border-line text-silver hover:border-line-strong hover:text-platinum"
                    }`}
                  >
                    {type === "Tout" ? "Tout" : PLURAL[type]}
                    <span className={`t-tabular ${selected ? "text-phosphor" : "text-silver/70"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-8 t-small text-silver">Saisissez un terme, ou choisissez une rubrique :</p>
      )}

      {groups.map((group) => (
        <section key={group.type} aria-label={PLURAL[group.type]} className="mt-12">
          <h2 className="flex items-center gap-3 t-caption text-silver">
            {PLURAL[group.type]}
            <span className="t-tabular text-silver/60">{group.items.length}</span>
          </h2>
          <ul className="mt-4 border-t border-line">
            {group.items.map((item) => (
              <li key={item.href} className="border-b border-line">
                <Link href={item.href} className="group flex items-center gap-5 py-5">
                  <Thumb item={item} size="size-16" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xl font-medium tracking-[-0.02em] text-platinum transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 md:text-2xl">
                      <Highlight text={item.title} query={query} />
                    </span>
                    <span className="mt-1 block truncate t-small text-silver">
                      <Highlight text={item.context} query={query} />
                    </span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-kelp-soft text-platinum transition-colors group-hover:bg-kelp">
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
              <Link href={item.href} className="photo-hover group relative block overflow-hidden rounded-[var(--radius-sm)]">
                <span className="relative block aspect-[4/3]">
                  <Thumb item={item} size="size-full" sizes="(min-width: 768px) 320px, 50vw" />
                </span>
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(1_29_28/0.9))]" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block text-lg font-medium text-platinum">{item.title}</span>
                  <span className="block t-caption text-silver">{item.context}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {query && !all.length ? (
        <p className="mt-10 t-small text-silver">
          Un projet particulier ?{" "}
          <Link href="/contact" className="text-platinum underline underline-offset-4">
            Écrivez-moi
          </Link>
          .
        </p>
      ) : null}
    </>
  );
}
