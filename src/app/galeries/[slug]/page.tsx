import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { MatchdayView } from "@/components/football/MatchdayView";
import { ShareGalleryButton } from "@/components/galleries/ShareGalleryButton";
import { Gallery } from "@/components/gallery/Gallery";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { MatchTicket } from "@/components/portfolio/MatchTicket";
import { PhotoAccessBand } from "@/components/sections/PhotoAccessBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { categoryContext, getAdjacentProjects, getAllProjects, getCategoryTrail, getProjectBySlug } from "@/lib/portfolio";
import { inArea, pageMetadata, projectJsonLd, sportLabel } from "@/lib/seo";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/galeries/[slug]">): Promise<Metadata> {
  const project = getProjectBySlug((await params).slug);
  if (!project) return {};
  const when = project.date ? ` du ${formatDate(project.date)}` : "";
  return pageMetadata({
    title: project.title,
    description: `Galerie ${project.title}${when} (${categoryContext(project.category)}) : ${project.photos.length} photos de ${sportLabel(project.category)}${
      project.location ? ` à ${project.location}` : ""
    }. Photographe sportif${inArea}.`,
    path: project.href,
    // Galerie privée : jamais indexée.
    noIndex: project.private,
  });
}

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** Une galerie : son billet (date, lieu, équipes…), puis toutes ses photos. */
export default async function GalleryPage({ params }: PageProps<"/galeries/[slug]">) {
  const project = getProjectBySlug((await params).slug);
  if (!project) notFound();

  const trail = getCategoryTrail(project.category);
  const { previous, next } = getAdjacentProjects(project);
  const context = categoryContext(project.category);
  const details = [
    project.date ? { label: "Date", value: formatDate(project.date) } : null,
    project.location ? { label: "Lieu", value: project.location } : null,
    project.teams?.length ? { label: "Équipes", value: project.teams.join(", ") } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const crumbs = project.private
    ? [
        { name: "Galeries", path: "/galeries" },
        { name: project.title, path: project.href },
      ]
    : [
        ...(project.match && project.category.sport === "football" ? [{ name: "Football", path: "/football" }] : [{ name: "Portfolio", path: "/portfolio" }]),
        ...trail.map((c) => ({ name: c.title, path: c.href })),
        { name: project.title, path: project.href },
      ];

  return (
    <>
      {project.match ? (
        <MatchdayView project={project} crumbs={crumbs} />
      ) : (
        <>
          <header className="container-wide page-top pb-[clamp(2.5rem,5vw,4rem)]">
            <Breadcrumbs items={crumbs} />
            <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <div className="anim-rise" style={delay(120)}>
                  <SectionLabel>{project.private ? "Galerie privée" : context}</SectionLabel>
                </div>
                <h1 className="t-h1 mt-6 text-linen">
                  <span className="line-mask">
                    <span style={delay(180)}>{project.title}</span>
                  </span>
                </h1>
                <div className="anim-rise mt-8 max-w-xl" style={delay(380)}>
                  <p className="t-lead text-taupe">{project.description}</p>
                  {details.length ? (
                    <dl className="mt-6 space-y-1.5">
                      {details.map((d) => (
                        <div key={d.label} className="flex gap-4 t-small">
                          <dt className="w-20 shrink-0 t-mono leading-6 text-ash">{d.label}</dt>
                          <dd className="text-linen">{d.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              </div>
              <div className="anim-rise lg:col-span-5" style={delay(460)}>
                <MatchTicket
                  project={project}
                  actions={
                    <>
                      <a
                        href="#photos"
                        className="flex h-9 items-center rounded-full bg-flamingo px-4 text-[0.8125rem] font-medium text-ink transition-colors hover:bg-tango"
                      >
                        Voir les photos
                      </a>
                      <ShareGalleryButton title={project.title} />
                    </>
                  }
                />
              </div>
            </div>
          </header>

          <section id="photos" aria-label={`Photos — ${project.title}`} className="container-wide scroll-mt-4 pb-[var(--section-space)]">
            <Gallery
              id={project.slug}
              items={project.photos.map((photo) => ({ photo, title: project.title, context }))}
              label={`Photos — ${project.title}`}
              priorityCount={2}
              toolbar
              defaultView={project.photos.length > 24 ? "mosaic" : "editorial"}
              allowDownload={project.allowDownload}
              sections={
                project.chapters.length > 1
                  ? project.chapters.map((chapter, i) => ({
                      id: chapter.slug,
                      start: chapter.start,
                      end: chapter.start + chapter.photos.length,
                      header: (
                        <p className={`t-mono text-ash ${i ? "mt-16 mb-6 md:mt-24" : "mb-6"}`} id={`chapitre-${chapter.slug}`}>
                          <span className="text-flamingo">{String(i + 1).padStart(2, "0")}</span> — {chapter.title}
                        </p>
                      ),
                    }))
                  : undefined
              }
            />
          </section>
        </>
      )}

      <PhotoAccessBand context={project.title} withSearch={false} />

      {!project.private ? (
        <nav aria-label="Autres galeries" className="container-wide grid border-y border-line md:grid-cols-2">
          <AdjacentLink project={previous} direction="previous" />
          <AdjacentLink project={next} direction="next" />
        </nav>
      ) : null}

      <div className="h-[var(--section-space-sm)]" />

      {!project.private ? <JsonLd data={projectJsonLd(project)} /> : null}
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
    >
      {!isNext ? (
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line-strong text-linen transition-colors duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
          <Icon size={20} />
        </span>
      ) : null}
      <span className="min-w-0">
        <span className="block t-mono text-ash">{isNext ? "Galerie suivante" : "Galerie précédente"}</span>
        <span className="mt-2 block truncate text-[clamp(1.25rem,1rem+1vw,1.875rem)] font-light tracking-[-0.03em] text-linen">
          <span className="link-underline">{project.title}</span>
        </span>
      </span>
      {isNext ? (
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line-strong text-linen transition-colors duration-300 group-hover:border-flamingo group-hover:bg-flamingo group-hover:text-ink">
          <Icon size={20} />
        </span>
      ) : null}
    </Link>
  );
}
