import { ImageResponse } from "next/og";
import { BRAND, BRAND_HEX, markSvg, svgDataUri } from "@/lib/brand";

export const alt = `${BRAND.name}: ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The link preview card. It replaces a screenshot of the old site, which carried
 * the previous office's logo and name.
 */
export default function OpengraphImage() {
  const mark = svgDataUri(
    markSvg({ front: BRAND_HEX.brand, back: BRAND_HEX.brandLight }),
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: BRAND_HEX.background,
        color: BRAND_HEX.foreground,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark} width={88} height={88} alt="" />
        <span style={{ fontSize: 56, letterSpacing: -2 }}>{BRAND.name}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <span style={{ fontSize: 68, letterSpacing: -2, lineHeight: 1.05 }}>
          Nurturing student growth and well-being
        </span>
        <span style={{ fontSize: 30, color: BRAND_HEX.muted, maxWidth: 900 }}>
          {BRAND.description}
        </span>
      </div>
    </div>,
    size,
  );
}
