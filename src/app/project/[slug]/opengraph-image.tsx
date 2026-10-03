import { OG_SIZE, renderOgImage } from "@/lib/og";
import { getProjectBySlug, getProjects } from "@/lib/portfolio";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Série photo";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProjectBySlug((await params).slug);
  return renderOgImage({ kicker: project?.category.title ?? "Série", title: project?.title ?? "Série", photo: project?.cover });
}
