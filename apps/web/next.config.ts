import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/env", "@workspace/ui"],
};

export default nextConfig;
