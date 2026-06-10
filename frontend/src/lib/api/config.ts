/**
 * API URL resolution — keep in sync with Spring Boot controllers under `/api/v1`.
 *
 * Local dev:     NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
 * Vercel + EC2:  NEXT_PUBLIC_API_BASE_URL=/api/v1
 *                API_PROXY_TARGET=http://13.232.200.243
 *                (browser → same-origin rewrite; SSR → direct to EC2)
 */
export const API_V1_PREFIX = "/api/v1" as const;

const LOCAL_API_BASE = `http://localhost:8080${API_V1_PREFIX}`;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

/** Browser + axios — use relative `/api/v1` when Vercel rewrites to EC2. */
export function resolveBrowserApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured && !configured.startsWith("http://localhost")) {
    return configured;
  }
  // Built client bundle may omit NEXT_PUBLIC_*; on deployed hosts use same-origin proxy.
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return API_V1_PREFIX;
  }
  return configured || LOCAL_API_BASE;
}

/** Server components — prefer direct EC2 when API_PROXY_TARGET is set. */
export function resolveServerApiBaseUrl(): string {
  const proxyTarget = process.env.API_PROXY_TARGET?.trim();
  if (proxyTarget) {
    return `${trimTrailingSlash(proxyTarget)}${API_V1_PREFIX}`;
  }
  return resolveBrowserApiBaseUrl();
}

/** True when Vercel (or local dev) proxies `/api/v1` to a remote HTTP API. */
export function isApiProxyEnabled(): boolean {
  return Boolean(process.env.API_PROXY_TARGET?.trim());
}
