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
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? LOCAL_API_BASE;
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
