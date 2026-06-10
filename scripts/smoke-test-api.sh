#!/usr/bin/env bash
# Post-deploy API smoke tests — catalog, auth, cart, wishlist (optional auth).
# Usage:
#   ./scripts/smoke-test-api.sh [API_HOST]
#   SMOKE_EMAIL=user@example.com SMOKE_PASSWORD='...' ./scripts/smoke-test-api.sh
set -euo pipefail

API_HOST="${1:-http://127.0.0.1:8080}"
BASE="${API_HOST%/}/api/v1"
FAILED=0
ACCESS_TOKEN=""
GUEST_CART_ID=""

log_ok() { echo "  OK  $*"; }
log_fail() { echo "  FAIL $*" >&2; FAILED=1; }

assert_http() {
  local label="$1"
  local expected="$2"
  local url="$3"
  local method="${4:-GET}"
  local body="${5:-}"
  local headers=()
  if [[ -n "$ACCESS_TOKEN" ]]; then
    headers+=(-H "Authorization: Bearer ${ACCESS_TOKEN}")
  fi
  if [[ -n "$GUEST_CART_ID" && "$url" == *"/cart"* ]]; then
    headers+=(-H "X-Guest-Cart-Id: ${GUEST_CART_ID}")
  fi
  local code
  if [[ -n "$body" ]]; then
    code="$(curl -sS -o /tmp/gamya-smoke-body.txt -w "%{http_code}" -X "$method" "${headers[@]}" \
      -H "Content-Type: application/json" -d "$body" "$url")"
  else
    code="$(curl -sS -o /tmp/gamya-smoke-body.txt -w "%{http_code}" -X "$method" "${headers[@]}" "$url")"
  fi
  if [[ "$code" == "$expected" ]]; then
    log_ok "${label} (${code})"
  else
    log_fail "${label} — expected HTTP ${expected}, got ${code}"
    head -c 200 /tmp/gamya-smoke-body.txt >&2 || true
    echo >&2
  fi
}

echo "== Gamya Couture API smoke tests =="
echo "Host: ${API_HOST}"
echo

echo "== Infrastructure =="
if curl -sf "${API_HOST%/}/actuator/health" | grep -q '"status":"UP"'; then
  log_ok "Spring Boot actuator health"
else
  log_fail "Spring Boot actuator health"
fi
if curl -sf "${API_HOST%/}/health" >/dev/null 2>&1; then
  log_ok "nginx /health"
else
  echo "  SKIP nginx /health (optional)"
fi
echo

echo "== Public catalog =="
assert_http "GET categories tree" 200 "${BASE}/categories/tree"
assert_http "GET products (paged)" 200 "${BASE}/products?page=0&size=1"
PRODUCT_ID="$(python3 -c "
import json
try:
  d=json.load(open('/tmp/gamya-smoke-body.txt'))
  items=d.get('data',{}).get('content') or d.get('data') or []
  if isinstance(items, list) and items:
    print(items[0].get('id',''))
except Exception:
  pass
" 2>/dev/null || true)"
if [[ -n "${PRODUCT_ID}" ]]; then
  assert_http "GET product detail" 200 "${BASE}/products/${PRODUCT_ID}"
  assert_http "GET related products" 200 "${BASE}/products/${PRODUCT_ID}/related"
else
  echo "  SKIP product detail (no products in catalog)"
fi
echo

echo "== Guest cart =="
GUEST_CART_ID="$(uuidgen | tr '[:upper:]' '[:lower:]')"
if [[ -n "${PRODUCT_ID}" ]]; then
  assert_http "GET empty guest cart" 200 "${BASE}/cart"
  assert_http "POST add to guest cart" 200 "${BASE}/cart/items" POST \
    "{\"productId\":\"${PRODUCT_ID}\",\"quantity\":1}"
  assert_http "GET guest cart with item" 200 "${BASE}/cart"
else
  echo "  SKIP guest cart mutations (no product id)"
fi
echo

echo "== Auth (public endpoints) =="
assert_http "POST login missing body" 400 "${BASE}/auth/login" POST '{}'
assert_http "POST register invalid" 400 "${BASE}/auth/register" POST '{"password":"weak"}'
if [[ -n "${SMOKE_EMAIL:-}" && -n "${SMOKE_PASSWORD:-}" ]]; then
  assert_http "POST login" 200 "${BASE}/auth/login" POST \
    "{\"identifier\":\"${SMOKE_EMAIL}\",\"password\":\"${SMOKE_PASSWORD}\"}"
  ACCESS_TOKEN="$(python3 -c "
import json
try:
  d=json.load(open('/tmp/gamya-smoke-body.txt'))
  print(d.get('data',{}).get('accessToken',''))
except Exception:
  pass
" 2>/dev/null || true)"
  if [[ -n "$ACCESS_TOKEN" ]]; then
    assert_http "GET /auth/me" 200 "${BASE}/auth/me"
    assert_http "GET wishlist" 200 "${BASE}/wishlist"
    assert_http "GET customer profile" 200 "${BASE}/customers/me"
  fi
else
  echo "  SKIP authenticated flows (set SMOKE_EMAIL and SMOKE_PASSWORD)"
fi
echo

echo "== Protected routes reject anonymous =="
assert_http "GET wishlist without token" 401 "${BASE}/wishlist"
echo

if [[ "$FAILED" -ne 0 ]]; then
  echo "Smoke tests FAILED" >&2
  exit 1
fi
echo "All smoke tests passed."
