import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  images: {
    formats: ["image/webp", "image/avif"],
  },
  experimental: {
    optimizePackageImports: ["@react-three/drei", "@react-three/fiber", "framer-motion", "gsap", "three"],
  },
};

export default nextConfig;
