import type { MetadataRoute } from "next";
import { getAllCategoryPaths, getProjects } from "@/lib/portfolio";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  });

  return [
    page("/", 1, "weekly"),
    page("/portfolio", 0.9, "weekly"),
    ...getAllCategoryPaths().map((path) => page(`/portfolio/${path.join("/")}`, path.length === 1 ? 0.8 : 0.7, "weekly")),
    ...getProjects().map((p) => page(p.href, 0.6)),
    page("/about", 0.7),
    page("/services", 0.7),
    page("/contact", 0.8),
    page("/privacy", 0.2, "yearly"),
    page("/legal", 0.2, "yearly"),
  ];
}
