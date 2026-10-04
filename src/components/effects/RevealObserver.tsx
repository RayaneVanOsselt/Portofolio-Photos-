"use client";

import { useEffect } from "react";

/**
 * Un seul IntersectionObserver pour tout le site : chaque élément portant
 * `data-reveal` reçoit la classe `is-visible` en entrant dans l'écran.
 * Un MutationObserver prend en charge les pages chargées par navigation client.
 * Pose aussi la classe `hydrated` sur <html> (fondu des images au chargement).
 */
export function RevealObserver() {
  useEffect(() => {
    document.documentElement.classList.add("hydrated");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    const observeWithin = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));
    };
    observeWithin(document);

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]:not(.is-visible)")) io.observe(node);
          observeWithin(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
