"use client";

import { useEffect, useRef } from "react";

type Connection = { saveData?: boolean; effectiveType?: string };

/** Aperçus animés autorisés : pas de « réduire les animations », pas d'économiseur de données. */
export function teasersAllowed() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  return !connection?.saveData && !/2g/.test(connection?.effectiveType ?? "");
}

/** Un seul aperçu de carte joue à la fois : la page reste fluide, même sur un vieux téléphone. */
let current: HTMLVideoElement | null = null;

/**
 * Aperçu animé muet d'une vidéo (quelques secondes, ~0,6 Mo) :
 * - souris : joué au survol (et au focus clavier) de `root` ;
 * - tactile : joué quand la carte occupe l'écran, mis en pause dès qu'elle le quitte ;
 * - `always` (vidéo à la une) : joué dès qu'il est visible, sur tous les écrans.
 * Rien n'est téléchargé avant le premier déclenchement. Pendant la lecture, la
 * propriété CSS `--t` de `root` suit la progression (0 → 1) : barre de l'aperçu.
 */
export function useTeaser<T extends HTMLElement>(src: string, { always = false } = {}) {
  const root = useRef<T>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = root.current;
    const v = video.current;
    if (!el || !v || !teasersAllowed()) return;

    let frame = 0;
    const tick = () => {
      if (v.duration) el.style.setProperty("--t", String(v.currentTime / v.duration));
      frame = requestAnimationFrame(tick);
    };
    const onPlaying = () => {
      v.dataset.on = "true";
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    const onPause = () => {
      v.dataset.on = "false";
      cancelAnimationFrame(frame);
    };
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);

    // Souhait courant (survol, carte à l'écran) : repris au retour sur l'onglet, que le navigateur a mis en pause.
    let wanted = false;
    const onVisibility = () => {
      if (!document.hidden && wanted && v.paused) v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);

    const start = () => {
      wanted = true;
      if (!always) {
        if (current && current !== v) current.pause();
        current = v;
      }
      if (!v.getAttribute("src")) v.src = src;
      v.play().catch(() => {});
    };
    const stop = () => {
      wanted = false;
      v.pause();
    };

    let detach: () => void;
    if (!always && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      el.addEventListener("pointerenter", start);
      el.addEventListener("pointerleave", stop);
      el.addEventListener("focus", start);
      el.addEventListener("blur", stop);
      detach = () => {
        el.removeEventListener("pointerenter", start);
        el.removeEventListener("pointerleave", stop);
        el.removeEventListener("focus", start);
        el.removeEventListener("blur", stop);
      };
    } else {
      const threshold = always ? 0.3 : 0.75;
      const io = new IntersectionObserver(([entry]) => (entry.intersectionRatio >= threshold ? start() : stop()), { threshold: [0, 0.3, 0.75, 1] });
      io.observe(el);
      detach = () => io.disconnect();
    }

    return () => {
      detach();
      stop();
      cancelAnimationFrame(frame);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
      if (current === v) current = null;
    };
  }, [src, always]);

  return { root, video };
}
