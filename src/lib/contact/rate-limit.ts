import "server-only";

/**
 * Limiteur de débit en mémoire (fenêtre glissante par adresse IP).
 *
 * Suffisant pour un portfolio sur un seul serveur. Sur une plateforme
 * serverless (plusieurs instances), la mémoire n'est pas partagée :
 * remplacer par un stockage externe (ex. Upstash Redis) si le spam devient un sujet.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);

  // Nettoyage opportuniste pour éviter que la table ne grossisse indéfiniment.
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}
