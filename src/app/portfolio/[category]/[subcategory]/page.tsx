import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/portfolio/CategoryView";
import { getCategories, getCategoryByPath, getCategoryProjects } from "@/lib/portfolio";
import { categoryDescription, categoryTitle, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().flatMap((c) => c.children.map((child) => ({ category: c.slug, subcategory: child.slug })));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[category]/[subcategory]">): Promise<Metadata> {
  const { category: parent, subcategory } = await params;
  const category = getCategoryByPath([parent, subcategory]);
  if (!category) return {};
  return pageMetadata({
    title: categoryTitle(category),
    description: categoryDescription(category, getCategoryProjects(category).length),
    path: category.href,
  });
}

export default async function SubcategoryPage({ params }: PageProps<"/portfolio/[category]/[subcategory]">) {
  const { category: parent, subcategory } = await params;
  const category = getCategoryByPath([parent, subcategory]);
  if (!category) notFound();
  return <CategoryView category={category} />;
}
