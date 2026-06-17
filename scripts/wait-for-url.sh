#!/usr/bin/env bash
# Wait until an HTTP URL returns a successful status (default 200).
set -euo pipefail

URL="${1:?URL required}"
MAX_ATTEMPTS="${2:-60}"
SLEEP_SEC="${3:-2}"

for ((i = 1; i <= MAX_ATTEMPTS; i++)); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$URL" || true)"
  if [[ "$code" =~ ^(200|204|301|302|307|308)$ ]]; then
    echo "OK $URL ($code)"
    exit 0
  fi
  echo "Waiting for $URL (attempt $i/$MAX_ATTEMPTS, status=$code)..."
  sleep "$SLEEP_SEC"
done

echo "Timed out waiting for $URL" >&2
exit 1
