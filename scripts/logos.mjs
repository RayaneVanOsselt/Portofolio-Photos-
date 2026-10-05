#!/usr/bin/env node
/**
 * npm run logos
 *
 * Optimise les logos des clubs et des compétitions déposés dans assets/logos/ :
 *
 *   assets/logos/<identifiant>.png   (ou .jpg, .jpeg, .webp)
 *
 * L'identifiant est la clé du club dans src/data/clubs.ts (ex. « daring »,
 * « white-star », « fih-pro-league »). Pour chaque logo :
 * - le fond uni qui l'entoure (blanc, rouge…) et la transparence sont remplacés
 *   par du blanc, puis les marges sont rognées : tous les logos ont la même
 *   présence, quelle que soit la façon dont le fichier a été exporté ;
 * - une version WebP (256 px max, quelques Ko) est écrite dans public/logos/
 *   pour le site, et une version PNG pour les images de partage (réseaux sociaux) ;
 * - les dimensions sont enregistrées dans src/data/logo-manifest.json : les
 *   proportions sont préservées et la place est réservée (aucun décalage).
 *
 * Les logos s'affichent sur une pastille blanche (src/components/clubs/ClubCrest.tsx) :
 * ils restent lisibles sur le fond sombre du site, quelles que soient leurs couleurs.
 * Lancé automatiquement par `npm run dev` et `npm run build`.
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIR = join(ROOT, "assets", "logos");
const OUT_DIR = join(ROOT, "public", "logos");
const MANIFEST = join(ROOT, "src", "data", "logo-manifest.json");
const EXTENSIONS = /\.(png|jpe?g|webp)$/i;
/** Côté le plus long des fichiers publiés : net jusqu'à ~128 px affichés sur écran Retina. */
const MAX_SIZE = 256;
/** Écart de couleur toléré pour reconnaître le fond (dégradés, compression JPEG). */
const BACKGROUND_TOLERANCE = 64;
/** Les pixels de transition entre le fond et le logo (anticrénelage) sont blanchis aussi. */
const FRINGE_TOLERANCE = 150;

const WHITE = [255, 255, 255];
const distance = (data, i, [r, g, b]) => Math.hypot(data[i] - r, data[i + 1] - g, data[i + 2] - b);

/** Transparence → blanc : le logo est posé sur la pastille blanche du site. */
function flattenOnWhite(data) {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] / 255;
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(data[i + c] * a + 255 * (1 - a));
    data[i + 3] = 255;
  }
}

/**
 * Fond uni coloré (ex. carré rouge autour d'un écusson) : remplissage depuis les
 * bords, uniquement sur les pixels proches de la couleur des coins. Les zones de
 * même couleur à l'intérieur du logo, séparées du bord, sont conservées.
 */
function knockOutBackground(data, width, height) {
  const corners = [0, width - 1, (height - 1) * width, height * width - 1].map((p) => p * 4);
  const background = [0, 1, 2].map((c) => Math.round(corners.reduce((sum, i) => sum + data[i + c], 0) / corners.length));
  if (distance(Uint8Array.from(background), 0, WHITE) < BACKGROUND_TOLERANCE) return false; // déjà blanc

  const border = [];
  for (let x = 0; x < width; x++) border.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) border.push(y * width, y * width + width - 1);
  const uniform = border.filter((p) => distance(data, p * 4, background) <= BACKGROUND_TOLERANCE).length / border.length;
  if (uniform < 0.6) return false; // pas de fond uni : on n'y touche pas

  const filled = new Uint8Array(width * height);
  const queue = border.filter((p) => distance(data, p * 4, background) <= BACKGROUND_TOLERANCE);
  for (const p of queue) filled[p] = 1;
  while (queue.length) {
    const p = queue.pop();
    const x = p % width;
    const y = (p - x) / width;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const n = ny * width + nx;
      if (filled[n] || distance(data, n * 4, background) > BACKGROUND_TOLERANCE) continue;
      filled[n] = 1;
      queue.push(n);
    }
  }
  // Deux passes sur la bordure du fond : les pixels d'anticrénelage passent au blanc.
  for (let pass = 0; pass < 2; pass++) {
    const edge = [];
    for (let p = 0; p < filled.length; p++) {
      if (filled[p] || distance(data, p * 4, background) > FRINGE_TOLERANCE) continue;
      const x = p % width;
      if ((x > 0 && filled[p - 1]) || (x < width - 1 && filled[p + 1]) || filled[p - width] || filled[p + width]) edge.push(p);
    }
    for (const p of edge) filled[p] = 1;
  }
  for (let p = 0; p < filled.length; p++) if (filled[p]) data.set(WHITE, p * 4);
  return true;
}

async function optimize(file) {
  const id = file.replace(EXTENSIONS, "").toLowerCase();
  const { data, info } = await sharp(join(SOURCE_DIR, file)).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  flattenOnWhite(data);
  const knockedOut = knockOutBackground(data, info.width, info.height);

  const trimmed = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .removeAlpha()
    .trim({ background: "#ffffff", threshold: 18 })
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = trimmed.info;
  const resized = sharp(trimmed.data, { raw: { width, height, channels } }).resize({ width: MAX_SIZE, height: MAX_SIZE, fit: "inside", withoutEnlargement: true });

  const webp = await resized.clone().webp({ quality: 90, effort: 6 }).toBuffer({ resolveWithObject: true });
  await writeFile(join(OUT_DIR, `${id}.webp`), webp.data);
  await resized.clone().png({ palette: true, quality: 90, effort: 10 }).toFile(join(OUT_DIR, `${id}.png`));

  return { id, knockedOut, entry: { src: `/logos/${id}.webp`, png: `/logos/${id}.png`, width: webp.info.width, height: webp.info.height }, bytes: webp.data.length };
}

const files = existsSync(SOURCE_DIR) ? (await readdir(SOURCE_DIR)).filter((f) => EXTENSIONS.test(f)).sort() : [];
await mkdir(OUT_DIR, { recursive: true });
const manifest = {};
for (const file of files) {
  const { id, entry, bytes, knockedOut } = await optimize(file);
  manifest[id] = entry;
  console.log(`  · ${id} — ${entry.width}×${entry.height}, ${(bytes / 1024).toFixed(1)} Ko${knockedOut ? " (fond retiré)" : ""}`);
}
await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`✓ ${files.length} logo(s) optimisé(s) → public/logos/ et src/data/logo-manifest.json`);
