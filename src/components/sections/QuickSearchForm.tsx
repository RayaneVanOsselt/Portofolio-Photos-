"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ArrowRight, Search } from "@/components/ui/Icons";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Champ « Trouver mes photos » : envoie vers la page Galeries (?q=…),
 * où la recherche se poursuit instantanément. Fonctionne aussi sans JavaScript.
 */
export function QuickSearchForm({ placeholder = "Équipe, match, date…", tone = "ink" }: { placeholder?: string; tone?: "ink" | "linen" }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const id = useId();
  const ink = tone === "ink";

  return (
    <form
      role="search"
      action={`${BASE_PATH}/galeries/`}
      onSubmit={(event) => {
        event.preventDefault();
        const q = value.trim();
        router.push(q ? `/galeries/?q=${encodeURIComponent(q)}` : "/galeries/");
      }}
      className={`flex h-14 w-full items-center gap-3 rounded-full pr-1.5 pl-5 transition-[box-shadow] duration-300 md:h-16 ${
        ink ? "bg-ink text-linen focus-within:ring-2 focus-within:ring-ink/40" : "border border-line-strong bg-wash text-linen focus-within:border-linen"
      }`}
    >
      <Search size={20} className="shrink-0 text-taupe" />
      <label htmlFor={id} className="sr-only">
        Rechercher une galerie : équipe, match, date
      </label>
      <input
        id={id}
        name="q"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="h-full w-full min-w-0 bg-transparent text-base text-linen outline-none placeholder:text-taupe md:text-lg [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-medium transition-colors md:h-[3.25rem] md:px-6 ${
          ink ? "bg-flamingo text-ink hover:bg-tango" : "bg-flamingo text-ink hover:bg-tango"
        }`}
      >
        <span className="hidden sm:inline">Rechercher</span>
        <ArrowRight size={18} className="sm:hidden" />
        <span className="sr-only sm:hidden">Rechercher</span>
      </button>
    </form>
  );
}
