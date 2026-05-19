import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
