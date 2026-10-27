#!/usr/bin/env node
/**
 * npm run photos  (lancé automatiquement par `npm run dev` et `npm run build`)
 *
 * Pipeline photo du site. Sources, sans jamais les modifier :
 *   - « Dossier photos/ » : vos dossiers, tels quels, reliés aux albums par le champ
 *     `source` de src/data/albums.ts (sous-dossiers = chapitres) ;
 *   - public/images/** : photos des pages (site/home, site/about…) et anciens albums.
 *
 * Pour chaque photo, dans public/_photos/ (généré, non commité) :
 *   - AFFICHAGE : AVIF en 5 largeurs (320 → 2048 px) + WebP en repli (320 → 640 px ;
 *     1080 px si la galerie n'est pas téléchargeable, sinon c'est le JPEG à télécharger
 *     qui sert de grand repli), sans aucune métadonnée (ni boîtier, ni GPS) ;
 *   - TÉLÉCHARGEMENT (galeries autorisées, voir src/lib/downloads.ts) : JPEG haute
 *     qualité, profil sRGB, auteur et copyright, nom propre
 *     (rayvo-captures0808-2026-05-23-daring-h1-namur-h1-07.jpg).
 *
 * Et src/data/photo-manifest.json : dimensions (orientation EXIF corrigée), couleur
 * dominante, mini-aperçu flou, réglages de prise de vue, texte alternatif (modifiable :
 * il est conservé), empreinte du fichier.
 *
 * Incrémental : une photo dont l'empreinte (contenu) n'a pas changé n'est pas
 * retraitée — y compris sur GitHub, où les dates de fichiers ne veulent rien dire.
 * Une photo déplacée (dossier rangé, album renommé ou changé de catégorie) est
 * recopiée depuis son ancien emplacement, sans réencodage. Les fichiers générés qui
 * ne correspondent plus à aucune photo sont supprimés.
 *
 * Signale : dossiers de « Dossier photos/ » reliés à aucun album (avec la fiche
 * prête à coller dans src/data/albums.ts), formats non pris en charge (RAW, HEIC…),
 * fichiers illisibles, doublons, poids publié et place restante sur GitHub Pages.
 */
import { createHash } from "node:crypto";
import { constants, existsSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { basename, dirname, join, relative, sep } from "node:path";
import exifReader from "exif-reader";
import sharp from "sharp";
import { siteConfig } from "../src/config/site.ts";
import { albumTree } from "../src/data/albums.ts";
import { downloadFileName, fileSlug, isDownloadEnabled } from "../src/lib/downloads.ts";

const ROOT = process.cwd();
/** Dossier source des albums : « Dossier photos » (l'ancien nom, avec une espace finale, est encore accepté). */
const SOURCE_DIR = ["Dossier photos", "Dossier photos "].map((name) => join(ROOT, name)).find((dir) => existsSync(dir)) ?? join(ROOT, "Dossier photos");
const IMAGES_DIR = join(ROOT, "public", "images");
const OUT_DIR = join(ROOT, "public", "_photos");
const MANIFEST = join(ROOT, "src", "data", "photo-manifest.json");
/** Réglages utilisés pour les fichiers déjà générés (régénération ciblée). */
const SETTINGS_FILE = join(OUT_DIR, ".pipeline.json");

const IMAGE = /\.(jpe?g|png|webp|avif|tiff?)$/i;
/** Fichiers ignorés sans avertissement (vidéos, fichiers système). */
const IGNORED = /(^\.|^Icon\r?$|\.(mp4|mov|m4v|webm|avi|mkv|mts|m2ts|wmv|flv|3gp|mpe?g|xmp|txt|md)$)/i;

/*
 * Réglages d'encodage — mêmes largeurs que src/lib/photo-sources.ts.
 * La qualité augmente avec la taille : une vignette réduite masque les défauts,
 * une photo plein écran demande plus de finesse. Modifier un réglage régénère
 * uniquement les fichiers concernés (AVIF, WebP ou téléchargement).
 */
const AVIF = [
  { width: 320, quality: 50 },
  { width: 640, quality: 52 },
  { width: 1080, quality: 55 },
  { width: 1600, quality: 57 },
  { width: 2048, quality: 58 },
];
/**
 * Couleurs en 4:2:0, comme le JPEG et presque toutes les photos du web : ~8 % de moins
 * par AVIF, même netteté (testé le 23/10/2026 sur 41 photos, invisible même zoomé ×3).
 */
const AVIF_CHROMA = "4:2:0";
const WEBP = [
  { width: 320, quality: 76 },
  { width: 640, quality: 78 },
  { width: 1080, quality: 80 },
];
/**
 * Galerie téléchargeable : WebP jusqu'à 640 px seulement. Au-delà, les navigateurs
 * sans AVIF (~5 % des visiteurs) reçoivent le JPEG à télécharger, déjà publié et plus
 * fin : ~110 Ko de moins par photo. Même règle côté site (src/lib/photo-sources.ts).
 */
const WEBP_MAX_WITH_DOWNLOAD = 640;
/**
 * JPEG à télécharger : qualité 82 (mozjpeg), sans différence visible à 2048 px et
 * toujours plus fin que l'AVIF affiché ; ~18 % plus léger qu'en qualité 86 (23/10/2026).
 */
const DOWNLOAD_QUALITY = 82;
const SETTINGS = { avif: { widths: AVIF, chroma: AVIF_CHROMA }, webp: WEBP, download: { quality: DOWNLOAD_QUALITY } };
/** GitHub Pages : 1 Go par site publié (photos + vidéos + pages). */
const SITE_LIMIT = 1024 * 1024 * 1024;
/** Pages, scripts, images de partage, logos (mesuré : ~35 Mo en octobre 2026). */
const SITE_OTHER = 40 * 1024 * 1024;
/** Avertissement quand il reste moins que l'équivalent d'un gros album. */
const ROOM_WARNING = 100 * 1024 * 1024;
const LARGE_FILE = 6_000_000;

const byName = (a, b) => a.localeCompare(b, "fr", { numeric: true });
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} Mo`;

/**
 * Largeurs réellement produites pour une photo : toutes celles inférieures à sa
 * largeur, plus la première qui la dépasse (encodée à la taille d'origine).
 * Même règle côté site (src/lib/photo-sources.ts).
 */
function widthsFor(list, sourceWidth) {
  const below = list.filter((v) => v.width < sourceWidth);
  const cap = list.find((v) => v.width >= sourceWidth);
  return cap ? [...below, cap] : below;
}

const warnings = { missing: [], unreadable: [], large: [], duplicates: [], unsupported: [] };

// ------------------------------------------------------------- découverte

async function listDir(dir) {
  return existsSync(dir) ? readdir(dir, { withFileTypes: true }) : [];
}

/** Toutes les images d'un dossier et de ses sous-dossiers, triées par nom. */
async function imagesIn(dir) {
  const out = [];
  for (const entry of (await listDir(dir)).sort((a, b) => byName(a.name, b.name))) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await imagesIn(full)));
    else if (IMAGE.test(entry.name)) out.push(full);
  }
  return out;
}

/** Fichiers d'un dossier qui ne sont ni des images ni ignorés (RAW, HEIC…). */
async function noteUnsupported(dir) {
  for (const entry of await listDir(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await noteUnsupported(full);
    else if (!IMAGE.test(entry.name) && !IGNORED.test(entry.name)) warnings.unsupported.push(relative(ROOT, full));
  }
}

/**
 * Albums reliés à « Dossier photos/ ». Chaque album donne des groupes :
 * ses photos directes (clé = dossier de l'album) puis un groupe par sous-dossier
 * (chapitre), dans l'ordre utilisé par le site (src/lib/albums.ts).
 */
async function sourceAlbums() {
  const albums = [];
  const walk = async (category, trail) => {
    const chain = [...trail, category];
    for (const album of category.albums ?? []) {
      if (!album.source) continue;
      const dir = join(SOURCE_DIR, album.source);
      const key = ["albums", ...chain.map((c) => c.slug), album.slug].join("/");
      if (!existsSync(dir)) {
        warnings.missing.push(`${key} → « Dossier photos/${album.source} » introuvable`);
        continue;
      }
      const entries = await listDir(dir);
      const groups = [];
      const root = entries.filter((e) => e.isFile() && IMAGE.test(e.name)).map((e) => join(dir, e.name));
      if (root.length) groups.push({ key, files: root.sort(byName) });
      const chapters = entries
        .filter((e) => e.isDirectory())
        .map((e) => ({ slug: fileSlug(e.name) || "chapitre", dir: join(dir, e.name) }))
        .sort((a, b) => byName(a.slug, b.slug));
      for (const chapter of chapters) {
        const files = await imagesIn(chapter.dir);
        if (files.length) groups.push({ key: `${key}/${chapter.slug}`, files });
      }
      await noteUnsupported(dir);
      albums.push({ key, dir, groups, album, download: isDownloadEnabled(album, chain, siteConfig.downloads.photos) });
    }
    for (const child of category.children ?? []) await walk(child, chain);
  };
  for (const category of albumTree) await walk(category, []);
  return albums;
}

/** Dossiers de « Dossier photos/ » contenant des images mais reliés à aucun album. */
async function unmappedFolders(sources) {
  const mapped = sources.map((s) => s.dir + sep);
  const found = [];
  const walk = async (dir) => {
    if (mapped.some((m) => (dir + sep).startsWith(m))) return;
    const entries = await listDir(dir);
    if (entries.some((e) => e.isFile() && IMAGE.test(e.name))) found.push(relative(SOURCE_DIR, dir));
    for (const e of entries) if (e.isDirectory()) await walk(join(dir, e.name));
  };
  await walk(SOURCE_DIR);
  return found;
}

/**
 * Fiche prête à coller dans src/data/albums.ts pour un dossier pas encore relié :
 * date lue dans le nom (« Daring - Orée 18:10:2026 », « RWDM 031026 ») ou, à défaut,
 * dans la photo (EXIF) ; équipes lues dans le nom (« Daring - Orée », « Leo vs Racing »).
 */
async function suggestAlbum(folder) {
  const name = basename(folder).normalize("NFC").trim();
  // « 2026-10-18 Daring H1 vs Orée H1 » (rangement conseillé), puis les anciennes écritures (« 18:10:2026 », « 181026 »).
  const iso = name.match(/(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/);
  const inName = iso ?? name.match(/(\d{1,2})[:/._-](\d{1,2})[:/._-](\d{4}|\d{2})(?!\d)/) ?? name.match(/(?<!\d)(\d{2})(\d{2})(\d{2})(?!\d)/);
  let date = iso
    ? `${iso[1]}-${iso[2]}-${iso[3]}`
    : inName
      ? `${inName[3].length === 2 ? `20${inName[3]}` : inName[3]}-${inName[2].padStart(2, "0")}-${inName[1].padStart(2, "0")}`
      : null;
  if (!date || Number.isNaN(Date.parse(date))) {
    const first = (await imagesIn(join(SOURCE_DIR, folder)))[0];
    date = first ? await sharp(first).metadata().then((info) => readExif(info.exif)?.date ?? null, () => null) : null;
  }
  const label = name
    .replace(inName?.[0] ?? "\0", "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const [home, away] = label.split(/\s+(?:-|–|vs\.?|VS\.?|Vs\.?)\s+/);
  const teams = home && away ? `match: { home: "${home}", away: "${away}" }` : `title: "${label || name}"`;
  const [y, m, d] = (date ?? "AAAA-MM-JJ").split("-");
  const slug = `${d}-${m}-${y}-${fileSlug(home && away ? `${home} ${away}` : label || name)}`;
  return `{ slug: "${slug}", date: "${date ?? "AAAA-MM-JJ"}", ${teams}, source: "${folder.split(sep).join("/")}" },`;
}

/** Photos de public/images/** : un groupe par dossier (clé = chemin du dossier). */
async function publicGroups() {
  const files = (await imagesIn(IMAGES_DIR)).filter((f) => relative(IMAGES_DIR, f).includes(sep));
  const groups = new Map();
  for (const file of files) {
    const key = relative(IMAGES_DIR, dirname(file)).split(sep).join("/");
    groups.set(key, [...(groups.get(key) ?? []), file]);
  }
  return [...groups].map(([key, list]) => ({ key, files: list.sort(byName) }));
}

// -------------------------------------------------------------- traitement

/** Réglages de prise de vue lisibles (sans GPS ni numéro de série). Undefined si absents. */
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

function altFromFilename(file) {
  const base = file.replace(IMAGE, "").replace(/^\d+[-_ ]*/, "").replace(/[-_]+/g, " ").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "Photographie";
}

const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {};
const previousEntries = Object.values(previous).flat();
const previousBySrc = new Map(previousEntries.map((p) => [p.src, p]));
/** Même contenu, autre adresse (album renommé, catégorie déplacée) : on retrouve la photo par son empreinte. */
const previousByHash = new Map(previousEntries.map((p) => [p.hash, p]));
const previousSettings = existsSync(SETTINGS_FILE) ? JSON.parse(await readFile(SETTINGS_FILE, "utf8")) : {};
/** Réglage modifié depuis la dernière génération : ces fichiers sont refaits. */
const stale = Object.fromEntries(Object.entries(SETTINGS).map(([kind, value]) => [kind, JSON.stringify(previousSettings[kind]) !== JSON.stringify(value)]));
/**
 * Fichiers déjà générés, par empreinte : { base, download }. Gardé dans .pipeline.json (donc aussi
 * dans le cache de la publication GitHub) ; à défaut, déduit du manifest précédent. Une photo qui
 * change d'adresse est recopiée depuis son ancien emplacement au lieu d'être réencodée.
 */
const generatedBefore =
  previousSettings.photos ??
  Object.fromEntries(previousEntries.map((p) => [p.hash, { base: p.src.replace(/^\/images\//, "").replace(IMAGE, ""), download: p.download?.path }]));
const generatedNow = {};
/** Emplacements occupés par les photos de cette génération (rempli avant le traitement). */
const claimed = { bases: new Set(), downloads: new Set() };
const expected = new Set();
const stats = { photos: 0, generated: 0, files: 0, reused: 0 };

/** Traite une photo : métadonnées (réutilisées si elle n'a pas changé) + fichiers manquants. */
async function processPhoto({ full, key, file, download }) {
  const src = `/images/${key}/${file}`;
  const base = `${key}/${file.replace(IMAGE, "")}`;
  const buffer = await readFile(full);
  const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 16);
  const atSrc = previousBySrc.get(src);
  const prev = atSrc?.hash === hash ? atSrc : (previousByHash.get(hash) ?? atSrc);
  const same = prev?.hash === hash;
  const moved = same && prev.src !== src;

  let meta;
  if (same && prev.width && prev.blurDataURL) {
    meta = { width: prev.width, height: prev.height, color: prev.color, blurDataURL: prev.blurDataURL, exif: prev.exif };
  } else {
    const info = await sharp(buffer, { failOn: "truncated" }).metadata();
    // Orientation EXIF 5 à 8 : largeur et hauteur sont inversées à l'affichage.
    const rotated = info.orientation && info.orientation >= 5;
    const { dominant } = await sharp(buffer).rotate().stats();
    const blur = await sharp(buffer).rotate().resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
    meta = {
      width: rotated ? info.height : info.width,
      height: rotated ? info.width : info.height,
      color: `#${[dominant.r, dominant.g, dominant.b].map((n) => n.toString(16).padStart(2, "0")).join("")}`,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
      exif: readExif(info.exif),
    };
  }

  const jobs = [
    ...widthsFor(AVIF, meta.width).map(({ width, quality }) => ({
      kind: "avif",
      path: `${base}-${width}.avif`,
      make: (img) => img.resize({ width, withoutEnlargement: true }).avif({ quality, effort: 4, chromaSubsampling: AVIF_CHROMA }),
    })),
    ...widthsFor(download ? WEBP.filter((v) => v.width <= WEBP_MAX_WITH_DOWNLOAD) : WEBP, meta.width).map(({ width, quality }) => ({
      kind: "webp",
      path: `${base}-${width}.webp`,
      make: (img) => img.resize({ width, withoutEnlargement: true }).webp({ quality, effort: 4 }),
    })),
  ];
  if (download) {
    jobs.push({
      kind: "download",
      path: download.path,
      make: (img) =>
        img
          .jpeg({ quality: DOWNLOAD_QUALITY, mozjpeg: true })
          .withIccProfile("srgb")
          .withExif({ IFD0: { Artist: siteConfig.name, Copyright: `© ${siteConfig.name}` } }),
    });
  }

  // Ancien emplacement d'un fichier déjà préparé (même contenu, mêmes réglages), s'il est réutilisable :
  // jamais un chemin qu'une autre photo occupe désormais (échange de noms).
  const before = generatedBefore[hash];
  const reusable = (job) => {
    if (!before || stale[job.kind]) return null;
    const isDownload = job.kind === "download";
    const path = isDownload ? before.download : `${before.base}${job.path.slice(base.length)}`;
    if (!path || path === job.path) return null;
    if (isDownload ? claimed.downloads.has(path) : claimed.bases.has(before.base)) return null;
    return existsSync(join(OUT_DIR, path)) ? join(OUT_DIR, path) : null;
  };

  let wrote = false;
  for (const job of jobs) {
    expected.add(job.path);
    const target = join(OUT_DIR, job.path);
    if (same && !stale[job.kind] && existsSync(target)) continue;
    await mkdir(dirname(target), { recursive: true });
    const from = reusable(job);
    if (from) {
      // Clone instantané sur APFS, copie ailleurs ; l'ancien fichier part au nettoyage final.
      await copyFile(from, target, constants.COPYFILE_FICLONE);
      stats.reused += 1;
      continue;
    }
    await job.make(sharp(buffer).rotate()).toFile(target);
    stats.files += 1;
    wrote = true;
  }
  if (wrote) stats.generated += 1;
  generatedNow[hash] = { base, ...(download ? { download: download.path } : {}) };

  if (buffer.length > LARGE_FILE) warnings.large.push(`${relative(ROOT, full)} — ${meta.width}×${meta.height}, ${mb(buffer.length)}`);

  return {
    file,
    src,
    width: meta.width,
    height: meta.height,
    // Photo déplacée : son texte alternatif personnalisé la suit ; celui déduit de l'ancien nom de fichier, non.
    alt: moved && prev.alt === altFromFilename(prev.file) ? altFromFilename(file) : (prev?.alt ?? altFromFilename(file)),
    color: meta.color,
    blurDataURL: meta.blurDataURL,
    exif: meta.exif,
    hash,
    source: relative(ROOT, full).split(sep).join("/"),
    ...(download ? { download: { path: download.path, bytes: (await stat(join(OUT_DIR, download.path))).size } } : {}),
  };
}

/** Exécute les tâches avec `limit` photos traitées en parallèle. */
async function pool(tasks, limit, onDone) {
  const results = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      try {
        results[i] = await tasks[i]();
      } catch (error) {
        results[i] = { error };
      }
      onDone();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

async function walkFiles(dir) {
  const out = [];
  for (const entry of await listDir(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkFiles(full)));
    else out.push(full);
  }
  return out;
}

// ------------------------------------------------------------------ main

const started = Date.now();
const sources = await sourceAlbums();

// Une tâche par photo : son dossier (clé du manifest) et son éventuel fichier à télécharger.
const tasks = [];
const keys = new Set();
for (const source of sources) {
  const total = source.groups.reduce((n, g) => n + g.files.length, 0);
  let index = 0;
  for (const group of source.groups) {
    keys.add(group.key);
    for (const full of group.files) {
      const name = source.download ? downloadFileName({ brand: siteConfig.name, date: source.album.date, slug: source.album.slug, index, total }) : null;
      index += 1;
      tasks.push({ key: group.key, album: source.key, full, file: basename(full), download: name ? { path: `${source.key}/telechargement/${name}` } : null });
    }
  }
}
for (const group of await publicGroups()) {
  if (keys.has(group.key)) {
    warnings.missing.push(`public/images/${group.key} ignoré : cet album lit déjà ses photos dans « Dossier photos/ »`);
    continue;
  }
  for (const full of group.files) tasks.push({ key: group.key, album: group.key, full, file: basename(full), download: null });
}
for (const task of tasks) {
  claimed.bases.add(`${task.key}/${task.file.replace(IMAGE, "")}`);
  if (task.download) claimed.downloads.add(task.download.path);
}

const changed = Object.keys(stale).filter((kind) => stale[kind]);
if (changed.length) console.log(`↻ Réglages nouveaux ou modifiés (${changed.join(", ")}) : ces fichiers sont (re)générés — la première fois, comptez quelques minutes.`);
const parallel = Math.max(2, Math.min(6, Math.floor(availableParallelism() / 2)));
let done = 0;
const results = await pool(
  tasks.map((task) => () => processPhoto(task)),
  parallel,
  () => {
    done += 1;
    if (stats.generated && (done % 50 === 0 || done === tasks.length)) {
      console.log(`  … ${done}/${tasks.length} photos (${stats.generated} traitées, ${Math.round((Date.now() - started) / 1000)} s)`);
    }
  },
);

const manifest = {};
const seen = new Map();
results.forEach((entry, i) => {
  const task = tasks[i];
  if (entry.error) {
    warnings.unreadable.push(`${relative(ROOT, task.full)} — ${entry.error.message}`);
    return;
  }
  stats.photos += 1;
  const twin = seen.get(entry.hash);
  if (twin?.album === task.album) warnings.duplicates.push(`${entry.source} = ${twin.source}`);
  seen.set(entry.hash, { album: task.album, source: entry.source });
  (manifest[task.key] ??= []).push(entry);
});

// Fichiers générés qui ne correspondent plus à aucune photo (photo retirée, renommée…).
let removed = 0;
for (const file of await walkFiles(OUT_DIR)) {
  const rel = relative(OUT_DIR, file).split(sep).join("/");
  if (rel === ".pipeline.json" || expected.has(rel)) continue;
  await rm(file);
  removed += 1;
}
await mkdir(OUT_DIR, { recursive: true });
await writeFile(SETTINGS_FILE, `${JSON.stringify({ ...SETTINGS, photos: generatedNow })}\n`);

const sorted = Object.fromEntries(Object.keys(manifest).sort(byName).map((k) => [k, manifest[k]]));
await writeFile(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);

// ---------------------------------------------------------------- rapport

const sizeOf = async (dir) => (await Promise.all((await walkFiles(dir)).map((f) => stat(f)))).reduce((n, s) => n + s.size, 0);
const published = await sizeOf(OUT_DIR);
const videoBytes = await sizeOf(join(ROOT, "public", "_videos"));
const seconds = Math.round((Date.now() - started) / 1000);
console.log(`✓ ${stats.photos} photo(s) dans ${Object.keys(manifest).length} dossier(s) — ${stats.generated} traitée(s), ${stats.files} fichier(s) écrit(s), ${stats.reused} recopié(s) sans réencodage, ${removed} supprimé(s), ${seconds} s`);
console.log(
  `  AVIF ${AVIF.map((v) => v.width).join("/")} + WebP ${WEBP.map((v) => v.width).join("/")} (${WEBP_MAX_WITH_DOWNLOAD} max. si téléchargeable) · JPEG à télécharger pour ${sources.filter((s) => s.download).length}/${sources.length} album(s) · ${mb(published)} publiés`,
);
// Place restante sur GitHub Pages, en photos : de quoi savoir combien d'albums ajouter encore.
const perPhoto = stats.photos ? published / stats.photos : 1;
const room = SITE_LIMIT - published - videoBytes - SITE_OTHER;
const roomLine = `site ≈ ${mb(published + videoBytes + SITE_OTHER)} sur 1 024 Mo (photos ${mb(published)} + vidéos ${mb(videoBytes)} + pages ~${mb(SITE_OTHER)}) — ${
  room > 0 ? `place pour ≈ ${Math.floor(room / perPhoto)} photos de plus (${Math.round(perPhoto / 1024)} Ko par photo)` : `limite dépassée de ${mb(-room)}`
}`;
console.log(`  ${roomLine}`);
for (const source of sources) {
  const count = source.groups.reduce((n, g) => n + g.files.length, 0);
  const chapters = source.groups.length > 1 ? `, ${source.groups.length} chapitres` : "";
  console.log(`  · ${source.key} (${count}${chapters})${source.download ? "" : " — consultation seule"}`);
}

const report = (title, list) => {
  if (!list.length) return;
  console.warn(`\n${title}`);
  for (const line of list) console.warn(`  · ${line}`);
};
if (room < ROOM_WARNING) console.warn(`\n⚠ GitHub Pages limite un site à 1 Go : ${roomLine}. Voir README, « Poids du site ».`);
const unmapped = await unmappedFolders(sources);
report(
  `⚠ ${unmapped.length} dossier(s) de « Dossier photos/ » relié(s) à aucun album — fiche(s) à coller dans src/data/albums.ts (vérifiez équipes et date) :`,
  await Promise.all(unmapped.map(suggestAlbum)),
);
report("⚠ Sources introuvables ou en double :", warnings.missing);
report(`⚠ ${warnings.unreadable.length} fichier(s) illisible(s) ou corrompu(s), ignoré(s) :`, warnings.unreadable);
report(`⚠ ${warnings.unsupported.length} fichier(s) dans un format non pris en charge (exportez-les en JPEG) :`, warnings.unsupported);
report(`⚠ ${warnings.duplicates.length} doublon(s) exact(s) dans un même album :`, warnings.duplicates);
report(`ℹ ${warnings.large.length} fichier(s) très lourd(s) — le site les réduit, mais l'import est plus lent :`, warnings.large);
