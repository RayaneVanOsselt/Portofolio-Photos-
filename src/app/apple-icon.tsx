import { ImageResponse } from "next/og";
import { MONOGRAM_PATHS } from "@/components/brand/Monogram";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#012624" }}>
        <svg width="120" height="120" viewBox="0 0 64 64" fill="none" stroke="#edfffe" strokeWidth="2.5">
          <path d={MONOGRAM_PATHS.frame} />
          <path d={MONOGRAM_PATHS.letters} />
        </svg>
      </div>
    ),
    size,
  );
}
