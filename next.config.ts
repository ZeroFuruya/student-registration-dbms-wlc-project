import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ This tells Next.js to build even with TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ This will skip ESLint errors during build
  },
} as NextConfig;

export default nextConfig;
