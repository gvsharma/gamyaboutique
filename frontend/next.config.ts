import type { NextConfig } from "next";
import { API_V1_PREFIX } from "./src/lib/api/config";

const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, "");
const publicApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

if (process.env.VERCEL) {
  if (publicApiBase?.startsWith("http://")) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must not be plain HTTP on Vercel (mixed content). " +
        "Use NEXT_PUBLIC_API_BASE_URL=/api/v1 and API_PROXY_TARGET=http://<ec2-ip>.",
    );
  }
  if (publicApiBase === API_V1_PREFIX && !apiProxyTarget) {
    throw new Error(
      "API_PROXY_TARGET is required when NEXT_PUBLIC_API_BASE_URL=/api/v1 on Vercel.",
    );
  }
}

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];
    return [
      {
        source: `${API_V1_PREFIX}/:path*`,
        destination: `${apiProxyTarget}${API_V1_PREFIX}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
