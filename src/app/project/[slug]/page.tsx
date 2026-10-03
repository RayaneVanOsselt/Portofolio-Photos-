import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery/Gallery";
import { MetaList, PageIntro } from "@/components/layout/PageIntro";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { getAdjacentProjects, getCategoryTrail, getProjectBySlug, getProjects } from "@/lib/portfolio";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/project/[slug]">): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  if (!project) return {};
  const where = getCategoryTrail(project.category).map((c) => c.title).join(" · ");
  return pageMetadata({
    title: project.title,
    description: `Série photo ${project.title} — ${where}. ${project.photos.length} photos.`,
    path: project.href,
  });
}

export default async function ProjectPage({ params }: PageProps<"/project/[slug]">) {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();

  const trail = getCategoryTrail(project.category);
  const { previous, next } = getAdjacentProjects(project);
  const context = trail.map((c) => c.title).join(" · ");

  return (
    <>
      <PageIntro
        size="h1"
        crumbs={[{ name: "Portfolio", path: "/portfolio" }, ...trail.map((c) => ({ name: c.title, path: c.href })), { name: project.title, path: project.href }]}
        kicker={context}
        title={project.title}
        intro={<p>{project.description}</p>}
        aside={
          <div className="space-y-6">
            <MetaList items={[{ label: "Photos", value: project.photos.length }]} />
            {project.date || project.location ? (
              <p className="t-small text-silver">{[project.date ? formatDate(project.date) : null, project.location].filter(Boolean).join(" · ")}</p>
            ) : null}
          </div>
        }
      />

      <section aria-label={`Photos — ${project.title}`} className="container-wide pb-[var(--section-space)]">
        <Gallery items={project.photos.map((photo) => ({ photo, title: project.title, context }))} label={`Photos — ${project.title}`} priorityCount={2} />
      </section>

      <nav aria-label="Autres séries" className="container-wide grid border-y border-line md:grid-cols-2">
        <AdjacentLink project={previous} direction="previous" />
        <AdjacentLink project={next} direction="next" />
      </nav>

      <div className="h-[var(--section-space-sm)]" />
      <ClosingCta />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: project.title,
          description: project.description,
          url: absoluteUrl(project.href),
          author: { "@id": absoluteUrl("/#business") },
          ...(project.date ? { dateCreated: project.date } : {}),
          image: project.photos.slice(0, 10).map((photo) => ({
            "@type": "ImageObject",
            contentUrl: photo.src.startsWith("http") ? photo.src : absoluteUrl(photo.src),
            description: photo.alt,
            creator: { "@type": "Organization", name: photo.credit ? photo.credit.name : siteConfig.name },
          })),
        }}
      />
    </>
  );
}

function AdjacentLink({ project, direction }: { project: Project; direction: "previous" | "next" }) {
  const isNext = direction === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;
  return (
    <Link
      href={project.href}
      className={`group flex items-center gap-6 py-8 md:py-12 ${isNext ? "justify-end border-t border-line text-right md:border-t-0 md:border-l md:pl-10" : "md:pr-10"}`}
      data-cursor="follow"
    >
      {!isNext ? <Icon size={22} className="shrink-0 text-silver transition-transform duration-500 group-hover:-translate-x-1" /> : null}
      <span>
        <span className="block t-caption text-silver">{isNext ? "Série suivante" : "Série précédente"}</span>
        <span className="mt-2 block t-h3 text-platinum">
          <span className="link-underline">{project.title}</span>
        </span>
      </span>
      {isNext ? <Icon size={22} className="shrink-0 text-silver transition-transform duration-500 group-hover:translate-x-1" /> : null}
    </Link>
  );
}
