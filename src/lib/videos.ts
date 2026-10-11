/**
 * Couche d'accès aux vidéos (src/data/videos.ts), vérifiées au build comme les albums.
 */
import { siteConfig } from "@/config/site";
import { videos as videoInputs } from "@/data/videos";
import { crestOf } from "@/lib/albums";
import { fileSlug } from "@/lib/downloads";
import type { Video, VideoInput } from "@/lib/types";

export const VIDEOS_HREF = "/videos";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function fail(message: string): never {
  throw new Error(`[vidéos] ${message} — voir src/data/videos.ts`);
}

function buildVideo({ club, downloadEnabled, ...input }: VideoInput): Video {
  const where = `vidéo « ${input.slug} »`;
  if (!SLUG.test(input.slug)) fail(`${where} : le slug ne doit contenir que des minuscules, des chiffres et des tirets`);
  const [, y, m, d] = input.date.match(ISO_DATE) ?? [];
  if (!y || Number.isNaN(Date.parse(input.date))) fail(`${where} : date « ${input.date} » invalide (format attendu : AAAA-MM-JJ)`);
  if (!input.slug.startsWith(`${d}-${m}-${y}-`)) fail(`${where} : le slug doit commencer par la date, « ${d}-${m}-${y}-… »`);
  if (!/^https?:\/\/|^\//.test(input.src)) fail(`${where} : \`src\` doit être une adresse complète (https://…)`);
  const extension = input.src.split(/[?#]/)[0].match(/\.(mp4|mov|m4v|webm)$/i)?.[1].toLowerCase() ?? "mp4";
  return {
    ...input,
    crest: crestOf(club),
    filename: `${fileSlug(siteConfig.name)}-${input.date}-${input.slug.replace(/^\d{2}-\d{2}-\d{4}-/, "")}.${extension}`,
    downloadEnabled: downloadEnabled ?? siteConfig.downloads.videos,
  };
}

const videos = videoInputs.map(buildVideo).sort((a, b) => b.date.localeCompare(a.date));
{
  const seen = new Set<string>();
  for (const video of videos) {
    if (seen.has(video.slug)) fail(`le slug « ${video.slug} » est utilisé par deux vidéos`);
    seen.add(video.slug);
  }
}

/** Toutes les vidéos, les plus récentes d'abord. */
export function getVideos(): Video[] {
  return videos;
}
