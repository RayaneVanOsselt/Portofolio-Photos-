#!/usr/bin/env node
/**
 * npm run videos  (à lancer sur l'ordinateur, après avoir ajouté une vidéo)
 *
 * Pipeline vidéo du site. Sources, sans jamais les modifier : le dossier
 * « Vidéo à rajouter » (ou « Dossier vidéos ») à la racine du projet — ou un autre
 * dossier via VIDEOS_SOURCE=/chemin/du/dossier. Chaque fichier y est relié à sa
 * fiche de src/data/videos.ts par le champ `source` (nom du fichier).
 *
 * Pour chaque vidéo, dans public/_videos/<slug>/ (commité et publié avec le site) :
 *   - <nom-propre>.mp4 : 720p H.264 (~2 Mb/s, ~14 Mo par minute), lecture et téléchargement ;
 *   - apercu.mp4       : aperçu muet de 5 s (4 moments du film), joué au survol (~0,5 Mo) ;
 *   - affiche-<largeur>.avif / .webp : image d'aperçu affichée avant la lecture ;
 *   - vignettes.webp   : planche de vignettes, montrées au survol de la barre de lecture.
 * Tous les MP4 sont « faststart » : la lecture démarre dès les premiers octets reçus.
 * Les métadonnées d'origine (lieu GPS, appareil…) sont retirées.
 *
 * Et src/data/video-manifest.json (commité) : dimensions, durée, poids, couleur
 * dominante, mini-aperçu flou — tout ce que le site affiche sans attendre la vidéo.
 *
 * Les vidéos voyagent avec le site : GitHub Pages limite un site à 1 Go, d'où une seule
 * version légère par vidéo, et le poids total affiché à la fin.
 *
 * Incrémental : chaque fichier n'est refait que si la source ou ses réglages changent
 * (un fichier refait alourdit l'historique GitHub : changer les réglages avec parcimonie).
 * Encodeur : ffmpeg — celui de l'ordinateur s'il existe, sinon installé automatiquement
 * dans node_modules (sans toucher à package.json : GitHub n'en a pas besoin).
 */
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { isAbsolute, join, relative } from "node:path";
import sharp from "sharp";
import { siteConfig } from "../src/config/site.ts";
import { videos } from "../src/data/videos.ts";
import { fileSlug } from "../src/lib/downloads.ts";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "_videos");
const MANIFEST = join(ROOT, "src", "data", "video-manifest.json");
/** Noms de dossier source reconnus (espaces, accents et majuscules indifférents). */
const SOURCE_NAMES = /^(vid[ée]os?\s+[àa]\s+r?ajouter|dossier\s+vid[ée]os?|vid[ée]os?)$/i;
const VIDEO = /\.(mp4|mov|m4v)$/i;

/*
 * Réglages d'encodage — modifier une valeur refait uniquement les fichiers concernés.
 * `short` : côté le plus court (720 en vertical comme en horizontal). CRF : qualité
 * constante (plus bas = plus fin) ; `maxrate` (kb/s) plafonne le débit : la lecture
 * reste fluide même en 4G moyenne, et le site reste léger.
 */
const ENCODE = { short: 720, crf: 24, maxrate: 1800, audio: 128 };
/** Aperçu animé : 4 extraits de 1,25 s, sans son. Positions par défaut en fraction de la durée. */
const TEASER = { short: 540, crf: 29, maxrate: 900, clips: [0.14, 0.36, 0.58, 0.8], length: 1.25 };
const POSTER = { widths: [480, 960, 1440, 1920], avif: 55, webp: 78, at: 0.33 };
/** Planche de vignettes : ~100 images au plus, 160 px sur le grand côté. */
const STORYBOARD = { long: 160, columns: 10, frames: 100, quality: 68 };
const PIPELINE_VERSION = 1;
/** GitHub Pages : 1 Go par site (photos + vidéos). Avertissement au-delà. */
const PUBLISH_WARNING = 900 * 1024 * 1024;

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
const nfc = (value) => value.normalize("NFC");
const even = (n) => Math.max(2, Math.round(n / 2) * 2);
const keyOf = (...parts) => createHash("sha1").update(JSON.stringify([PIPELINE_VERSION, ...parts])).digest("hex").slice(0, 16);
const started = Date.now();

// ----------------------------------------------------------------- ffmpeg

function works(bin) {
  try {
    execFileSync(bin, ["-hide_banner", "-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function findFfmpeg() {
  if (process.env.FFMPEG_BIN) return process.env.FFMPEG_BIN;
  if (works("ffmpeg")) return "ffmpeg";
  const bundled = () => {
    try {
      const bin = createRequire(import.meta.url)("ffmpeg-static");
      return bin && existsSync(bin) && works(bin) ? bin : null;
    } catch {
      return null;
    }
  };
  const found = bundled();
  if (found) return found;
  console.log("… installation de l'encodeur vidéo (ffmpeg, ~45 Mo, une seule fois)");
  execFileSync("npm", ["install", "--no-save", "--no-audit", "--no-fund", "ffmpeg-static@5.3.0"], { stdio: "inherit", cwd: ROOT });
  const installed = bundled();
  if (!installed) throw new Error("ffmpeg introuvable : installez-le (https://ffmpeg.org) ou indiquez son chemin dans FFMPEG_BIN.");
  return installed;
}

/** Lance ffmpeg ; renvoie stdout (Buffer). Le message d'erreur reprend la fin de sa sortie. */
function ffmpeg(args, { output = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG, ["-hide_banner", "-nostdin", ...args], { stdio: ["ignore", output ? "pipe" : "ignore", "pipe"] });
    const out = [];
    let err = "";
    child.stdout?.on("data", (chunk) => out.push(chunk));
    child.stderr.on("data", (chunk) => (err = (err + chunk).slice(-6000)));
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve(Buffer.concat(out)) : reject(new Error(err.trim().split("\n").slice(-4).join("\n")))));
  });
}

/** Durée, dimensions (rotation comprise), images/s, débit, présence du son. */
async function probe(file) {
  const text = await new Promise((resolve) => {
    const child = spawn(FFMPEG, ["-hide_banner", "-nostdin", "-i", file], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    child.stderr.on("data", (chunk) => (err += chunk));
    child.on("close", () => resolve(err));
  });
  const duration = text.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  const videoLine = text.split("\n").find((line) => /Stream #\d+:\d+.*: Video:/.test(line));
  const size = videoLine?.match(/, (\d{2,5})x(\d{2,5})[\s,[]/);
  if (!duration || !videoLine || !size) throw new Error("fichier vidéo illisible");
  let width = Number(size[1]);
  let height = Number(size[2]);
  const rotation = Math.abs(Number(text.match(/rotation of (-?\d+(?:\.\d+)?) degrees/)?.[1] ?? 0));
  if (rotation === 90 || rotation === 270) [width, height] = [height, width];
  return {
    duration: Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]),
    width,
    height,
    fps: Number(videoLine.match(/(\d+(?:\.\d+)?) fps/)?.[1] ?? 25),
    bitrate: Number(text.match(/bitrate: (\d+) kb\/s/)?.[1] ?? 0),
    audio: /Stream #\d+:\d+.*: Audio:/.test(text),
    tenBit: /yuv4\d\dp1[02]|p010/.test(videoLine),
  };
}

/** Dimensions réduites pour que le petit côté vaille `short` (jamais agrandies). */
function fit({ width, height }, short) {
  const scale = Math.min(1, short / Math.min(width, height));
  return { width: even(width * scale), height: even(height * scale) };
}

const scaleFilter = (info, size) => (size.width === info.width && size.height === info.height ? [] : [`scale=${size.width}:${size.height}:flags=lanczos`]);

async function encode(source, info, target, settings, metadata) {
  const size = fit(info, settings.short);
  const maxrate = Math.min(settings.maxrate, info.bitrate || settings.maxrate);
  const filters = scaleFilter(info, size);
  const gop = String(Math.max(1, Math.round(info.fps * 2)));
  await ffmpeg([
    "-y",
    "-i", source,
    "-map", "0:v:0", "-map", "0:a:0?",
    "-map_metadata", "-1", "-map_chapters", "-1",
    ...Object.entries(metadata).flatMap(([k, v]) => ["-metadata", `${k}=${v}`]),
    ...(filters.length ? ["-vf", filters.join(",")] : []),
    "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-crf", String(settings.crf), "-maxrate", `${maxrate}k`, "-bufsize", `${maxrate * 2}k`, "-g", gop,
    ...(info.audio ? ["-c:a", "aac", "-b:a", `${settings.audio}k`, "-ac", "2"] : ["-an"]),
    "-movflags", "+faststart",
    target,
  ]);
  return size;
}

// --------------------------------------------------------------- sources

function sourceDir() {
  const fromEnv = process.env.VIDEOS_SOURCE;
  if (fromEnv) return isAbsolute(fromEnv) ? fromEnv : join(ROOT, fromEnv);
  return null;
}

async function findSourceDir() {
  const explicit = sourceDir();
  if (explicit) return existsSync(explicit) ? explicit : null;
  const entries = await readdir(ROOT, { withFileTypes: true });
  const match = entries.find((e) => e.isDirectory() && SOURCE_NAMES.test(nfc(e.name).trim()));
  return match ? join(ROOT, match.name) : null;
}

/** Empreinte du contenu (les dates de fichier ne veulent rien dire d'un ordinateur à l'autre). */
function fingerprint(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha1");
    createReadStream(file)
      .on("data", (chunk) => hash.update(chunk))
      .on("error", reject)
      .on("end", () => resolve(hash.digest("hex").slice(0, 16)));
  });
}

/** « Léo - Racing 11:10:26.mp4 » → fiche prête à coller dans src/data/videos.ts. */
function suggestEntry(name) {
  const base = nfc(name).replace(/\.[^.]+$/, "").trim();
  const date = base.match(/(\d{1,2})[:/._\s-](\d{1,2})[:/._\s-](\d{2}|\d{4})\s*$/);
  const title = (date ? base.slice(0, date.index) : base).trim().replace(/\s+-\s+/g, " – ");
  if (!date) return `{ slug: "JJ-MM-AAAA-${fileSlug(title)}", title: "${title}", date: "AAAA-MM-JJ", source: "${name}" },`;
  const [d, m] = [date[1].padStart(2, "0"), date[2].padStart(2, "0")];
  const y = date[3].length === 2 ? `20${date[3]}` : date[3];
  return `{ slug: "${d}-${m}-${y}-${fileSlug(title)}", title: "${title}", date: "${y}-${m}-${d}", source: "${name}" },`;
}

// ------------------------------------------------------------- traitement

/** Fichier téléchargé : rayvo-captures0808-2026-10-11-leo-racing.mp4 */
const downloadName = (video) => `${fileSlug(siteConfig.name)}-${video.date}-${video.slug.replace(/^\d{2}-\d{2}-\d{4}-/, "")}.mp4`;

async function readKeys(dir) {
  try {
    return JSON.parse(await readFile(join(dir, ".pipeline.json"), "utf8"));
  } catch {
    return {};
  }
}

/** Fichier à (re)faire si sa clé de réglages a changé ou s'il manque. */
async function step(dir, keys, name, key, files, make) {
  if (keys[name] === key && files.every((f) => existsSync(join(dir, f)))) return false;
  await make();
  keys[name] = key;
  await writeFile(join(dir, ".pipeline.json"), `${JSON.stringify(keys, null, 2)}\n`);
  return true;
}

/** Écrit dans un fichier temporaire puis renomme : jamais de fichier à moitié écrit. */
async function atomic(target, write) {
  const temp = target.replace(/(\.[a-z0-9]+)$/i, ".tmp$1");
  await write(temp);
  await rename(temp, target);
}

async function processVideo(video, source) {
  const dir = join(OUT_DIR, video.slug);
  await mkdir(dir, { recursive: true });
  const keys = await readKeys(dir);
  const info = await probe(source);
  const print = await fingerprint(source);
  const done = [];
  if (info.tenBit) warnings.push(`${video.slug} : vidéo HDR / 10 bits — exportez-la en SDR (8 bits) pour des couleurs fidèles partout.`);

  // --- Lecture et téléchargement (720p)
  const file = downloadName(video);
  const metadata = { title: video.title, artist: siteConfig.name, copyright: `© ${video.date.slice(0, 4)} ${siteConfig.name}` };
  const size = fit(info, ENCODE.short);
  if (
    await step(dir, keys, "video", keyOf(print, ENCODE, metadata), [file], async () => {
      process.stdout.write(`  · ${video.slug} : encodage 720p…`);
      const t = Date.now();
      await atomic(join(dir, file), (temp) => encode(source, info, temp, ENCODE, metadata));
      console.log(` ${Math.round((Date.now() - t) / 1000)} s`);
    })
  )
    done.push("vidéo");

  // --- Aperçu animé : 4 courts extraits mis bout à bout
  const clipStarts = (video.teaser?.length ? video.teaser : TEASER.clips.map((f) => f * info.duration)).map((t) =>
    Math.max(0, Math.min(t, info.duration - TEASER.length)),
  );
  const teaserKey = keyOf(print, TEASER, clipStarts);
  if (
    await step(dir, keys, "teaser", teaserKey, ["apercu.mp4"], () => {
      const size = fit(info, TEASER.short);
      const select = clipStarts.map((t) => `between(t,${t.toFixed(2)},${(t + TEASER.length).toFixed(2)})`).join("+");
      const filters = [`select='${select}'`, "setpts=N/FRAME_RATE/TB", ...scaleFilter(info, size)];
      return atomic(join(dir, "apercu.mp4"), (temp) =>
        ffmpeg([
          "-y", "-i", source, "-an", "-map_metadata", "-1",
          "-vf", filters.join(","),
          "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
          "-crf", String(TEASER.crf), "-maxrate", `${TEASER.maxrate}k`, "-bufsize", `${TEASER.maxrate * 2}k`,
          "-g", String(Math.round(info.fps)), "-movflags", "+faststart",
          temp,
        ]),
      );
    })
  )
    done.push("aperçu");

  // --- Affiche (image d'aperçu) : AVIF + WebP en plusieurs largeurs
  const posterAt = Math.max(0, Math.min(video.posterAt ?? info.duration * POSTER.at, info.duration - 0.1));
  const posterWidths = [...POSTER.widths.filter((w) => w < info.width), Math.min(info.width, POSTER.widths.at(-1))].filter((w, i, all) => all.indexOf(w) === i);
  const posterFiles = posterWidths.flatMap((w) => [`affiche-${w}.avif`, `affiche-${w}.webp`]);
  if (
    await step(dir, keys, "poster", keyOf(print, POSTER, posterAt, posterWidths), posterFiles, async () => {
      const frame = await ffmpeg(["-ss", posterAt.toFixed(2), "-i", source, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], { output: true });
      for (const w of posterWidths) {
        const resized = sharp(frame).resize({ width: w, withoutEnlargement: true });
        await atomic(join(dir, `affiche-${w}.avif`), (temp) => resized.clone().avif({ quality: POSTER.avif, effort: 5 }).toFile(temp));
        await atomic(join(dir, `affiche-${w}.webp`), (temp) => resized.clone().webp({ quality: POSTER.webp, effort: 5 }).toFile(temp));
      }
    })
  )
    done.push("affiche");

  // --- Planche de vignettes (survol de la barre de lecture)
  const interval = Math.max(1, Math.ceil(info.duration / STORYBOARD.frames));
  const count = Math.max(1, Math.ceil(info.duration / interval));
  const rows = Math.ceil(count / STORYBOARD.columns);
  const thumbScale = STORYBOARD.long / Math.max(info.width, info.height);
  const thumb = { width: even(info.width * thumbScale), height: even(info.height * thumbScale) };
  if (
    await step(dir, keys, "storyboard", keyOf(print, STORYBOARD), ["vignettes.webp"], async () => {
      const sheet = await ffmpeg(
        ["-i", source, "-an", "-vf", `fps=1/${interval},scale=${thumb.width}:${thumb.height},tile=${STORYBOARD.columns}x${rows}`, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        { output: true },
      );
      await atomic(join(dir, "vignettes.webp"), (temp) => sharp(sheet).webp({ quality: STORYBOARD.quality, effort: 5 }).toFile(temp));
    })
  )
    done.push("vignettes");

  // --- Couleur dominante et mini-aperçu flou (affichés avant toute image)
  const smallest = join(dir, `affiche-${posterWidths[0]}.webp`);
  const [{ dominant }, blur] = await Promise.all([
    sharp(smallest).stats(),
    sharp(smallest).resize({ width: 16 }).webp({ quality: 45 }).toBuffer(),
  ]);
  const hex = (n) => n.toString(16).padStart(2, "0");
  const bytes = async (file) => (await stat(join(dir, file))).size;

  const entry = {
    source: nfc(video.source),
    hash: print,
    width: info.width,
    height: info.height,
    duration: Math.round(info.duration * 100) / 100,
    fps: info.fps,
    color: `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    poster: { at: Math.round(posterAt * 100) / 100, widths: posterWidths },
    files: {
      video: { file, ...size, bytes: await bytes(file) },
      teaser: { file: "apercu.mp4", bytes: await bytes("apercu.mp4") },
    },
    storyboard: { file: "vignettes.webp", interval, columns: STORYBOARD.columns, count, ...thumb },
  };

  // Fichiers d'une ancienne version (largeur d'affiche, nom de téléchargement…) : supprimés.
  const expected = new Set([".pipeline.json", file, "apercu.mp4", "vignettes.webp", ...posterFiles]);
  for (const file of await readdir(dir)) if (!expected.has(file)) await rm(join(dir, file), { force: true });

  console.log(`  ${done.length ? "↻" : "✓"} ${video.slug} — ${mb(entry.files.video.bytes)} (720p) · aperçu ${Math.round(entry.files.teaser.bytes / 1024)} Ko${done.length ? ` · refait : ${done.join(", ")}` : ""}`);
  return entry;
}

// --------------------------------------------------------------- exécution

const warnings = [];
const dir = await findSourceDir();
const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
const sourceFiles = dir ? (await readdir(dir)).filter((f) => VIDEO.test(f)) : [];
const byName = new Map(sourceFiles.map((f) => [nfc(f), f]));

if (!dir) console.log("ℹ Aucun dossier « Vidéo à rajouter » : seules les vidéos déjà préparées sont conservées.");

const needsWork = videos.some((v) => byName.has(nfc(v.source)));
const FFMPEG = needsWork ? findFfmpeg() : null;
console.log(`▶ Vidéos — ${videos.length} fiche(s), source : ${dir ? relative(ROOT, dir) || "." : "aucune"}`);

const manifest = {};
for (const video of videos) {
  const file = byName.get(nfc(video.source));
  if (!file) {
    if (previous[video.slug]) {
      manifest[video.slug] = previous[video.slug];
      if (dir) warnings.push(`${video.slug} : « ${video.source} » introuvable dans le dossier source — version déjà préparée conservée.`);
    } else {
      warnings.push(`${video.slug} : « ${video.source} » introuvable — la vidéo n'apparaîtra pas sur le site.`);
    }
    continue;
  }
  try {
    manifest[video.slug] = await processVideo(video, join(dir, file));
  } catch (error) {
    console.log("");
    warnings.push(`${video.slug} : échec — ${error.message}`);
    if (previous[video.slug]) manifest[video.slug] = previous[video.slug];
  }
}

// Dossiers générés qui ne correspondent plus à aucune vidéo.
if (existsSync(OUT_DIR)) {
  for (const entry of await readdir(OUT_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && !videos.some((v) => v.slug === entry.name)) await rm(join(OUT_DIR, entry.name), { recursive: true, force: true });
  }
}

const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
await writeFile(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);

// ---------------------------------------------------------------- rapport

let total = 0;
if (existsSync(OUT_DIR)) {
  for (const slug of await readdir(OUT_DIR)) {
    const sub = join(OUT_DIR, slug);
    if (!(await stat(sub)).isDirectory()) continue;
    for (const file of await readdir(sub)) total += (await stat(join(sub, file))).size;
  }
}
console.log(`✓ ${Object.keys(manifest).length} vidéo(s) prête(s) en ${Math.round((Date.now() - started) / 1000)} s — public/_videos/ : ${mb(total)} (publiés avec le site)`);

const photos = join(ROOT, "public", "_photos");
let photoBytes = 0;
const walk = async (folder) => {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (entry.isDirectory()) await walk(join(folder, entry.name));
    else photoBytes += (await stat(join(folder, entry.name))).size;
  }
};
if (existsSync(photos)) await walk(photos);
if (photoBytes + total > PUBLISH_WARNING) {
  warnings.push(`photos ${mb(photoBytes)} + vidéos ${mb(total)} = ${mb(photoBytes + total)} : GitHub Pages limite un site à 1 Go (voir README, « Vidéos »).`);
}

const unknown = sourceFiles.filter((f) => !videos.some((v) => nfc(v.source) === nfc(f)));
if (unknown.length) {
  console.warn(`\n⚠ ${unknown.length} vidéo(s) du dossier source sans fiche — à ajouter dans src/data/videos.ts :`);
  for (const f of unknown) console.warn(`  ${suggestEntry(f)}`);
}
if (warnings.length) {
  console.warn("\n⚠ À vérifier :");
  for (const line of warnings) console.warn(`  · ${line}`);
}
