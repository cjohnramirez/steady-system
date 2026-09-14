import { ImageResponse } from "next/og";
import { BRAND_HEX, markSvg, svgDataUri } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon. iOS rounds the corners itself, so the tile is a full square. */
export default function AppleIcon() {
  const src = svgDataUri(
    markSvg({
      front: "#ffffff",
      back: "rgba(255,255,255,0.6)",
      tile: BRAND_HEX.brand,
    }),
  );
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={180} height={180} alt="" />,
    size,
  );
}
