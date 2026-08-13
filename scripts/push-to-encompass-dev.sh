#!/usr/bin/env bash
# Push Encompass Developer Connect knowledge base to https://github.com/gvsharma/encompass-dev
#
# Prerequisite: create an empty repo at https://github.com/new named "encompass-dev"
# (no README, .gitignore, or license — this script pushes an initial commit).

set -euo pipefail

REPO_URL="${ENCOMPASS_DEV_REPO_URL:-https://github.com/gvsharma/encompass-dev.git}"
SRC_DIR="$(cd "$(dirname "$0")/../docs/encompass-knowledge-base" && pwd)"
WORK_DIR="$(mktemp -d)"

cleanup() { rm -rf "$WORK_DIR"; }
trap cleanup EXIT

cp -a "$SRC_DIR"/. "$WORK_DIR"/
cd "$WORK_DIR"

if [[ ! -d .git ]]; then
  git init -b main
  git add .
  git commit -m "Add Encompass Developer Connect knowledge base (18 modules + master doc)"
fi

if ! git remote get-url origin &>/dev/null; then
  git remote add origin "$REPO_URL"
fi

echo "Pushing to $REPO_URL ..."
git push -u origin main

echo "Done: $REPO_URL"
