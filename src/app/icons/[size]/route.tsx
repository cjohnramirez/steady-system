import { ImageResponse } from "next/og";
import { BRAND_HEX, markSvg, svgDataUri } from "@/lib/brand";

const SIZES = ["192", "512"] as const;

export const dynamic = "force-static";

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

/** PNG app icons for the manifest and device notifications (white mark on amber). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  if (!SIZES.includes(size as (typeof SIZES)[number])) {
    return new Response("Not found", { status: 404 });
  }

  const px = Number(size);
  const src = svgDataUri(
    markSvg({
      front: "#ffffff",
      back: "rgba(255,255,255,0.6)",
      tile: BRAND_HEX.brand,
    }),
  );

  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={px} height={px} alt="" />,
    { width: px, height: px },
  );
}
