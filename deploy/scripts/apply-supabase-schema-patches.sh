#!/usr/bin/env bash
# Applies idempotent Supabase SQL patches before restarting the backend.
set -euo pipefail

APP_PATH="${APP_PATH:-/opt/gamya-couture}"
ENV_FILE="${APP_PATH}/config/application.env"
PATCHES_DIR="${APP_PATH}/incoming/sql/supabase"

log() {
  echo "[$(date -Iseconds)] $*"
}

read_env_value() {
  local key="$1"
  grep -E "^${key}=" "${ENV_FILE}" 2>/dev/null | tail -n1 | cut -d= -f2- || true
}

is_supabase_target() {
  local provider profile db_url
  provider="$(read_env_value DB_PROVIDER)"
  profile="$(read_env_value SPRING_PROFILES_ACTIVE)"
  db_url="$(read_env_value DB_URL)"
  [[ "${provider}" == "supabase" ]] && return 0
  [[ "${profile}" == *supabase* ]] && return 0
  [[ "${db_url}" == *supabase.co* ]] && return 0
  return 1
}

ensure_psql() {
  if command -v psql >/dev/null 2>&1; then
    return 0
  fi
  log "Installing PostgreSQL client for schema patches"
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y postgresql15 >/dev/null
  elif command -v yum >/dev/null 2>&1; then
    yum install -y postgresql15 >/dev/null
  elif command -v apt-get >/dev/null 2>&1; then
    apt-get update -qq
    DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql-client >/dev/null
  else
    log "ERROR: psql not found and no supported package manager available"
    return 1
  fi
}

parse_jdbc_url() {
  local jdbc="$1"
  local rest hostport db_with_params dbname host port

  rest="${jdbc#jdbc:postgresql://}"
  hostport="${rest%%/*}"
  db_with_params="${rest#*/}"
  dbname="${db_with_params%%\?*}"

  if [[ "${hostport}" == *:* ]]; then
    host="${hostport%%:*}"
    port="${hostport#*:}"
  else
    host="${hostport}"
    port="5432"
  fi

  echo "${host}|${port}|${dbname}"
}

apply_supabase_schema_patches() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    log "WARN: ${ENV_FILE} missing — skip Supabase schema patches"
    return 0
  fi
  if ! is_supabase_target; then
    log "Non-Supabase target — skip schema patches"
    return 0
  fi
  if [[ ! -d "${PATCHES_DIR}" ]]; then
    log "WARN: No Supabase SQL patches at ${PATCHES_DIR}"
    return 0
  fi

  local db_url db_user db_password parsed host port dbname patch
  db_url="$(read_env_value DB_URL)"
  db_user="$(read_env_value DB_USER)"
  db_password="$(read_env_value DB_PASSWORD)"

  if [[ -z "${db_url}" || -z "${db_user}" || -z "${db_password}" ]]; then
    log "ERROR: DB_URL, DB_USER, and DB_PASSWORD required for Supabase schema patches"
    return 1
  fi

  ensure_psql

  IFS='|' read -r host port dbname <<< "$(parse_jdbc_url "${db_url}")"
  log "Applying Supabase schema patches to ${host}/${dbname}"

  shopt -s nullglob
  local patches=("${PATCHES_DIR}"/*.sql)
  shopt -u nullglob
  if ((${#patches[@]} == 0)); then
    log "WARN: No .sql files in ${PATCHES_DIR}"
    return 0
  fi

  for patch in "${patches[@]}"; do
    log "Applying $(basename "${patch}")"
    PGPASSWORD="${db_password}" psql \
      "host=${host} port=${port} dbname=${dbname} user=${db_user} sslmode=require" \
      -v ON_ERROR_STOP=1 \
      -f "${patch}"
  done

  log "Supabase schema patches applied"
}

apply_supabase_schema_patches "$@"
