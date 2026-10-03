import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ArrowUpRight, Search } from "@/components/ui/Icons";
import { buildSearchIndex } from "@/lib/search-index";
import { searchItems } from "@/lib/search";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Recherche", path: "/search", noIndex: true });

/** Page de résultats — fonctionne aussi sans JavaScript (formulaire GET). */
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 100).trim() ?? "";
  const index = buildSearchIndex();
  const results = query ? searchItems(index, query, 50) : [];
  const suggestions = index.filter((i) => i.type === "Rubrique");

  return (
    <div className="container-site pt-[calc(var(--header-height)+clamp(2.5rem,6vw,6rem))] pb-[var(--section-space)]">
      <Breadcrumbs items={[{ name: "Recherche", path: "/search" }]} />
      <h1 className="t-h1 mt-10 text-platinum md:mt-14">Recherche</h1>

      <form role="search" action="/search" className="mt-10 flex items-center gap-4 border-b border-line-strong focus-within:border-phosphor">
        <Search size={22} className="shrink-0 text-silver" />
        <label htmlFor="q" className="sr-only">
          Rechercher
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Une équipe, une compétition, un service…"
          className="h-16 w-full bg-transparent text-xl text-platinum outline-none placeholder:text-silver/60 md:text-2xl"
        />
        <button type="submit" className="t-label text-platinum">
          Rechercher
        </button>
      </form>

      <p className="mt-6 t-small text-silver" aria-live="polite">
        {query ? (results.length ? `${results.length} résultat${results.length > 1 ? "s" : ""} pour « ${query} »` : `Aucun résultat pour « ${query} ».`) : "Saisissez un terme ou choisissez une rubrique."}
      </p>

      <ul className="mt-10 border-t border-line">
        {(query ? results : suggestions).map((item) => (
          <li key={`${item.type}-${item.href}`} className="border-b border-line">
            <Link href={item.href} className="group grid grid-cols-[1fr_auto] items-center gap-6 py-6 md:grid-cols-[8rem_1fr_auto]">
              <span className="hidden t-caption text-silver md:block">{item.type}</span>
              <span>
                <span className="block t-h3 text-platinum transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">{item.title}</span>
                <span className="mt-1 block t-small text-silver">{item.context}</span>
              </span>
              <span className="grid size-9 place-items-center rounded-[var(--radius-sm)] bg-kelp-soft text-platinum transition-colors group-hover:bg-kelp">
                <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {query && !results.length ? (
        <p className="mt-10 t-small text-silver">
          Vous ne trouvez pas ? Parcourez le{" "}
          <Link href="/portfolio" className="text-platinum underline underline-offset-4">
            portfolio
          </Link>{" "}
          ou{" "}
          <Link href="/contact" className="text-platinum underline underline-offset-4">
            écrivez-moi
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
