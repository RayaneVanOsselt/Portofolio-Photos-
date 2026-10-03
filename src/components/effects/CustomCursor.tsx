"use client";

import { useEffect, useRef } from "react";

type Mode = "default" | "link" | "view" | "explore" | "follow" | "hidden";

const LABELS: Partial<Record<Mode, string>> = { view: "Voir", explore: "Explorer", follow: "↗" };

/**
 * Curseur minimaliste (cercle fin) — uniquement avec une souris/trackpad
 * et sans préférence « réduire les animations ». Il ne capte aucun clic
 * (pointer-events: none) et disparaît au-dessus des champs de saisie.
 *
 * Étiquettes via l'attribut data-cursor : "view" (photo), "explore"
 * (galerie / rubrique), "follow" (lien d'action).
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!query.matches || !ring || !dot || !label) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let frame = 0;
    let mode: Mode = "default";

    const setMode = (next: Mode) => {
      if (next === mode) return;
      mode = next;
      ring.dataset.mode = next;
      dot.dataset.mode = next;
      label.textContent = LABELS[next] ?? "";
    };

    const resolveMode = (target: EventTarget | null): Mode => {
      if (!(target instanceof Element)) return "default";
      if (target.closest("input, textarea, select, [contenteditable='true']")) return "hidden";
      const tagged = target.closest<HTMLElement>("[data-cursor]");
      if (tagged) return (tagged.dataset.cursor as Mode) || "link";
      if (target.closest("a, button, label, summary, [role='button']")) return "link";
      return "default";
    };

    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      ring.dataset.visible = dot.dataset.visible = "true";
      setMode(resolveMode(event.target));
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      ring.dataset.visible = dot.dataset.visible = "false";
    };
    // Le contenu défile sous le pointeur immobile : on réévalue la cible.
    const onScroll = () => setMode(resolveMode(document.elementFromPoint(x, y)));
    const onDown = () => ring.classList.add("is-pressed");
    const onUp = () => ring.classList.remove("is-pressed");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden className="cursor-ring" data-visible="false" data-mode="default">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} aria-hidden className="cursor-dot" data-visible="false" data-mode="default" />
    </>
  );
}
