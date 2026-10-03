"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Parallaxe discrète : l'enfant se déplace verticalement de ±`strength` px
 * selon sa position dans l'écran. transform uniquement, aucune mesure en
 * boucle hors écran, désactivé si « réduire les animations ».
 */
export function Parallax({ children, strength = 60, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let inView = false;

    const update = () => {
      frame = 0;
      const rect = el.parentElement!.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2 + rect.height / 2);
      el.style.transform = `translate3d(0, ${(-progress * strength).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (inView && !frame) frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) onScroll();
    });
    io.observe(el.parentElement!);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
