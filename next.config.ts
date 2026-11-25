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
    // 90 is used for the small menu cutouts, which are already low resolution.
    qualities: [75, 90],
  },
};

export default nextConfig;
