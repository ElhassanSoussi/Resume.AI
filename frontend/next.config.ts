import type { NextConfig } from "next";

const publicApiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
const backend =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ??
  publicApiBase ??
  "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
