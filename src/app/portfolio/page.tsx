import type { Metadata } from "next";
import Link from "next/link";
import { ClientRedirect } from "@/components/effects/ClientRedirect";
import { ALBUMS_HREF } from "@/lib/albums";

/**
 * Ancienne adresse de la section (/portfolio) → /albums.
 * Gardée pour ne casser aucun favori ni lien déjà partagé.
 */
export const metadata: Metadata = {
  title: "Albums",
  alternates: { canonical: `${ALBUMS_HREF}/` },
  robots: { index: false, follow: true },
};

export default function LegacyPortfolioPage() {
  const target = `${ALBUMS_HREF}/`;
  return (
    <section className="container-site page-top section-sm">
      <meta httpEquiv="refresh" content={`0; url=${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${target}`} />
      <ClientRedirect to={target} />
      <p className="t-mono text-ash">Le portfolio devient « Albums »</p>
      <p className="mt-4 t-lead text-taupe">
        Redirection vers{" "}
        <Link href={target} className="text-linen underline underline-offset-4">
          les albums
        </Link>
        …
      </p>
    </section>
  );
}
