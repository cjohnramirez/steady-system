import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.scdn.co" },
    ],
  },
  // Browsers still ask for /favicon.ico on pages without a <link rel="icon">
  // (raw images, some bookmarks); serve the SVG icon there instead of a 404.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon.svg" }];
  },
};

export default nextConfig;
