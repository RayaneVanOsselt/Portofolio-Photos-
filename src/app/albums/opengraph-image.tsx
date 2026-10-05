import { OG_SIZE, renderOgImage } from "@/lib/og";
import { getAlbums } from "@/lib/albums";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Albums photo — hockey, football, rugby par rayvo.captures0808";

export default function Image() {
  return renderOgImage({ kicker: "Hockey · Football · Rugby", title: "Albums", photo: getAlbums().find((a) => a.cover)?.cover });
}

export const dynamic = "force-static";
