import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SearchResults } from "@/components/search/SearchResults";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { buildSearchIndex } from "@/lib/search-index";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Recherche", path: "/search", noIndex: true });

/** Page de résultats de recherche (la requête est lue dans l'URL côté navigateur). */
export default function SearchPage() {
  return (
    <div className="container-site page-top pb-[var(--section-space)]">
      <Breadcrumbs items={[{ name: "Recherche", path: "/search" }]} />
      <div className="mt-10 md:mt-14">
        <SectionLabel>Tout le site</SectionLabel>
      </div>
      <h1 className="t-h1 mt-6 text-linen">Recherche</h1>

      <SearchResults index={buildSearchIndex()} />
    </div>
  );
}
