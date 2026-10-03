#!/usr/bin/env node
/**
 * npm run photos
 *
 * Indexe toutes les photos de public/images/** et génère
 * src/data/photo-manifest.json : dimensions réelles (orientation EXIF prise
 * en compte), couleur dominante et mini-aperçu flou pour chaque image.
 *
 * - Les photos sont triées par nom de fichier (préfixez 01-, 02-… pour l'ordre).
 * - Le texte alternatif (alt) est déduit du nom de fichier la première fois,
 *   puis conservé : vous pouvez le modifier dans le manifest, il ne sera pas écrasé.
 * - Les fichiers trop lourds sont signalés (le site les redimensionne, mais
 *   des originaux de plus de 3000 px ralentissent le premier affichage).
 */
import { existsSync } from "node:fs";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const IMAGES_DIR = join(ROOT, "public", "images");
const MANIFEST = join(ROOT, "src", "data", "photo-manifest.json");
const EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;
const MAX_RECOMMENDED = 3000;

async function walk(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return EXTENSIONS.test(entry.name) ? [full] : [];
    }),
  );
  return files.flat();
}

function altFromFilename(file) {
  const base = file.replace(EXTENSIONS, "").replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Photographie";
}

const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
const previousAlt = new Map(Object.values(previous).flat().map((p) => [p.src, p.alt]));

const files = (await walk(IMAGES_DIR)).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
const manifest = {};
const warnings = [];

for (const fullPath of files) {
  const rel = relative(IMAGES_DIR, fullPath).split(sep).join("/");
  const folder = rel.split("/").slice(0, -1).join("/");
  const file = rel.split("/").at(-1);
  if (!folder) continue; // les images à la racine de public/images ne sont pas indexées

  const image = sharp(fullPath);
  const meta = await image.metadata();
  // Orientation EXIF 5 à 8 : largeur et hauteur sont inversées à l'affichage.
  const rotated = meta.orientation && meta.orientation >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  const { dominant } = await sharp(fullPath).rotate().stats();
  const hex = `#${[dominant.r, dominant.g, dominant.b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  const blur = await sharp(fullPath).rotate().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();

  const src = `/images/${rel}`;
  const { size } = await stat(fullPath);
  if (Math.max(width, height) > MAX_RECOMMENDED || size > 3_000_000) {
    warnings.push(`${rel} — ${width}×${height}, ${(size / 1e6).toFixed(1)} Mo (conseillé : ≤ ${MAX_RECOMMENDED}px, ≤ 3 Mo)`);
  }

  (manifest[folder] ??= []).push({
    file,
    src,
    width,
    height,
    alt: previousAlt.get(src) ?? altFromFilename(file),
    color: hex,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  });
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

const total = Object.values(manifest).reduce((n, list) => n + list.length, 0);
console.log(`✓ ${total} photo(s) indexée(s) dans ${Object.keys(manifest).length} dossier(s) → src/data/photo-manifest.json`);
for (const [folder, list] of Object.entries(manifest)) console.log(`  · ${folder} (${list.length})`);
if (warnings.length) {
  console.warn(`\n⚠ ${warnings.length} fichier(s) volumineux — pensez à les exporter plus léger :`);
  for (const w of warnings) console.warn(`  · ${w}`);
}
