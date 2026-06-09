#!/usr/bin/env bash
# Validate backend (.env) and frontend (Vercel / .env.local) vars stay aligned.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_ENV="${1:-$ROOT/.env}"
FRONTEND_ENV="${2:-$ROOT/frontend/.env.local}"

errors=0

warn() { echo "WARN: $*" >&2; }
fail() { echo "ERROR: $*" >&2; errors=$((errors + 1)); }

if [[ ! -f "$BACKEND_ENV" ]]; then
  warn "Backend env not found: $BACKEND_ENV (skip backend checks)"
else
  # shellcheck disable=SC1090
  source "$BACKEND_ENV"
  [[ -n "${CORS_ALLOWED_ORIGINS:-}" ]] || fail "Backend CORS_ALLOWED_ORIGINS is unset"
  [[ -n "${JWT_SECRET:-}" && "${JWT_SECRET}" != change-me* ]] || fail "Backend JWT_SECRET must be set to a real value"
  [[ -n "${DB_PASSWORD:-}" && "${DB_PASSWORD}" != change-me* ]] || fail "Backend DB_PASSWORD must be set to a real value"
fi

if [[ ! -f "$FRONTEND_ENV" ]]; then
  warn "Frontend env not found: $FRONTEND_ENV (skip frontend checks)"
else
  # shellcheck disable=SC1090
  source "$FRONTEND_ENV"
  api_base="${NEXT_PUBLIC_API_BASE_URL:-}"
  proxy="${API_PROXY_TARGET:-}"
  site="${NEXT_PUBLIC_SITE_URL:-}"

  if [[ "$api_base" == "/api/v1" ]]; then
    [[ -n "$proxy" ]] || fail "Frontend API_PROXY_TARGET required when NEXT_PUBLIC_API_BASE_URL=/api/v1"
    if [[ -n "${CORS_ALLOWED_ORIGINS:-}" && -n "$site" ]]; then
      if [[ "$CORS_ALLOWED_ORIGINS" != *"$site"* ]]; then
        fail "Backend CORS_ALLOWED_ORIGINS must include NEXT_PUBLIC_SITE_URL ($site)"
      fi
    fi
  fi
fi

if [[ "$errors" -gt 0 ]]; then
  echo "Env pairing check failed ($errors error(s))." >&2
  exit 1
fi

echo "Env pairing check passed."
