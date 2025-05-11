import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [], // No external domains
    formats: ["image/avif", "image/webp"], // Optimize for modern formats
  },
};

export default nextConfig;