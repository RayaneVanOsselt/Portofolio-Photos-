"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Sélection de photos (« favoris ») d'une galerie, gardée dans le navigateur
 * du visiteur : il choisit ses photos en parcourant le match, puis les
 * demande toutes d'un coup. Aucune donnée n'est envoyée tant qu'il ne le fait pas.
 */
const EVENT = "rayvo:favoris";
const key = (galleryId: string) => `rayvo:favoris:${galleryId}`;
const EMPTY: number[] = [];
const cache = new Map<string, { raw: string | null; value: number[] }>();

function read(galleryId: string): number[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key(galleryId));
  } catch {
    return EMPTY;
  }
  // Même contenu → même tableau (exigé par useSyncExternalStore).
  const cached = cache.get(galleryId);
  if (cached && cached.raw === raw) return cached.value;
  let value = EMPTY;
  try {
    const parsed = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) value = parsed.filter((n): n is number => Number.isInteger(n)).sort((a, b) => a - b);
  } catch {
    value = EMPTY;
  }
  cache.set(galleryId, { raw, value });
  return value;
}

function write(galleryId: string, value: number[]) {
  try {
    if (value.length) localStorage.setItem(key(galleryId), JSON.stringify(value));
    else localStorage.removeItem(key(galleryId));
  } catch {
    /* stockage indisponible : la sélection ne survivra pas au rechargement */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function useFavorites(galleryId: string) {
  const favorites = useSyncExternalStore(subscribe, () => read(galleryId), () => EMPTY);
  const toggle = useCallback(
    (index: number) => {
      const current = read(galleryId);
      write(galleryId, current.includes(index) ? current.filter((i) => i !== index) : [...current, index]);
    },
    [galleryId],
  );
  const clear = useCallback(() => write(galleryId, []), [galleryId]);
  return { favorites, has: (index: number) => favorites.includes(index), toggle, clear };
}
