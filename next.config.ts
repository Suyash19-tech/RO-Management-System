import type { NextConfig } from "next";

const ADMIN_URL = process.env.ADMIN_API_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/admin-api/:path*",
        destination: `${ADMIN_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
