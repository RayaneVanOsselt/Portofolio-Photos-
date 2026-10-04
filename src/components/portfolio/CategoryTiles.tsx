import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import type { Category } from "@/lib/types";
import { pad } from "@/lib/utils";

/**
 * Les catégories comme navigation : grandes photos aux angles adoucis,
 * titre posé sur l'image, grille asymétrique (tailles et ratios alternés).
 */
const PATTERN = [
  { span: "md:col-span-7", frame: "aspect-[4/3]", offset: "" },
  { span: "md:col-span-5", frame: "aspect-[4/5]", offset: "md:mt-[16%]" },
  { span: "md:col-span-5", frame: "aspect-[4/5]", offset: "" },
  { span: "md:col-span-7", frame: "aspect-[4/3]", offset: "md:mt-[10%]" },
];

export function CategoryTiles({ categories, headingLevel = "h2" }: { categories: Category[]; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <ul className="grid grid-cols-1 gap-x-[clamp(1rem,2.5vw,2.5rem)] gap-y-10 md:grid-cols-12 md:gap-y-[clamp(3rem,6vw,6rem)]">
      {categories.map((category, i) => {
        const slot = PATTERN[i % PATTERN.length];
        return (
          <li key={category.href} className={`${slot.span} ${slot.offset}`}>
            <Link href={category.href} className="photo-hover group relative block">
              <div data-reveal="image" style={{ "--reveal-delay": `${(i % 2) * 100}ms` } as CSSProperties}>
                <PhotoImage photo={category.cover} fill sizes="(min-width: 768px) 55vw, 100vw" className={`${slot.frame} rounded-[var(--radius-card)] md:max-h-[86vh]`} />
              </div>
              <div aria-hidden className="scrim-bottom pointer-events-none absolute inset-0 rounded-[var(--radius-card)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-[clamp(1rem,2.5vw,2rem)]">
                <div className="min-w-0">
                  <p className="t-mono text-linen/80">
                    {pad(i + 1)} — {category.kicker}
                  </p>
                  <Heading className="mt-2 text-[clamp(1.5rem,1rem+2vw,2.75rem)] leading-[1.05] font-light tracking-[-0.035em] text-linen">{category.title}</Heading>
                  <p className="mt-1.5 t-small text-linen/75">
                    {category.children.length ? category.children.map((c) => c.title).join(" · ") : `${category.photoCount} photos`}
                  </p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-linen/15 text-linen backdrop-blur-md transition-[background-color,color] duration-300 group-hover:bg-flamingo group-hover:text-ink">
                  <ArrowUpRight size={18} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
