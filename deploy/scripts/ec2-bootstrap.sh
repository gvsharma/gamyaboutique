#!/usr/bin/env bash
# One-time EC2 bootstrap for systemd + JAR deployments from GitHub Actions.
# Run on the instance as root (Session Manager or SSH):
#   sudo bash deploy/scripts/ec2-bootstrap.sh
set -euo pipefail

APP_PATH="${APP_PATH:-/opt/gamya-couture}"
SERVICE_NAME="gamya-couture-backend"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

log() { echo "[$(date -Iseconds)] $*"; }

if [[ "${EUID}" -ne 0 ]]; then
  log "ERROR: Run as root (sudo)."
  exit 1
fi

log "Installing Java 21 (Amazon Corretto)"
if ! command -v java >/dev/null 2>&1 || ! java -version 2>&1 | grep -q '21'; then
  dnf install -y java-21-amazon-corretto-headless
fi

log "Creating service user: gamya"
if ! id gamya >/dev/null 2>&1; then
  useradd --system --home-dir "${APP_PATH}" --shell /sbin/nologin gamya
fi

log "Creating application directories under ${APP_PATH}"
mkdir -p "${APP_PATH}"/{app,backup,incoming,config,logs,scripts}
chown -R gamya:gamya "${APP_PATH}"
chmod 750 "${APP_PATH}"
chown ec2-user:gamya "${APP_PATH}/incoming" "${APP_PATH}/scripts"
chmod 775 "${APP_PATH}/incoming" "${APP_PATH}/scripts"
chmod 750 "${APP_PATH}/config" "${APP_PATH}/app" "${APP_PATH}/backup" "${APP_PATH}/logs"

if [[ ! -f "${APP_PATH}/config/application.env" ]]; then
  log "Creating ${APP_PATH}/config/application.env from template"
  cp "${REPO_ROOT}/deploy/env/application.env.example" "${APP_PATH}/config/application.env"
  chmod 640 "${APP_PATH}/config/application.env"
  chown root:gamya "${APP_PATH}/config/application.env"
  log "IMPORTANT: Edit ${APP_PATH}/config/application.env with real secrets before starting the service."
fi

log "Installing systemd unit"
sed "s|/opt/gamya-couture|${APP_PATH}|g" \
  "${REPO_ROOT}/deploy/systemd/${SERVICE_NAME}.service" \
  > "/etc/systemd/system/${SERVICE_NAME}.service"

log "Configuring passwordless systemctl for ec2-user (GitHub Actions deploy)"
SUDOERS_FILE="/etc/sudoers.d/gamya-couture-deploy"
cat > "${SUDOERS_FILE}" <<EOF
# GitHub Actions: allow ec2-user to run the deploy script as root
ec2-user ALL=(root) NOPASSWD: ${APP_PATH}/scripts/remote-deploy.sh
EOF
chmod 440 "${SUDOERS_FILE}"
visudo -cf "${SUDOERS_FILE}"

log "Installing remote deploy script"
install -m 755 "${REPO_ROOT}/deploy/scripts/remote-deploy.sh" \
  "${APP_PATH}/scripts/remote-deploy.sh"

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}"

log "Bootstrap complete."
log "Next steps:"
log "  1. Edit ${APP_PATH}/config/application.env (DB, JWT, CORS)"
log "  2. Ensure PostgreSQL is reachable at DB_URL"
log "  3. Add GitHub Actions SSH public key to /home/ec2-user/.ssh/authorized_keys"
log "  4. Open port 22 to GitHub Actions (or use a self-hosted runner in VPC)"
log "  5. Merge to main — workflow deploys automatically"
