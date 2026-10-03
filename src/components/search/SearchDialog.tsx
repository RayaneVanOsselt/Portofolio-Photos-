"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Close, Search } from "@/components/ui/Icons";
import { useAnimatedDialog } from "@/hooks/useAnimatedDialog";
import { searchItems, type SearchItem } from "@/lib/search";

type Props = {
  open: boolean;
  onClose: () => void;
  index: SearchItem[];
};

export function SearchDialog({ open, onClose, index }: Props) {
  const router = useRouter();
  const dialogRef = useAnimatedDialog(open, onClose, 350);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const results = useMemo(() => searchItems(index, query, 8), [index, query]);
  const suggestions = useMemo(() => index.filter((item) => item.type === "Rubrique"), [index]);
  const shown = query.trim() ? results : suggestions;
  const activeIndex = Math.min(active, Math.max(shown.length - 1, 0));

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((activeIndex + 1) % Math.max(shown.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((activeIndex - 1 + shown.length) % Math.max(shown.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = shown[activeIndex];
      if (target) go(target.href);
      else if (query.trim()) go(`/search/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Recherche"
      className="search-dialog m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-mist backdrop:bg-transparent"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="search-panel mx-auto mt-[max(4.5rem,10vh)] w-[calc(100%-2*var(--gutter))] max-w-2xl overflow-hidden rounded-[var(--radius-lg)] bg-deep">
        <form
          role="search"
          action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search/`}
          className="flex items-center gap-3 border-b border-line px-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (query.trim()) go(`/search/?q=${encodeURIComponent(query.trim())}`);
          }}
        >
          <Search size={20} className="shrink-0 text-silver" />
          <label htmlFor="site-search" className="sr-only">
            Rechercher une rubrique, une équipe, une série ou un service
          </label>
          <input
            ref={inputRef}
            id="site-search"
            name="q"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Rechercher — Red Lions, Daring, rugby…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={shown.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={shown.length ? `${listId}-${activeIndex}` : undefined}
            className="h-16 w-full min-w-0 bg-transparent text-lg text-platinum outline-none placeholder:text-silver/70 [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)] text-silver transition-colors hover:text-platinum"
            aria-label="Fermer la recherche"
          >
            <Close size={18} />
          </button>
        </form>

        <div className="max-h-[min(60vh,32rem)] overflow-y-auto overscroll-contain p-2">
          <p className="px-3 pt-3 pb-2 t-caption text-silver" aria-live="polite">
            {query.trim()
              ? results.length
                ? `${results.length} résultat${results.length > 1 ? "s" : ""}`
                : "Aucun résultat"
              : "Rubriques"}
          </p>

          <ul id={listId} role="listbox" aria-label="Résultats">
            {shown.map((item, i) => (
              <li key={`${item.type}-${item.href}`} id={`${listId}-${i}`} role="option" aria-selected={i === activeIndex}>
                <ResultRow item={item} active={i === activeIndex} onHover={() => setActive(i)} onSelect={() => go(item.href)} />
              </li>
            ))}
          </ul>

          {query.trim() && !results.length ? (
            <p className="px-3 pb-4 text-sm text-silver">
              Essayez un nom d&apos;équipe, de compétition ou de sport — ou{" "}
              <Link href="/contact" onClick={onClose} className="text-platinum underline underline-offset-4">
                écrivez-moi directement
              </Link>
              .
            </p>
          ) : null}
        </div>

        <div className="hidden items-center justify-between border-t border-line px-5 py-3 t-caption text-silver sm:flex">
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> naviguer · <Kbd>Entrée</Kbd> ouvrir · <Kbd>Échap</Kbd> fermer
          </span>
          {query.trim() ? (
            <Link href={`/search/?q=${encodeURIComponent(query.trim())}`} onClick={onClose} className="inline-flex items-center gap-2 text-platinum">
              Tous les résultats <ArrowRight size={14} />
            </Link>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

function ResultRow({ item, active, onHover, onSelect }: { item: SearchItem; active: boolean; onHover: () => void; onSelect: () => void }) {
  return (
    <Link
      href={item.href}
      tabIndex={-1}
      onMouseMove={onHover}
      onClick={(event) => {
        event.preventDefault();
        onSelect();
      }}
      className={`flex items-center gap-4 rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors ${active ? "bg-kelp" : ""}`}
    >
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-sm)] bg-kelp" style={{ backgroundColor: item.thumb?.color }}>
        {item.thumb ? (
          <Image src={item.thumb.src} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          <span className="t-caption text-silver">{item.type.slice(0, 2)}</span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] text-platinum">{item.title}</span>
        <span className="block truncate text-xs text-silver">{item.context}</span>
      </span>
      <span className="t-caption text-silver">{item.type}</span>
    </Link>
  );
}

function Kbd({ children }: { children: string }) {
  return <kbd className="rounded-[4px] border border-line px-1.5 py-0.5 font-sans text-[0.625rem] text-mist">{children}</kbd>;
}
