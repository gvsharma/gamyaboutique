#!/usr/bin/env bash
# Build and run Spring Boot against Terraform RDS (no local Postgres).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.prod.example to .env and set DB_URL, DB_USER, DB_PASSWORD."
  exit 1
fi

echo "Building and starting gamya-couture (RDS mode)..."
docker compose -f docker-compose.rds.yml up -d --build

echo "Waiting for Spring Boot health (Flyway migrations run on first start)..."
for i in {1..90}; do
  if curl -sf http://127.0.0.1:8080/actuator/health >/dev/null; then
    echo "App is healthy."
    curl -s http://127.0.0.1:8080/actuator/health
    echo
    PUBLIC_IP="$(curl -sf http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)"
    if [[ -n "$PUBLIC_IP" ]]; then
      echo "Verifying public API..."
      "$ROOT/scripts/verify-api-integration.sh" "http://${PUBLIC_IP}" || exit 1
    fi
    echo
    echo "Flyway applied schema + seed data. Sample admin: admin@gamyacouture.com / Admin@123"
    echo "Set Vercel: NEXT_PUBLIC_API_BASE_URL=/api/v1 API_PROXY_TARGET=http://${PUBLIC_IP:-13.232.200.243}"
    exit 0
  fi
  sleep 5
done

echo "Timed out waiting for /actuator/health"
docker compose -f docker-compose.rds.yml logs app --tail 80
exit 1
