"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { Gallery, type GalleryItem } from "@/components/gallery/Gallery";

export type FilterOption = { slug: string; title: string; count: number };
export type FilterableItem = GalleryItem & { group: string };

type Props = { filters: FilterOption[]; items: FilterableItem[] };

const PARAM = "rubrique";

/** Galerie complète avec filtres par rubrique (état partagé via l'URL : ?rubrique=…). */
export function FilterableGallery(props: Props) {
  return (
    <Suspense fallback={<FilterableGalleryView {...props} active="all" onSelect={() => {}} />}>
      <FilterableGalleryWithUrl {...props} />
    </Suspense>
  );
}

function FilterableGalleryWithUrl(props: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requested = params.get(PARAM) ?? "all";
  const active = props.filters.some((f) => f.slug === requested) ? requested : "all";

  const select = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug === "all") next.delete(PARAM);
    else next.set(PARAM, slug);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return <FilterableGalleryView {...props} active={active} onSelect={select} />;
}

function FilterableGalleryView({ filters, items, active, onSelect }: Props & { active: string; onSelect: (slug: string) => void }) {
  const shown = useMemo(() => (active === "all" ? items : items.filter((item) => item.group === active)), [items, active]);
  const options = [{ slug: "all", title: "Tout", count: items.length }, ...filters];

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-[var(--gutter)] mb-10 border-b border-line bg-abyss/90 px-[var(--gutter)] backdrop-blur-xl md:mb-14">
        <div role="group" aria-label="Filtrer par rubrique" className="flex gap-6 overflow-x-auto py-4 [scrollbar-width:none] md:gap-9 [&::-webkit-scrollbar]:hidden">
          {options.map((option) => {
            const selected = option.slug === active;
            return (
              <button
                key={option.slug}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(option.slug)}
                className={`group flex shrink-0 items-baseline gap-2 py-1 t-nav transition-colors ${selected ? "text-platinum" : "text-silver hover:text-platinum"}`}
              >
                <span className={`link-underline ${selected ? "[background-size:100%_1px]" : ""}`}>{option.title}</span>
                <sup className={`t-tabular text-[0.625rem] ${selected ? "text-phosphor" : "text-silver"}`}>{option.count}</sup>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} photos affichées
      </p>
      <Gallery key={active} items={shown} label="Toutes les photos du portfolio" />
    </div>
  );
}
