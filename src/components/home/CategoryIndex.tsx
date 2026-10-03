"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@/components/ui/Icons";
import { PhotoImage } from "@/components/ui/PhotoImage";
import type { Photo } from "@/lib/types";
import { pad } from "@/lib/utils";

export type IndexEntry = {
  title: string;
  href: string;
  kicker: string;
  cover: Photo;
  subtitles: string[];
  count: number;
};

/**
 * Les rubriques comme navigation : une liste typographique surdimensionnée.
 * Desktop : la photo de couverture flotte et suit le curseur au survol.
 * Tactile : une vignette accompagne chaque ligne.
 */
export function CategoryIndex({ entries }: { entries: IndexEntry[] }) {
  const [active, setActive] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const motion = useRef({ tx: 0, ty: 0, x: 0, y: 0, frame: 0 });

  useEffect(() => {
    const m = motion.current;
    // Le contenu défile sous le pointeur : on masque l'aperçu.
    const onScroll = () => setActive(null);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(m.frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // L'aperçu rejoint le pointeur avec inertie ; la boucle s'arrête à l'arrivée.
  const follow = (clientX: number, clientY: number) => {
    const m = motion.current;
    m.tx = clientX;
    m.ty = clientY;
    if (m.frame) return;
    const loop = () => {
      m.x += (m.tx - m.x) * 0.14;
      m.y += (m.ty - m.y) * 0.14;
      if (previewRef.current) previewRef.current.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
      m.frame = Math.abs(m.tx - m.x) + Math.abs(m.ty - m.y) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    m.frame = requestAnimationFrame(loop);
  };

  return (
    <div className="relative" onPointerMove={(e) => e.pointerType === "mouse" && follow(e.clientX, e.clientY)} onPointerLeave={() => setActive(null)}>
      <ol className="border-t border-line">
        {entries.map((entry, i) => (
          <li key={entry.href} className="border-b border-line" data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}>
            <Link
              href={entry.href}
              data-cursor="explore"
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse" || active === i) return;
                if (active === null) {
                  // Première entrée : l'aperçu apparaît directement sous le pointeur.
                  Object.assign(motion.current, { x: e.clientX, y: e.clientY });
                }
                setActive(i);
              }}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={`group grid grid-cols-[auto_1fr_auto] text-platinum items-center gap-x-4 py-5 transition-colors duration-500 md:grid-cols-[4rem_1fr_14rem_auto] md:gap-x-8 md:py-7 ${
                active !== null && active !== i ? "md:text-slate" : ""
              }`}
            >
              <span className="relative size-14 overflow-hidden rounded-[var(--radius-sm)] md:hidden">
                <PhotoImage photo={entry.cover} fill sizes="56px" className="absolute inset-0" />
              </span>
              <span className="hidden t-caption t-tabular text-phosphor md:block">{pad(i + 1)}</span>
              <span className="min-w-0">
                <span className="block truncate text-[clamp(1.6rem,0.9rem+3.6vw,4.5rem)] leading-[1] font-medium tracking-[-0.045em] text-current transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:md:translate-x-3">
                  {entry.title}
                </span>
                <span className="mt-1.5 block t-caption text-silver md:hidden">{entry.kicker}</span>
              </span>
              <span className="hidden text-right md:block">
                <span className="block t-caption text-silver">{entry.kicker}</span>
                <span className="mt-1 block t-small text-silver/80">
                  {entry.subtitles.length ? entry.subtitles.join(" · ") : `${entry.count} photos`}
                </span>
              </span>
              <span className="grid size-10 place-items-center rounded-[var(--radius-sm)] bg-kelp-soft text-platinum transition-colors duration-300 group-hover:bg-kelp">
                <ArrowUpRight className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45" />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* Aperçu flottant (desktop, pointeur précis) */}
      <div ref={previewRef} aria-hidden className="pointer-events-none fixed top-0 left-0 z-30 hidden [@media(pointer:fine)]:md:block">
        <div
          className={`-translate-x-1/2 -translate-y-1/2 transition-[opacity,scale] duration-500 ease-[var(--ease-out-expo)] ${
            active === null ? "scale-90 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="relative aspect-[4/5] w-[clamp(14rem,18vw,20rem)] overflow-hidden rounded-[var(--radius-sm)]">
            {entries.map((entry, i) => (
              <div
                key={entry.href}
                className={`absolute inset-0 transition-[opacity,scale] duration-700 ease-[var(--ease-out-expo)] ${active === i ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
              >
                <PhotoImage photo={entry.cover} fill sizes="320px" className="h-full rounded-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
