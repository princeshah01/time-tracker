import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/db", "@workspace/env", "@workspace/ui"],
};

export default nextConfig;
