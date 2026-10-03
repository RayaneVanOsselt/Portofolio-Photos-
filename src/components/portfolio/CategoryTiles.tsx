import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import type { Category } from "@/lib/types";
import { pad } from "@/lib/utils";

/**
 * Photographies comme navigation : chaque tuile ouvre une rubrique.
 * Grille asymétrique — tailles et ratios alternés selon la position.
 */
const PATTERN = [
  { span: "md:col-span-7", frame: "aspect-[4/3]", offset: "" },
  { span: "md:col-span-5", frame: "aspect-[4/5]", offset: "md:mt-[18%]" },
  { span: "md:col-span-5", frame: "aspect-[4/5]", offset: "" },
  { span: "md:col-span-7", frame: "aspect-[4/3]", offset: "md:mt-[12%]" },
];

export function CategoryTiles({ categories, headingLevel = "h2" }: { categories: Category[]; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ul className="grid grid-cols-1 gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-12 md:grid-cols-12 md:gap-y-[clamp(3rem,6vw,6rem)]">
      {categories.map((category, i) => {
        const slot = PATTERN[i % PATTERN.length];
        return (
          <li key={category.href} className={`${slot.span} ${slot.offset}`}>
            <Link href={category.href} className="photo-hover group block" data-cursor="explore">
              <div data-reveal="image" style={{ "--reveal-delay": `${(i % 2) * 100}ms` } as CSSProperties}>
                <PhotoImage photo={category.cover} fill sizes="(min-width: 768px) 55vw, 100vw" className={`${slot.frame} md:max-h-[86vh]`} />
              </div>
              <div className="mt-5 flex items-start justify-between gap-6">
                <div className="flex gap-4">
                  <span className="t-caption t-tabular pt-2 text-phosphor">{pad(i + 1)}</span>
                  <div>
                    <Heading className="t-h3 text-platinum">
                      <span className="link-underline">{category.title}</span>
                    </Heading>
                    <p className="mt-2 t-small text-silver">
                      {category.children.length ? category.children.map((c) => c.title).join(" · ") : category.kicker}
                    </p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="t-caption t-tabular text-silver">{category.photoCount} photos</span>
                  <span className="grid size-8 place-items-center rounded-[var(--radius-sm)] bg-kelp-soft text-platinum transition-colors duration-300 group-hover:bg-kelp">
                    <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
                  </span>
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
