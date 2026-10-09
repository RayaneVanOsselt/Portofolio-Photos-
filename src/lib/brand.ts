import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Fichier de marque (PNG généré par `npm run brand` dans public/brand/) en data URI,
 * pour les images rendues au build (icônes, images de partage) ; null s'il est introuvable.
 */
export async function brandImageSource(asset: { png: string }): Promise<string | null> {
  try {
    const data = await readFile(join(process.cwd(), "public", asset.png));
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}
