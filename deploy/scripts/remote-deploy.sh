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
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8080/actuator/health}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-30}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"

log() {
  echo "[$(date -Iseconds)] $*"
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    log "ERROR: Run as root (GitHub Actions uses sudo)."
    exit 1
  fi
}

wait_for_health() {
  local label="$1"
  local attempt
  for attempt in $(seq 1 "${MAX_ATTEMPTS}"); do
    if curl -sf "${HEALTH_URL}" | grep -q '"status":"UP"'; then
      log "${label}: health check passed (${HEALTH_URL})"
      return 0
    fi
    if systemctl is-failed --quiet "${SERVICE_NAME}" 2>/dev/null; then
      log "ERROR: ${SERVICE_NAME} failed during startup (sync DB_PASSWORD from SSM into ${APP_PATH}/config/application.env)"
      journalctl -u "${SERVICE_NAME}" -n 25 --no-pager 2>/dev/null || true
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
    return 0
  fi
  log "Setting nginx client_max_body_size 15M for admin image uploads"
  sed -i '/server_name _;/a\    client_max_body_size 15M;' "${conf}"
  nginx -t
  systemctl reload nginx
}

require_root

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

if wait_for_health "deploy"; then
  prune_backups
  log "Deployment successful"
  exit 0
fi

log "ERROR: New version failed health check"
if [[ -n "${BACKUP_FILE}" ]]; then
  rollback "${BACKUP_FILE}" || true
fi
exit 1
