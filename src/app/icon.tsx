import { ImageResponse } from "next/og";
import brand from "@/data/brand-manifest.json";
import { brandImageSource } from "@/lib/brand";

/** Favicon : l'emblème du logo sur un carré arrondi Heavy Metal (lisible sur les onglets clairs comme sombres). */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function Icon() {
  const mark = await brandImageSource(brand.mark);
  const width = 54;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#131412", borderRadius: 14 }}>
        {mark ? (
          <img src={mark} alt="" width={width} height={Math.round((width * brand.mark.height) / brand.mark.width)} />
        ) : null}
      </div>
    ),
    size,
  );
}
