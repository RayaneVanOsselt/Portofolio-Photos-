import { homeContent } from "@/data/content";
import { OG_SIZE, renderOgImage } from "@/lib/og";
import { getPhotoById } from "@/lib/portfolio";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ kicker: "Photographe sportif", title: "Hockey · Rugby · Football", photo: getPhotoById(homeContent.hero.photoId) });
}

export const dynamic = "force-static";
