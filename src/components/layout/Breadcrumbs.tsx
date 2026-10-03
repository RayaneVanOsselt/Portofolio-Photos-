import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export type Crumb = { name: string; path: string };

/** Fil d'Ariane visible + données structurées BreadcrumbList. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ name: "Accueil", path: "/" }, ...items];
  return (
    <nav aria-label="Fil d'Ariane" className="anim-fade" style={{ "--delay": "100ms" } as React.CSSProperties}>
      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1 t-caption text-silver">
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2.5">
              {last ? (
                <span aria-current="page" className="text-mist">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="link-underline transition-colors hover:text-platinum">
                    {item.name}
                  </Link>
                  <span aria-hidden className="text-slate">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(trail)} />
    </nav>
  );
}
