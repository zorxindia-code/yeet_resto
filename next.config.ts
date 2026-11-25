import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // AVIF first (smallest), WebP fallback. Food photography is served at the requested `sizes`.
    formats: ["image/avif", "image/webp"],
    qualities: [75],
  },
};

export default nextConfig;
