#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.prod.example to .env and fill in secrets."
  exit 1
fi

echo "Building and starting gamya-couture (app + postgres)..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Waiting for Spring Boot health..."
for i in {1..60}; do
  if curl -sf http://127.0.0.1:8080/actuator/health >/dev/null; then
    echo "App is healthy."
    curl -s http://127.0.0.1:8080/actuator/health
    echo
    PUBLIC_IP="$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)"
    if [[ -n "$PUBLIC_IP" ]]; then
      echo "Verifying nginx → app (same paths frontend uses)..."
      if ! "$ROOT/scripts/verify-api-integration.sh" "http://${PUBLIC_IP}"; then
        echo "Deploy finished but public API check failed — see logs above."
        exit 1
      fi
    fi
    echo
    echo "Next: set Vercel env NEXT_PUBLIC_API_BASE_URL=/api/v1 and API_PROXY_TARGET=http://${PUBLIC_IP:-13.232.200.243}"
    exit 0
  fi
  sleep 5
done

echo "Timed out waiting for /actuator/health"
docker compose -f docker-compose.prod.yml logs app --tail 80
exit 1
