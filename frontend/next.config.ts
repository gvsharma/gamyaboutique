import type { NextConfig } from "next";
import { API_V1_PREFIX } from "./src/lib/api/config";

/** Dev EC2 defaults — used when Vercel dashboard env vars are not set. */
const VERCEL_API_DEFAULTS = {
  publicApiBase: API_V1_PREFIX,
  apiProxyTarget: "http://13.232.200.243",
  imageCdnHost: "d2568bpd35bq6a.cloudfront.net",
} as const;

const isVercel = Boolean(process.env.VERCEL);
const localhostApiDefault = "http://localhost:8080/api/v1";

function isLocalApiBase(value: string | undefined): boolean {
  if (!value) return true;
  return value === localhostApiDefault || value.startsWith("http://localhost");
}

const publicApiBase = (() => {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (isVercel && isLocalApiBase(raw)) {
    return VERCEL_API_DEFAULTS.publicApiBase;
  }
  return raw || localhostApiDefault;
})();

const apiProxyTarget = (() => {
  const raw = process.env.API_PROXY_TARGET?.replace(/\/$/, "");
  if (isVercel) {
    return raw || VERCEL_API_DEFAULTS.apiProxyTarget;
  }
  return raw ?? "";
})();

const imageCdnHost =
  process.env.NEXT_PUBLIC_IMAGE_CDN_HOST?.trim() ||
  (isVercel ? VERCEL_API_DEFAULTS.imageCdnHost : "");

if (isVercel && publicApiBase.startsWith("http://")) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL must not be plain HTTP on Vercel (mixed content). " +
      "Use NEXT_PUBLIC_API_BASE_URL=/api/v1 and API_PROXY_TARGET=http://<ec2-ip>.",
  );
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
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      ...(imageCdnHost
        ? [
            {
              protocol: "https" as const,
              hostname: imageCdnHost,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
