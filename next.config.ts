import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Only optimise photos from our own public folder. `search` is left open so
    // the `?v=` cache-busting version added in src/lib/media.ts is accepted.
    localPatterns: [{ pathname: "/images/**" }],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 82],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
