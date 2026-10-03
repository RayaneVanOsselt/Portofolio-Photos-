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
 * - Chaque photo est déclinée en WebP (640, 1080, 1600, 2400 px) dans
 *   public/_photos/ : le site charge la taille adaptée à l'écran.
 *   Les déclinaisons existantes et à jour ne sont pas recalculées.
 * - Les réglages de prise de vue (boîtier, objectif, focale, ouverture,
 *   vitesse, ISO) sont lus dans les données EXIF et affichés dans la
 *   visionneuse. La localisation GPS n'est jamais lue ni publiée, et les
 *   versions WebP mises en ligne ne contiennent aucune métadonnée.
 * - Les fichiers trop lourds sont signalés (le site les redimensionne, mais
 *   des originaux de plus de 3000 px ralentissent le premier affichage).
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import exifReader from "exif-reader";
import sharp from "sharp";

const ROOT = process.cwd();
const IMAGES_DIR = join(ROOT, "public", "images");
const MANIFEST = join(ROOT, "src", "data", "photo-manifest.json");
const EXTENSIONS = /\.(jpe?g|png|webp|avif)$/i;
const MAX_RECOMMENDED = 3000;
// Déclinaisons WebP servies au navigateur (voir src/lib/image-loader.ts — mêmes valeurs).
const VARIANT_WIDTHS = [640, 1080, 1600, 2400];
const VARIANTS_DIR = join(ROOT, "public", "_photos");

/** Génère les déclinaisons WebP d'une photo si elles manquent ou sont plus anciennes que l'original. */
async function writeVariants(fullPath, rel, sourceTime) {
  const base = rel.replace(EXTENSIONS, "");
  for (const width of VARIANT_WIDTHS) {
    const target = join(VARIANTS_DIR, `${base}-${width}.webp`);
    if (existsSync(target) && (await stat(target)).mtimeMs >= sourceTime) continue;
    await mkdir(dirname(target), { recursive: true });
    await sharp(fullPath).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(target);
  }
}

/** Réglages de prise de vue lisibles (sans GPS). Undefined si absents. */
function readExif(buffer) {
  if (!buffer) return undefined;
  try {
    const { Image: img = {}, Photo: shot = {} } = exifReader(buffer);
    const make = img.Make?.trim();
    const model = img.Model?.trim();
    const iso = Array.isArray(shot.ISOSpeedRatings) ? shot.ISOSpeedRatings[0] : shot.ISOSpeedRatings;
    const exif = {
      camera: model ? (make && !model.toLowerCase().startsWith(make.toLowerCase().split(" ")[0]) ? `${make} ${model}` : model) : make,
      lens: shot.LensModel?.trim() || undefined,
      focal: shot.FocalLength ? `${Math.round(shot.FocalLength)} mm` : undefined,
      aperture: shot.FNumber ? `f/${Number(shot.FNumber.toFixed(1))}` : undefined,
      shutter: shot.ExposureTime ? (shot.ExposureTime >= 1 ? `${shot.ExposureTime} s` : `1/${Math.round(1 / shot.ExposureTime)} s`) : undefined,
      iso: iso ? `ISO ${iso}` : undefined,
      date: shot.DateTimeOriginal instanceof Date ? shot.DateTimeOriginal.toISOString().slice(0, 10) : undefined,
    };
    const clean = Object.fromEntries(Object.entries(exif).filter(([, v]) => v));
    return Object.keys(clean).length ? clean : undefined;
  } catch {
    return undefined;
  }
}

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
  const { size, mtimeMs } = await stat(fullPath);
  await writeVariants(fullPath, rel, mtimeMs);
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
    exif: readExif(meta.exif),
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
