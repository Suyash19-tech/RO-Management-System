import type { NextConfig } from "next";

const ADMIN_URL = process.env.ADMIN_API_URL || 
  (process.env.NODE_ENV === "production" 
    ? "https://ro-management-system-9rz3.vercel.app" 
    : "http://localhost:3001");

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
