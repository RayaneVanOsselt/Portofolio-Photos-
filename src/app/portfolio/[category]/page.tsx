import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/portfolio/CategoryView";
import { getCategories, getCategoryByPath, getCategoryProjects } from "@/lib/portfolio";
import { categoryDescription, categoryTitle, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryByPath([slug]);
  if (!category) return {};
  return pageMetadata({
    title: categoryTitle(category),
    description: categoryDescription(category, getCategoryProjects(category).length),
    path: category.href,
  });
}

export default async function CategoryPage({ params }: PageProps<"/portfolio/[category]">) {
  const { category: slug } = await params;
  const category = getCategoryByPath([slug]);
  if (!category) notFound();
  return <CategoryView category={category} />;
}
