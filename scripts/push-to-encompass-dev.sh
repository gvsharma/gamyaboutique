#!/usr/bin/env bash
# Push Encompass knowledge base to https://github.com/gvsharma/encompass-dev
#
# Prerequisites:
#   1. Create an empty repo: https://github.com/new → name: encompass-dev
#   2. Authenticate: gh auth login  (or configure git credentials)
#
set -euo pipefail

REPO_URL="${ENCOMPASS_DEV_REPO:-https://github.com/gvsharma/encompass-dev.git}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGING="${TMPDIR:-/tmp}/encompass-dev-push-$$"

cleanup() { rm -rf "$STAGING"; }
trap cleanup EXIT

echo "Staging Encompass KB files from $ROOT ..."
mkdir -p "$STAGING"
for d in 01-domain 02-apis 03-loan-communications 05-dashboard-architecture 06-ai-knowledge; do
  cp -a "$ROOT/$d" "$STAGING/"
done
cp "$ROOT/ENCOMPASS_MASTER_KNOWLEDGE_BASE.md" "$STAGING/"
cp "$ROOT/scripts/encompass-dev-README.md" "$STAGING/README.md"

cd "$STAGING"
git init -b main
git add -A
git commit -m "Encompass Developer Connect enterprise knowledge base (Phases 1-6)"

git remote add origin "$REPO_URL"
echo "Pushing to $REPO_URL ..."
git push -u origin main

echo "Done: $REPO_URL"
