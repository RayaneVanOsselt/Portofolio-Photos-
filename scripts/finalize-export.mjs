#!/usr/bin/env node
/**
 * Exécuté automatiquement après `next build` (voir package.json).
 *
 * Next.js génère les images de partage (Open Graph / Twitter) et les icônes
 * sans extension de fichier. GitHub Pages déduit le type d'un fichier de son
 * extension : on les renomme en .png et on met à jour les références dans les
 * pages, pour que navigateurs et réseaux sociaux les reconnaissent comme des images.
 *
 * Les liens des icônes (<link rel="icon">, apple-touch-icon) sont écrits par
 * Next.js sans le sous-dossier de publication (NEXT_PUBLIC_BASE_PATH) : il est
 * ajouté ici, sinon le favicon est introuvable sur GitHub Pages.
 */
import { existsSync } from "node:fs";
import { readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
const IMAGE_ROUTES = ["opengraph-image", "twitter-image", "apple-icon", "icon"];
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
/** Lien relatif d'une icône (« "/icon.png?…" »), sans le sous-dossier de publication. */
const ICON_LINK = /"\/(icon|apple-icon)\.png(?=\?)/g;

if (!existsSync(OUT)) {
  console.error("Dossier out/ introuvable : lancez d'abord `next build`.");
  process.exit(1);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])))).flat();
}

const files = await walk(OUT);
let renamed = 0;
for (const file of files) {
  if (IMAGE_ROUTES.some((name) => file.endsWith(`/${name}`))) {
    await rename(file, `${file}.png`);
    renamed += 1;
  }
}

const pattern = new RegExp(`/(${IMAGE_ROUTES.join("|")})(?=\\?|")`, "g");
let updated = 0;
for (const file of files) {
  if (!/\.(html|txt|xml)$/.test(file)) continue;
  const content = await readFile(file, "utf8");
  let next = content.replace(pattern, "/$1.png");
  if (BASE_PATH) next = next.replace(ICON_LINK, `"${BASE_PATH}/$1.png`);
  if (next !== content) {
    await writeFile(file, next);
    updated += 1;
  }
}

// Fichier interne du pipeline photo (réglages d'encodage) : inutile en ligne.
await rm(join(OUT, "_photos", ".pipeline.json"), { force: true });

// Le site est déjà compilé : GitHub Pages ne doit pas le retraiter avec Jekyll.
await writeFile(join(OUT, ".nojekyll"), "");

console.log(`✓ Export finalisé : ${renamed} image(s) de partage en .png, ${updated} fichier(s) mis à jour.`);
