import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { MONOGRAM_PATH } from "@/components/brand/Monogram";
import { siteConfig } from "@/config/site";
import type { Crest, Photo } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Polices du site récupérées au build (TTF/WOFF, formats acceptés par le moteur
 * de rendu) ; repli sur la police par défaut si Google Fonts est indisponible.
 */
async function loadFont(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}`, {
      // Un agent ancien obtient un fichier TTF ou WOFF (pas de WOFF2).
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko) Safari/534.30" },
      signal: AbortSignal.timeout(8000),
    }).then((r) => r.text());
    // Sous-ensemble « latin » (accents français compris) ; formats lisibles par le moteur : TTF, OTF, WOFF.
    const src = /src: url\((.+?)\) format\('(?:opentype|truetype|woff)'\)/;
    const url = css.match(new RegExp(`/\\* latin \\*/[^}]*?${src.source}`))?.[1] ?? css.match(src)?.[1];
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

/** Logo (PNG généré par `npm run logos`) en data URI, ou null s'il est introuvable. */
async function crestSource(crest: Crest): Promise<string | null> {
  try {
    const data = await readFile(join(process.cwd(), "public", crest.png));
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Image de partage : la charte (Heavy Metal, Satin Linen, Flamingo) et le style « billet ». */
export async function renderOgImage({ kicker, title, photo, crests = [] }: { kicker: string; title: string; photo?: Photo | null; crests?: Crest[] }) {
  const [display, mono, sans, image, logos] = await Promise.all([
    loadFont("Archivo:wdth,wght@125,800"),
    loadFont("JetBrains+Mono:wght@400"),
    loadFont("Poppins:wght@400"),
    photoSource(photo ?? undefined),
    Promise.all(crests.slice(0, 2).map(crestSource)),
  ]);
  const crestImages = logos.filter((src): src is string => Boolean(src));
  const fonts = [
    ...(display ? [{ name: "Archivo", data: display, weight: 800 as const, style: "normal" as const }] : []),
    ...(mono ? [{ name: "JetBrains Mono", data: mono, weight: 400 as const, style: "normal" as const }] : []),
    ...(sans ? [{ name: "Poppins", data: sans, weight: 400 as const, style: "normal" as const }] : []),
  ];
  const host = siteConfig.url.replace(/^https?:\/\//, "");
  const name = siteConfig.logo.primary.replace(/\.$/, "").toUpperCase();

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#1d1e1c", color: "#e7e7d8", fontFamily: "Poppins", position: "relative" }}>
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
            background: image ? "linear-gradient(90deg, rgba(19,20,18,0.95) 0%, rgba(19,20,18,0.78) 48%, rgba(19,20,18,0.15) 100%)" : "#1d1e1c",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="56" height="56" viewBox="0 0 64 64">
              <path d={MONOGRAM_PATH} fill="#eb642b" fillRule="evenodd" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "Archivo", fontSize: 26, fontWeight: 800, letterSpacing: 0.5 }}>
                {name}
                <span style={{ color: "#eb642b" }}>.</span>
              </span>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: "#afac96", marginTop: 4 }}>{siteConfig.logo.secondary}</span>
            </div>
          </div>
          {crestImages.length ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {crestImages.map((src, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {i ? <span style={{ fontFamily: "JetBrains Mono", fontSize: 18, letterSpacing: 4, color: "#eb642b" }}>VS</span> : null}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 132, height: 132, borderRadius: 999, background: "#ffffff" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" style={{ width: 90, height: 90, objectFit: "contain" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "#e7e7d8" }}>
              <span style={{ color: "#eb642b", marginRight: 12 }}>+</span>
              {kicker}
            </span>
            <span
              style={{
                fontFamily: "Archivo",
                fontSize: title.length > 26 ? 60 : title.length > 16 ? 78 : 104,
                fontWeight: 800,
                lineHeight: 0.92,
                letterSpacing: -1.5,
                textTransform: "uppercase",
                marginTop: 20,
              }}
            >
              {title}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "JetBrains Mono", fontSize: 15, letterSpacing: 3, textTransform: "uppercase", color: "#afac96" }}>
            <span>{siteConfig.tagline}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: "#eb642b" }} />
              {host}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
