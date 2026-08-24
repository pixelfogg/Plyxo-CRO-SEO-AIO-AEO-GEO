import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NEXT_PUBLIC_IS_CLOUD_EDITION === 'false' ? '.next-community' : '.next',
  /* config options here */
};

export default nextConfig;
