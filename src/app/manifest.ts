import type { MetadataRoute } from "next";
import { BRAND, BRAND_HEX } from "@/lib/brand";

/**
 * Lets Steady be added to a home screen. On iPhone and iPad that's the only way a
 * website can show notifications, so the bell points people here.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: "/home",
    display: "standalone",
    background_color: BRAND_HEX.background,
    theme_color: BRAND_HEX.background,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      // The mark sits inside the central 72%, within the maskable safe zone.
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
