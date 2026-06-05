import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
