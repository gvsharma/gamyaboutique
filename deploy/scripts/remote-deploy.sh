#!/usr/bin/env bash
# Idempotent deploy script — runs on EC2 via GitHub Actions (sudo).
# Backs up the current JAR, installs the new one, restarts systemd, health-checks,
# and rolls back automatically if the new version fails.
set -euo pipefail

APP_PATH="${APP_PATH:-/opt/gamya-couture}"
SERVICE_NAME="gamya-couture-backend"
JAR_NAME="gamya-couture.jar"
INCOMING_JAR="${APP_PATH}/incoming/${JAR_NAME}.new"
ACTIVE_JAR="${APP_PATH}/app/${JAR_NAME}"
BACKUP_DIR="${APP_PATH}/backup"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8087/actuator/health}"
HEALTH_FALLBACK_URL="${HEALTH_FALLBACK_URL:-http://127.0.0.1:8087/health}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-72}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"

log() {
  echo "[$(date -Iseconds)] $*"
}

dump_service_diagnostics() {
  log "=== systemctl status ${SERVICE_NAME} ==="
  systemctl status "${SERVICE_NAME}" --no-pager -l 2>/dev/null || true
  log "=== journalctl (last 40 lines) ==="
  journalctl -u "${SERVICE_NAME}" -n 40 --no-pager 2>/dev/null || true
  if [[ -f "${APP_PATH}/logs/application.log" ]]; then
    log "=== application.log (last 40 lines) ==="
    tail -n 40 "${APP_PATH}/logs/application.log" 2>/dev/null || true
  fi
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    log "ERROR: Run as root (GitHub Actions uses sudo)."
    exit 1
  fi
}

is_healthy() {
  curl -sf "${HEALTH_URL}" 2>/dev/null | grep -q '"status":"UP"' && return 0
  curl -sf "${HEALTH_FALLBACK_URL}" 2>/dev/null | grep -q '"status":"UP"'
}

read_env_value() {
  local env_file="$1"
  local key="$2"
  grep -E "^${key}=" "${env_file}" 2>/dev/null | tail -n1 | cut -d= -f2- || true
}

is_supabase_target() {
  local env_file="$1"
  local provider profile db_url
  provider="$(read_env_value "${env_file}" DB_PROVIDER)"
  profile="$(read_env_value "${env_file}" SPRING_PROFILES_ACTIVE)"
  db_url="$(read_env_value "${env_file}" DB_URL)"
  [[ "${provider}" == "supabase" ]] && return 0
  [[ "${profile}" == *supabase* ]] && return 0
  [[ "${db_url}" == *supabase.co* ]] && return 0
  return 1
}

sync_db_password_from_ssm() {
  local env_file="${APP_PATH}/config/application.env"
  local region="${AWS_REGION:-ap-south-1}"
  local password_path="${SSM_DB_PASSWORD_PATH:-/gamya-couture/dev/db/password}"
  local supabase_password_path="${SSM_SUPABASE_DB_PASSWORD_PATH:-/gamya-couture/dev/supabase/db/password}"
  if [[ ! -f "${env_file}" ]]; then
    log "WARN: ${env_file} missing — skip SSM DB password sync"
    return 0
  fi
  if ! command -v aws >/dev/null 2>&1; then
    log "WARN: aws CLI not found — skip SSM DB password sync"
    return 0
  fi

  if is_supabase_target "${env_file}"; then
    password_path="${supabase_password_path}"
    log "Supabase target detected — using SSM path ${password_path} (not RDS)"
  fi

  local pwd
  pwd="$(aws ssm get-parameter \
    --name "${password_path}" \
    --with-decryption \
    --region "${region}" \
    --query 'Parameter.Value' \
    --output text 2>/dev/null || true)"
  if [[ -z "${pwd}" || "${pwd}" == "None" ]]; then
    if is_supabase_target "${env_file}"; then
      log "WARN: Could not read ${password_path} — leaving existing Supabase DB_PASSWORD unchanged"
    else
      log "WARN: Could not read ${password_path} from SSM"
    fi
    return 0
  fi
  if grep -q '^DB_PASSWORD=' "${env_file}"; then
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${pwd}|" "${env_file}"
  else
    echo "DB_PASSWORD=${pwd}" >> "${env_file}"
  fi
  chmod 640 "${env_file}"
  chown root:gamya "${env_file}"
  log "DB_PASSWORD synced from SSM (${password_path})"
}

quick_post_restart_check() {
  local attempt
  for attempt in $(seq 1 6); do
    if is_healthy; then
      log "deploy: health check passed"
      return 0
    fi
    if systemctl is-failed --quiet "${SERVICE_NAME}" 2>/dev/null; then
      log "ERROR: ${SERVICE_NAME} failed immediately after restart"
      dump_service_diagnostics
      return 1
    fi
    log "deploy: quick check ${attempt}/6 — not healthy yet"
    sleep 5
  done
  log "ERROR: ${SERVICE_NAME} not healthy after quick check"
  return 1
}

wait_for_health() {
  local label="$1"
  local attempt
  for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
    if is_healthy; then
      log "${label}: health check passed"
      return 0
    fi
    if systemctl is-failed --quiet "${SERVICE_NAME}" 2>/dev/null; then
      log "ERROR: ${SERVICE_NAME} failed during startup (check DB creds in ${APP_PATH}/config/application.env)"
      dump_service_diagnostics
      return 1
    fi
    log "${label}: attempt ${attempt}/${MAX_ATTEMPTS} — not healthy yet"
    sleep "${SLEEP_SECONDS}"
  done
  return 1
}

rollback() {
  local backup_file="$1"
  if [[ ! -f "${backup_file}" ]]; then
    log "ERROR: No backup to restore at ${backup_file}"
    return 1
  fi
  log "Rolling back to ${backup_file}"
  cp -a "${backup_file}" "${ACTIVE_JAR}"
  chown gamya:gamya "${ACTIVE_JAR}"
  chmod 640 "${ACTIVE_JAR}"
  systemctl restart "${SERVICE_NAME}"
  wait_for_health "rollback" || {
    log "CRITICAL: rollback version also failed health check"
    return 1
  }
  return 0
}

prune_backups() {
  local backups
  mapfile -t backups < <(ls -1t "${BACKUP_DIR}/${JAR_NAME}."* 2>/dev/null || true)
  if ((${#backups[@]} <= KEEP_BACKUPS)); then
    return 0
  fi
  local to_delete
  for to_delete in "${backups[@]:KEEP_BACKUPS}"; do
    log "Removing old backup ${to_delete}"
    rm -f "${to_delete}"
  done
}

# nginx default is 1m — product photos from phones are often 2–5MB.
ensure_nginx_upload_limit() {
  local conf="/etc/nginx/conf.d/gamya-api.conf"
  if [[ ! -f "${conf}" ]]; then
    log "WARN: nginx config ${conf} not found; skipping upload size check"
    return 0
  fi
  if grep -q 'client_max_body_size' "${conf}"; then
    if ! grep -q 'client_max_body_size 55M' "${conf}"; then
      log "Updating nginx client_max_body_size to 55M for admin media uploads"
      sed -i 's/client_max_body_size[^;]*;/client_max_body_size 55M;/' "${conf}"
      nginx -t
      systemctl reload nginx
    fi
    return 0
  fi
  log "Setting nginx client_max_body_size 55M for admin media uploads"
  sed -i '/server_name _;/a\    client_max_body_size 55M;' "${conf}"
  nginx -t
  systemctl reload nginx
}

ensure_s3_env_vars() {
  local env_file="${APP_PATH}/config/application.env"
  if [[ ! -f "${env_file}" ]]; then
    log "WARN: ${env_file} missing — skip S3 env sync"
    return 0
  fi
  declare -A defaults=(
    [APP_STORAGE_S3_ENABLED]="true"
    [APP_STORAGE_S3_BUCKET]="gamya-couture-dev-media"
    [APP_STORAGE_S3_REGION]="ap-south-1"
    [APP_STORAGE_S3_PUBLIC_BASE_URL]="https://d2568bpd35bq6a.cloudfront.net"
    [APP_STORAGE_S3_KEY_PREFIX]="products/"
  )
  local key value
  for key in "${!defaults[@]}"; do
    value="${defaults[$key]}"
    if grep -q "^${key}=" "${env_file}"; then
      continue
    fi
    log "Adding missing ${key} to application.env"
    echo "${key}=${value}" >> "${env_file}"
  done
  chmod 640 "${env_file}"
  chown root:gamya "${env_file}"
}

require_root

sync_db_password_from_ssm

ensure_s3_env_vars

ensure_nginx_upload_limit

mkdir -p "${APP_PATH}/incoming" "${APP_PATH}/app" "${BACKUP_DIR}" "${APP_PATH}/logs"
chown -R gamya:gamya "${APP_PATH}/logs"

if [[ ! -f "${INCOMING_JAR}" ]]; then
  log "ERROR: Incoming JAR not found at ${INCOMING_JAR}"
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/${JAR_NAME}.${TIMESTAMP}"

if [[ -f "${ACTIVE_JAR}" ]]; then
  log "Backing up current JAR → ${BACKUP_FILE}"
  cp -a "${ACTIVE_JAR}" "${BACKUP_FILE}"
else
  log "No existing JAR — first deploy"
  BACKUP_FILE=""
fi

log "Installing new JAR"
mv -f "${INCOMING_JAR}" "${ACTIVE_JAR}"
chown gamya:gamya "${ACTIVE_JAR}"
chmod 640 "${ACTIVE_JAR}"

log "Restarting ${SERVICE_NAME}"
systemctl daemon-reload
systemctl restart "${SERVICE_NAME}"

if [[ "${SKIP_POST_RESTART_HEALTH_WAIT:-}" == "1" ]]; then
  if quick_post_restart_check; then
    prune_backups
    log "Deployment successful (CI will verify public health)"
    exit 0
  fi
elif wait_for_health "deploy"; then
  prune_backups
  log "Deployment successful"
  exit 0
fi

log "ERROR: New version failed health check"
dump_service_diagnostics
if [[ -n "${BACKUP_FILE}" ]]; then
  rollback "${BACKUP_FILE}" || true
fi
exit 1
