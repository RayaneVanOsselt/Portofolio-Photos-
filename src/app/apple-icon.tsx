import { ImageResponse } from "next/og";
import { MONOGRAM_PATH } from "@/components/brand/Monogram";

/** Icône d'écran d'accueil (iOS) : le monogramme orange sur Heavy Metal. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1d1e1c" }}>
        <svg width="124" height="124" viewBox="0 0 64 64">
          <path d={MONOGRAM_PATH} fill="#eb642b" fillRule="evenodd" />
        </svg>
      </div>
    ),
    size,
  );
}
