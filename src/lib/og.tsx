import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { MONOGRAM_PATHS } from "@/components/brand/Monogram";
import { siteConfig } from "@/config/site";
import type { Photo } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };

/** Inter Tight (police du site) récupérée au build ; repli sur la police par défaut si indisponible. */
async function loadFont(weight: 400 | 500): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=Inter+Tight:wght@${weight}`, {
      // Un agent ancien obtient un fichier TTF (format accepté par le moteur de rendu).
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko) Safari/534.30" },
      signal: AbortSignal.timeout(8000),
    }).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url, { signal: AbortSignal.timeout(8000) }).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

/** Source de la photo utilisable par le moteur de rendu (URL distante ou fichier local JPEG/PNG). */
async function photoSource(photo?: Photo): Promise<string | null> {
  if (!photo) return null;
  try {
    if (photo.src.startsWith("https://images.unsplash.com/")) {
      const url = new URL(photo.src);
      url.searchParams.set("w", "1200");
      url.searchParams.set("q", "70");
      return url.toString();
    }
    if (/\.(jpe?g|png)$/i.test(photo.src) && photo.src.startsWith("/")) {
      const data = await readFile(join(process.cwd(), "public", photo.src));
      return `data:image/${photo.src.toLowerCase().endsWith("png") ? "png" : "jpeg"};base64,${data.toString("base64")}`;
    }
  } catch {
    return null;
  }
  return null;
}

export async function renderOgImage({ kicker, title, photo }: { kicker: string; title: string; photo?: Photo }) {
  const [regular, medium, image] = await Promise.all([loadFont(400), loadFont(500), photoSource(photo)]);
  const fonts = [
    ...(regular ? [{ name: "Inter Tight", data: regular, weight: 400 as const, style: "normal" as const }] : []),
    ...(medium ? [{ name: "Inter Tight", data: medium, weight: 500 as const, style: "normal" as const }] : []),
  ];
  const host = siteConfig.url.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#012624", color: "#ffffff", fontFamily: "Inter Tight", position: "relative" }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background: image
              ? "linear-gradient(90deg, rgba(1,29,28,0.94) 0%, rgba(1,29,28,0.72) 45%, rgba(1,29,28,0.1) 100%)"
              : "radial-gradient(ellipse at 80% 0%, rgba(0,130,124,0.35), transparent 60%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="#ffffff" strokeWidth="2.5">
              <path d={MONOGRAM_PATHS.frame} />
              <path d={MONOGRAM_PATHS.letters} />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.3 }}>{siteConfig.logo.primary}</span>
              <span style={{ fontSize: 14, letterSpacing: 4.5, textTransform: "uppercase", color: "#bbc7c6", marginTop: 4 }}>{siteConfig.logo.secondary}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <span style={{ fontSize: 20, letterSpacing: 2.6, textTransform: "uppercase", color: "#fde9ff" }}>{kicker}</span>
            <span style={{ fontSize: title.length > 22 ? 76 : 104, fontWeight: 500, lineHeight: 0.95, letterSpacing: -4, marginTop: 18 }}>{title}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, letterSpacing: 2.4, textTransform: "uppercase", color: "#bbc7c6" }}>
            <span>{siteConfig.tagline}</span>
            <span>{host}</span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
