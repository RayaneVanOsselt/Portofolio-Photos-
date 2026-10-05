import { buildSearchIndex } from "@/lib/search-index";

/**
 * Index de la recherche (⌘K), publié comme un fichier statique : /search-index.json.
 * La palette ne le télécharge qu'à sa première ouverture — les pages restent
 * légères, même avec des centaines d'albums.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildSearchIndex());
}
