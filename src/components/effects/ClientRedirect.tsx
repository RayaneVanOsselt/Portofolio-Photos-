"use client";

import { useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Redirection côté navigateur (le site est statique, sans serveur) :
 * conserve l'ancre — un lien partagé « …/#photo-xxx-3 » rouvre la bonne photo.
 */
export function ClientRedirect({ to }: { to: string }) {
  useEffect(() => {
    location.replace(`${BASE_PATH}${to}${location.search}${location.hash}`);
  }, [to]);
  return null;
}
