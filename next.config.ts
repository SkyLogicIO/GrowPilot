import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  allowedDevOrigins: ["192.168.31.42"],
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? "2.0.0",
    NEXT_PUBLIC_BUILD_TIME:
      process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString(),
  },
};

export default nextConfig;
