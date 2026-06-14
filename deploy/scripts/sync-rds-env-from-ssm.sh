#!/usr/bin/env bash
# Pull RDS credentials from SSM and merge into EC2 application.env.
# Requires: AWS CLI, EC2 instance role with ssm:GetParameter on /gamya-couture/dev/db/*
#
# Usage (on EC2 as root):
#   sudo bash deploy/scripts/sync-rds-env-from-ssm.sh
#   sudo bash deploy/scripts/sync-rds-env-from-ssm.sh /opt/gamya-couture/config/application.env
set -euo pipefail

ENV_FILE="${1:-/opt/gamya-couture/config/application.env}"
REGION="${AWS_REGION:-ap-south-1}"
USERNAME_PATH="${SSM_DB_USERNAME_PATH:-/gamya-couture/dev/db/username}"
PASSWORD_PATH="${SSM_DB_PASSWORD_PATH:-/gamya-couture/dev/db/password}"
DB_HOST="${RDS_HOST:-gamya-couture-dev-pg.c8xkhvlstsfp.ap-south-1.rds.amazonaws.com}"
DB_NAME="${RDS_DATABASE:-gamya}"

log() { echo "[$(date -Iseconds)] $*"; }

if ! command -v aws >/dev/null 2>&1; then
  log "Installing AWS CLI v2..."
  dnf install -y aws-cli
fi

if [[ ! -f "$ENV_FILE" ]]; then
  log "ERROR: $ENV_FILE not found. Run ec2-bootstrap.sh first."
  exit 1
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

upsert() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

upsert "DB_URL" "$DB_URL"
upsert "DB_USER" "$DB_USER"
upsert "DB_PASSWORD" "$DB_PASSWORD"

chmod 640 "$ENV_FILE"
chown root:gamya "$ENV_FILE"

log "Updated $ENV_FILE with RDS connection (user=${DB_USER}, db=${DB_NAME})."
log "Restart backend: sudo systemctl restart gamya-couture-backend"
