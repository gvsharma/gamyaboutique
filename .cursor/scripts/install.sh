#!/usr/bin/env bash
# Idempotent dependency install for Cursor Cloud Agents (runs from repo root).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"

echo "==> Backend: resolve Maven dependencies"
mvn -q -ntp -DskipTests dependency:go-offline 2>/dev/null || mvn -q -ntp -DskipTests package

echo "==> Frontend: npm ci"
cd frontend
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

if [[ ! -f .env.local ]]; then
  cp .env.local.example .env.local
  echo "Created frontend/.env.local from example"
fi
cd "${ROOT}"

echo "==> Optional: clone infra repo for Terraform work"
INFRA_DIR="${ROOT}/../gamya-couture-infra"
if [[ ! -d "${INFRA_DIR}/.git" ]]; then
  if git clone --depth 1 https://github.com/gvsharma/gamya-couture-infra.git "${INFRA_DIR}" 2>/dev/null; then
    echo "Cloned gamya-couture-infra to ${INFRA_DIR}"
  else
    echo "Skipping infra clone (token scope or network). Add github.com/gvsharma/gamya-couture-infra to repositoryDependencies if needed."
  fi
fi

echo "==> Install complete"
