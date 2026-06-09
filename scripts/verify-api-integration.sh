#!/usr/bin/env bash
# Smoke-test the same URLs the frontend calls after EC2 deploy.
set -euo pipefail

API_HOST="${1:-http://13.232.200.243}"
BASE="${API_HOST%/}/api/v1"

check() {
  local label="$1"
  local url="$2"
  local code
  code="$(curl -s -o /tmp/gamya-verify-body.txt -w "%{http_code}" "$url")"
  if [[ "$code" == "200" ]]; then
    echo "OK  $label ($code)"
    head -c 120 /tmp/gamya-verify-body.txt
    echo "..."
    return 0
  fi
  echo "FAIL $label — HTTP $code" >&2
  head -c 300 /tmp/gamya-verify-body.txt >&2
  echo >&2
  if [[ "$code" == "502" ]]; then
    echo "Hint: nginx is up but Spring Boot is not. On EC2 run ./scripts/deploy-ec2-dev.sh" >&2
  fi
  return 1
}

echo "== nginx infra health =="
curl -sf "${API_HOST%/}/health"
echo
echo

failed=0
check "GET /api/v1/categories/tree" "${BASE}/categories/tree" || failed=1
check "GET /api/v1/products" "${BASE}/products?page=0&size=1" || failed=1

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi

echo
echo "OK — backend responds on paths the frontend expects."
