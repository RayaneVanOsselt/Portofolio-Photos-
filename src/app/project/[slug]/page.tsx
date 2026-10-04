import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientRedirect } from "@/components/effects/ClientRedirect";
import { getAllProjects, getProjectBySlug } from "@/lib/portfolio";

/**
 * Ancienne adresse des galeries (/project/<slug>) → /galeries/<slug>.
 * Gardée pour ne casser aucun lien déjà partagé (photos comprises).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/project/[slug]">): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    alternates: { canonical: `${project.href}/` },
    robots: { index: false, follow: true },
  };
}

export default async function LegacyProjectPage({ params }: PageProps<"/project/[slug]">) {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();
  const target = `${project.href}/`;

  return (
    <section className="container-site page-top section-sm">
      <meta httpEquiv="refresh" content={`0; url=${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${target}`} />
      <ClientRedirect to={target} />
      <p className="t-mono text-ash">Cette galerie a déménagé</p>
      <p className="mt-4 t-lead text-taupe">
        Redirection vers{" "}
        <Link href={target} className="text-linen underline underline-offset-4">
          {project.title}
        </Link>
        …
      </p>
    </section>
  );
}
