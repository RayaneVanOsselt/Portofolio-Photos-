/**
 * Couche d'accès aux vidéos : fiches (src/data/videos.ts) + fichiers préparés par
 * `npm run videos` (src/data/video-manifest.json), vérifiées au build comme les albums.
 *
 * Les fichiers sont dans public/_videos/ et publiés avec le site. Une vidéo dont les
 * fichiers manquent (`npm run videos` pas encore lancé) n'est pas affichée.
 * `siteConfig.videoHost` permet de les servir depuis un autre hébergement (voir site.ts).
 * Réservé au serveur (lit le disque) : les composants reçoivent des objets `Video`.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { siteConfig } from "@/config/site";
import manifestJson from "@/data/video-manifest.json";
import { videos as videoInputs } from "@/data/videos";
import { albumCrests, categoryContext, crestOf, getAllAlbums, SPORT_NAME } from "@/lib/albums";
import type { Album, Crest, Video, VideoInput } from "@/lib/types";
import { publicPath } from "@/lib/utils";

export const VIDEOS_HREF = "/videos";

type ManifestFile = { file: string; width: number; height: number; bytes: number };
type ManifestEntry = {
  source: string;
  width: number;
  height: number;
  duration: number;
  color: string;
  blurDataURL: string;
  poster: { at: number; widths: number[] };
  files: { video: ManifestFile; teaser: { file: string; bytes: number } };
  storyboard: { file: string; interval: number; columns: number; count: number; width: number; height: number };
};
const manifest = manifestJson as unknown as Record<string, ManifestEntry>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_DIR = join(process.cwd(), "public", "_videos");
const isDev = process.env.NODE_ENV !== "production";
const configuredHost = siteConfig.videoHost.trim().replace(/\/$/, "");

function fail(message: string): never {
  throw new Error(`[vidéos] ${message} — voir src/data/videos.ts`);
}

/** Adresse d'un fichier préparé : sur l'hébergement vidéo (`host`), sinon servi par le site (local). */
const fileUrl = (host: string, slug: string, file: string) => {
  const path = `${slug}/${encodeURIComponent(file)}`;
  return host ? `${host}/${path}` : publicPath(`/_videos/${path}`);
};

function findAlbum(slug: string, where: string): Album {
  const matches = getAllAlbums().filter((a) => a.slug === slug);
  if (!matches.length) fail(`${where} : aucun album « ${slug} » (voir src/data/albums.ts)`);
  if (matches.length > 1) fail(`${where} : plusieurs albums « ${slug} »`);
  return matches[0];
}

function buildVideo(input: VideoInput): Video | null {
  const where = `vidéo « ${input.slug} »`;
  if (!SLUG.test(input.slug)) fail(`${where} : le slug ne doit contenir que des minuscules, des chiffres et des tirets`);
  const [, y, m, d] = input.date.match(ISO_DATE) ?? [];
  if (!y || Number.isNaN(Date.parse(input.date))) fail(`${where} : date « ${input.date} » invalide (format attendu : AAAA-MM-JJ)`);
  if (!input.slug.startsWith(`${d}-${m}-${y}-`)) fail(`${where} : le slug doit commencer par la date, « ${d}-${m}-${y}-… »`);
  const album = input.album ? findAlbum(input.album, where) : null;

  const entry = manifest[input.slug];
  if (!entry) {
    if (process.env.NODE_ENV !== "production") console.warn(`[vidéos] ${where} pas encore préparée : lancez \`npm run videos\``);
    return null;
  }
  const local = existsSync(join(LOCAL_DIR, input.slug, entry.files.video.file));
  const host = isDev && local ? "" : configuredHost;
  // Fichiers absents (vidéo pas encore préparée ou pas encore commitée) : la vidéo reste masquée.
  if (!host && !local) return null;

  const url = (file: string) => fileUrl(host, input.slug, file);
  const { widths } = entry.poster;
  const srcSet = (format: "avif" | "webp") => widths.map((w) => `${url(`affiche-${w}.${format}`)} ${w}w`).join(", ");
  const fallback = widths.find((w) => w >= 960) ?? widths.at(-1)!;
  const downloadEnabled = input.downloadEnabled ?? siteConfig.downloads.videos;
  const club = crestOf(input.club);
  const crests: Crest[] = album ? albumCrests(album) : club ? [club] : [];
  const sport = album?.category.sport ?? input.sport;

  return {
    slug: input.slug,
    title: input.title,
    date: input.date,
    description: input.description,
    href: `${VIDEOS_HREF}/#${input.slug}`,
    sport: sport ? SPORT_NAME[sport] : null,
    crests,
    album: album && !album.private ? { title: album.title, href: album.href, context: categoryContext(album.category), photoCount: album.photos.length } : null,
    width: entry.width,
    height: entry.height,
    vertical: entry.height > entry.width,
    duration: entry.duration,
    color: entry.color,
    blurDataURL: entry.blurDataURL,
    poster: { avif: srcSet("avif"), webp: srcSet("webp"), src: url(`affiche-${fallback}.webp`), width: fallback, height: Math.round((fallback * entry.height) / entry.width) },
    file: { src: url(entry.files.video.file), width: entry.files.video.width, height: entry.files.video.height, bytes: entry.files.video.bytes },
    teaser: url(entry.files.teaser.file),
    storyboard: { ...entry.storyboard, src: url(entry.storyboard.file) },
    download: downloadEnabled
      ? { src: url(entry.files.video.file), filename: entry.files.video.file, bytes: entry.files.video.bytes }
      : null,
    featured: Boolean(input.featured),
  };
}

{
  const seen = new Set<string>();
  for (const input of videoInputs) {
    if (seen.has(input.slug)) fail(`le slug « ${input.slug} » est utilisé par deux vidéos`);
    seen.add(input.slug);
  }
}

// Les plus récentes d'abord ; à date égale, l'ordre de src/data/videos.ts.
const videos = videoInputs
  .map((input, order) => ({ video: buildVideo(input), order }))
  .filter((v): v is { video: Video; order: number } => v.video !== null)
  .sort((a, b) => b.video.date.localeCompare(a.video.date) || a.order - b.order)
  .map((v) => v.video);

/** Vidéos publiées, les plus récentes d'abord. */
export function getVideos(): Video[] {
  return videos;
}

/** Vidéo « À la une » : celle marquée `featured`, sinon la plus récente. */
export function getFeaturedVideo(): Video | undefined {
  return videos.find((v) => v.featured) ?? videos[0];
}

/** Vidéo du même match qu'un album. */
export function getAlbumVideo(album: Album): Video | undefined {
  return videos.find((v) => v.album?.href === album.href);
}
