import { OG_SIZE, renderOgImage } from "@/lib/og";
import { getCategories, getCategoryByPath } from "@/lib/portfolio";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Rubrique du portfolio";

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const category = getCategoryByPath([(await params).category]);
  return renderOgImage({ kicker: category?.kicker ?? "Portfolio", title: category?.title ?? "Portfolio", photo: category?.cover });
}
