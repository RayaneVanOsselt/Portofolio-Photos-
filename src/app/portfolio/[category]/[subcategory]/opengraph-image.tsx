import { OG_SIZE, renderOgImage } from "@/lib/og";
import { getCategories, getCategoryByPath } from "@/lib/portfolio";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Aperçu de l’équipe — photos de sport par rayvo.captures0808";

export function generateStaticParams() {
  return getCategories().flatMap((c) => c.children.map((child) => ({ category: c.slug, subcategory: child.slug })));
}

export default async function Image({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category: parent, subcategory } = await params;
  const category = getCategoryByPath([parent, subcategory]);
  return renderOgImage({ kicker: category?.parent?.title ?? "Portfolio", title: category?.title ?? "Portfolio", photo: category?.cover });
}
