#!/usr/bin/env bash
# Sync database credentials into EC2 application.env.
#
# Default (legacy): pull RDS username/password from SSM and rewrite DB_URL to RDS.
# Supabase: when application.env already targets Supabase (or DB_PROVIDER=supabase),
# do NOT overwrite DB_URL / DB_USER / DB_PASSWORD with RDS SSM values.
#
# Optional Supabase password sync from SSM:
#   SSM_SUPABASE_DB_PASSWORD_PATH=/gamya-couture/dev/supabase/db/password
#
# Usage (on EC2 as root):
#   sudo bash deploy/scripts/sync-rds-env-from-ssm.sh
#   sudo bash deploy/scripts/sync-rds-env-from-ssm.sh /opt/gamya-couture/config/application.env
set -euo pipefail

ENV_FILE="${1:-/opt/gamya-couture/config/application.env}"
REGION="${AWS_REGION:-ap-south-1}"
USERNAME_PATH="${SSM_DB_USERNAME_PATH:-/gamya-couture/dev/db/username}"
PASSWORD_PATH="${SSM_DB_PASSWORD_PATH:-/gamya-couture/dev/db/password}"
SUPABASE_PASSWORD_PATH="${SSM_SUPABASE_DB_PASSWORD_PATH:-/gamya-couture/dev/supabase/db/password}"
DB_HOST="${RDS_HOST:-gamya-couture-dev-pg.c8xkhvlstsfp.ap-south-1.rds.amazonaws.com}"
DB_NAME="${RDS_DATABASE:-gamya}"

log() { echo "[$(date -Iseconds)] $*"; }

read_env_value() {
  local key="$1"
  if [[ ! -f "$ENV_FILE" ]]; then
    echo ""
    return 0
  fi
  # shellcheck disable=SC2002
  grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true
}

is_supabase_target() {
  local provider profile db_url
  provider="${DB_PROVIDER:-$(read_env_value DB_PROVIDER)}"
  profile="${SPRING_PROFILES_ACTIVE:-$(read_env_value SPRING_PROFILES_ACTIVE)}"
  db_url="${DB_URL:-$(read_env_value DB_URL)}"

  [[ "${provider}" == "supabase" ]] && return 0
  [[ "${profile}" == *supabase* ]] && return 0
  [[ "${db_url}" == *supabase.co* ]] && return 0
  return 1
}

upsert() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

if ! command -v aws >/dev/null 2>&1; then
  log "ERROR: aws CLI not found — run ec2-bootstrap.sh first (dnf install blocked during deploy)"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  log "ERROR: $ENV_FILE not found. Run ec2-bootstrap.sh first."
  exit 1
fi

if is_supabase_target; then
  log "Supabase target detected — skipping RDS credential overwrite"
  # Keep DB_PROVIDER explicit so future deploys stay on Supabase.
  upsert "DB_PROVIDER" "supabase"

  if [[ -n "${DB_PASSWORD:-}" ]]; then
    log "Using DB_PASSWORD from environment for Supabase"
    upsert "DB_PASSWORD" "${DB_PASSWORD}"
  else
    local_pwd=""
    local_pwd="$(aws ssm get-parameter \
      --name "${SUPABASE_PASSWORD_PATH}" \
      --with-decryption \
      --region "${REGION}" \
      --query 'Parameter.Value' \
      --output text 2>/dev/null || true)"
    if [[ -n "${local_pwd}" && "${local_pwd}" != "None" ]]; then
      upsert "DB_PASSWORD" "${local_pwd}"
      log "DB_PASSWORD synced from SSM (${SUPABASE_PASSWORD_PATH})"
    else
      log "WARN: No SSM parameter at ${SUPABASE_PASSWORD_PATH} — leaving existing DB_PASSWORD unchanged"
    fi
  fi

  chmod 640 "$ENV_FILE"
  chown root:gamya "$ENV_FILE"
  log "Updated $ENV_FILE for Supabase (DB_URL/DB_USER preserved)."
  log "Restart backend: sudo systemctl restart gamya-couture-backend"
  exit 0
fi

log "Fetching DB username from $USERNAME_PATH"
DB_USER="$(aws ssm get-parameter \
  --name "$USERNAME_PATH" \
  --with-decryption \
  --region "$REGION" \
  --query 'Parameter.Value' \
  --output text)"

if [[ -n "${DB_PASSWORD:-}" ]]; then
  log "Using DB_PASSWORD from environment (skip SSM password fetch)"
else
  log "Fetching DB password from $PASSWORD_PATH"
  DB_PASSWORD="$(aws ssm get-parameter \
    --name "$PASSWORD_PATH" \
    --with-decryption \
    --region "$REGION" \
    --query 'Parameter.Value' \
    --output text)"
fi

DB_URL="jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}"

upsert "DB_PROVIDER" "rds"
upsert "DB_URL" "$DB_URL"
upsert "DB_USER" "$DB_USER"
upsert "DB_PASSWORD" "$DB_PASSWORD"

chmod 640 "$ENV_FILE"
chown root:gamya "$ENV_FILE"

log "Updated $ENV_FILE with RDS connection (user=${DB_USER}, db=${DB_NAME})."
log "Restart backend: sudo systemctl restart gamya-couture-backend"
