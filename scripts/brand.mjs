#!/usr/bin/env node
/**
 * npm run brand
 *
 * Décline le logo du site à partir d'un seul fichier source :
 *
 *   assets/brand/logo-rayvo-captures0808.png   (PNG transparent, logo clair pour fond sombre)
 *
 * Le fichier est composé de trois bandes horizontales, détectées automatiquement :
 * l'emblème (« R » dans le cadre de visée), le nom (RAYVO.CAPTURES0808) et la
 * signature (PHOTO / VIDEO / SPORTS). Le script écrit dans public/brand/ :
 * - logo.webp / logo.png        logo complet, marges rognées (pied de page, partage) ;
 * - logo-mark.webp / .png       emblème seul (en-tête, rideau d'intro, icônes) ;
 * - logo-wordmark.webp / .png   nom seul (en-tête, à côté de l'emblème) ;
 * et enregistre leurs dimensions dans src/data/brand-manifest.json (place réservée,
 * aucun décalage à l'affichage). Lancé automatiquement par `npm run dev` et `npm run build`.
 *
 * Nouveau logo : remplacer le fichier source (même nom), rien d'autre à modifier.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = join(ROOT, "assets", "brand", "logo-rayvo-captures0808.png");
const OUT_DIR = join(ROOT, "public", "brand");
const MANIFEST = join(ROOT, "src", "data", "brand-manifest.json");
/** Opacité minimale d'un pixel « visible » (ignore les halos quasi transparents). */
const ALPHA_THRESHOLD = 40;

/** Largeur maximale de chaque déclinaison : nette sur écran Retina à la taille affichée. */
const VARIANTS = {
  logo: { width: 720 },
  "logo-mark": { width: 320 },
  "logo-wordmark": { width: 720 },
};

/** Bandes de lignes non vides (y0..y1) et leur étendue horizontale. */
function findBands(data, width, height) {
  const bands = [];
  let current = null;
  for (let y = 0; y < height; y++) {
    let minX = -1;
    let maxX = -1;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] <= ALPHA_THRESHOLD) continue;
      if (minX < 0) minX = x;
      maxX = x;
    }
    if (maxX < 0) {
      current = null;
      continue;
    }
    if (!current) bands.push((current = { top: y, bottom: y, left: minX, right: maxX }));
    current.bottom = y;
    current.left = Math.min(current.left, minX);
    current.right = Math.max(current.right, maxX);
  }
  // Petits îlots isolés (poussière) : ignorés.
  return bands.filter((b) => b.bottom - b.top >= 8);
}

const union = (a, b) => ({ top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom), left: Math.min(a.left, b.left), right: Math.max(a.right, b.right) });

async function write(name, region, image) {
  const { width } = VARIANTS[name];
  const resized = sharp(image).extract(region).resize({ width, withoutEnlargement: true });
  const webp = await resized.clone().webp({ quality: 88, alphaQuality: 95, effort: 6 }).toBuffer({ resolveWithObject: true });
  await writeFile(join(OUT_DIR, `${name}.webp`), webp.data);
  await resized.clone().png({ compressionLevel: 9, effort: 10 }).toFile(join(OUT_DIR, `${name}.png`));
  console.log(`  · ${name} — ${webp.info.width}×${webp.info.height}, ${(webp.data.length / 1024).toFixed(1)} Ko`);
  return { src: `/brand/${name}.webp`, png: `/brand/${name}.png`, width: webp.info.width, height: webp.info.height };
}

const image = await sharp(SOURCE).ensureAlpha().png().toBuffer();
const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
const bands = findBands(data, info.width, info.height);
if (bands.length < 2) {
  throw new Error(`${SOURCE} : emblème et nom introuvables (${bands.length} bande(s) détectée(s), 2 ou 3 attendues).`);
}
const [mark, wordmark] = bands;
/** Zone à découper, avec une marge transparente de 2 px (l'anticrénelage des bords n'est pas coupé). */
const box = (b, pad = 2) => {
  const left = Math.max(0, b.left - pad);
  const top = Math.max(0, b.top - pad);
  return { left, top, width: Math.min(info.width, b.right + 1 + pad) - left, height: Math.min(info.height, b.bottom + 1 + pad) - top };
};
const all = bands.reduce(union);

await mkdir(OUT_DIR, { recursive: true });
const manifest = {
  logo: await write("logo", box(all), image),
  mark: await write("logo-mark", box(mark), image),
  wordmark: await write("logo-wordmark", box(wordmark), image),
};
await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("✓ logo décliné → public/brand/ et src/data/brand-manifest.json");
