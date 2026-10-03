import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SearchResults } from "@/components/search/SearchResults";
import { buildSearchIndex } from "@/lib/search-index";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Recherche", path: "/search", noIndex: true });

/** Page de résultats de recherche (la requête est lue dans l'URL côté navigateur). */
export default function SearchPage() {
  return (
    <div className="container-site pt-[calc(var(--header-height)+clamp(2.5rem,6vw,6rem))] pb-[var(--section-space)]">
      <Breadcrumbs items={[{ name: "Recherche", path: "/search" }]} />
      <h1 className="t-h1 mt-10 text-platinum md:mt-14">Recherche</h1>

      <SearchResults index={buildSearchIndex()} />
    </div>
  );
}
