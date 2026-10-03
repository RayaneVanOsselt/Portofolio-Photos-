import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/portfolio/CategoryView";
import { getCategories, getCategoryByPath } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().flatMap((c) => c.children.map((child) => ({ category: c.slug, subcategory: child.slug })));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[category]/[subcategory]">): Promise<Metadata> {
  const { category: parent, subcategory } = await params;
  const category = getCategoryByPath([parent, subcategory]);
  if (!category?.parent) return {};
  return pageMetadata({
    title: `${category.title} — ${category.parent.title}`,
    description: `${category.intro} Photographie sportive — ${category.parent.title}.`,
    path: category.href,
  });
}

export default async function SubcategoryPage({ params }: PageProps<"/portfolio/[category]/[subcategory]">) {
  const { category: parent, subcategory } = await params;
  const category = getCategoryByPath([parent, subcategory]);
  if (!category) notFound();
  return <CategoryView category={category} />;
}
