#!/usr/bin/env node
/**
 * Exécuté automatiquement après `next build` (voir package.json).
 *
 * Next.js génère les images de partage (Open Graph / Twitter) et les icônes
 * sans extension de fichier. GitHub Pages déduit le type d'un fichier de son
 * extension : on leur en donne une et on met à jour les références dans les
 * pages, pour que navigateurs et réseaux sociaux les reconnaissent comme des images.
 * Les images de partage (PNG de 1,3 Mo) sont converties en JPEG (~150 Ko) :
 * WhatsApp n'affiche plus d'aperçu au-delà d'environ 300 Ko.
 *
 * Les liens des icônes (<link rel="icon">, apple-touch-icon) sont écrits par
 * Next.js sans le sous-dossier de publication (NEXT_PUBLIC_BASE_PATH) : il est
 * ajouté ici, sinon le favicon est introuvable sur GitHub Pages.
 */
import { existsSync } from "node:fs";
import { readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(process.cwd(), "out");
const SHARE_ROUTES = ["opengraph-image", "twitter-image"];
const ICON_ROUTES = ["apple-icon", "icon"];
/** Type déclaré des images de partage (balises og:image:type / twitter:image:type), en HTML et dans les données des pages. */
const SHARE_TYPE = /((?:og|twitter):image:type"(?: content="|,"content":"))image\/png/g;
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
  if (SHARE_ROUTES.some((name) => file.endsWith(`/${name}`))) {
    await sharp(file).jpeg({ quality: 84, mozjpeg: true }).toFile(`${file}.jpg`);
    await rm(file);
    renamed += 1;
  } else if (ICON_ROUTES.some((name) => file.endsWith(`/${name}`))) {
    await rename(file, `${file}.png`);
    renamed += 1;
  }
}

const sharePattern = new RegExp(`/(${SHARE_ROUTES.join("|")})(?=\\?|")`, "g");
const iconPattern = new RegExp(`/(${ICON_ROUTES.join("|")})(?=\\?|")`, "g");
let updated = 0;
for (const file of files) {
  if (!/\.(html|txt|xml)$/.test(file)) continue;
  const content = await readFile(file, "utf8");
  let next = content.replace(sharePattern, "/$1.jpg").replace(iconPattern, "/$1.png").replace(SHARE_TYPE, "$1image/jpeg");
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

// Poids réellement publié : GitHub Pages limite un site à 1 Go (voir README, « Poids du site »).
const LIMIT = 1024 * 1024 * 1024;
const total = (await Promise.all((await walk(OUT)).map((file) => stat(file)))).reduce((sum, s) => sum + s.size, 0);
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(0)} Mo`;

console.log(`✓ Export finalisé : ${renamed} image(s) de partage et icône(s) nommées, ${updated} fichier(s) mis à jour — site publié : ${mb(total)} sur 1 024 Mo.`);
if (total > LIMIT) console.warn(`⚠ Le site dépasse la limite de 1 Go de GitHub Pages (${mb(total)}) : la publication risque d'échouer. Voir README, « Poids du site ».`);
