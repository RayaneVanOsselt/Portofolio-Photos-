"use client";

import { useEffect, useRef } from "react";

/**
 * Pilote un <dialog> natif en mode modal (piège de focus, fond inerte,
 * touche Échap) tout en laissant le CSS animer l'ouverture et la fermeture
 * via l'attribut data-state="open" | "closed".
 */
export function useAnimatedDialog(open: boolean, onClose: () => void, closeDelay = 450) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const lockedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Échap : on intercepte pour jouer l'animation de sortie.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCloseRef.current();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        if (!lockedRef.current) lockScroll();
        lockedRef.current = true;
        dialog.showModal();
        dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
      }
      const frame = requestAnimationFrame(() => (dialog.dataset.state = "open"));
      return () => cancelAnimationFrame(frame);
    }

    if (dialog.open) {
      dialog.dataset.state = "closed";
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const timer = window.setTimeout(() => {
        dialog.close();
        if (lockedRef.current) unlockScroll();
        lockedRef.current = false;
      }, reduced ? 0 : closeDelay);
      return () => window.clearTimeout(timer);
    }
  }, [open, closeDelay]);

  // Sécurité : déverrouille le scroll si le composant disparaît ouvert.
  useEffect(
    () => () => {
      if (lockedRef.current) unlockScroll();
      lockedRef.current = false;
    },
    [],
  );

  return ref;
}

let locks = 0;

function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  const root = document.documentElement;
  const scrollbar = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
}

function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  const root = document.documentElement;
  root.style.overflow = "";
  root.style.paddingRight = "";
}
