# Backend production deployment (EC2 + GitHub Actions)

Deploys the Spring Boot JAR to EC2 via **S3 + SSM Run Command** when a PR is merged to `main` (no SSH from GitHub runners). Infrastructure is managed in [gamya-couture-infra](https://github.com/gvsharma/gamya-couture-infra).

## Folder structure

```
.github/workflows/
  deploy.yml                          # CI/CD: build → test → S3 upload → SSM deploy → health check

deploy/
  README.md                           # This file
  env/
    application.env.example           # EC2 runtime secrets template
  scripts/
    ec2-bootstrap.sh                  # One-time EC2 setup (Java, systemd, sudoers)
    remote-deploy.sh                  # Idempotent deploy + backup + rollback
  systemd/
    gamya-couture-backend.service     # systemd unit (installed to /etc/systemd/system/)

# On EC2 after bootstrap:
/opt/gamya-couture/
  app/gamya-couture.jar               # Active JAR (systemd runs this)
  incoming/gamya-couture.jar.new      # Staging upload from GitHub Actions
  backup/gamya-couture.jar.<timestamp> # Previous versions (auto-pruned)
  config/application.env              # DB, JWT, CORS (never committed)
  logs/application.log                # stdout/stderr from systemd
  scripts/remote-deploy.sh            # Copied each deploy; also installed at bootstrap
```

## GitHub configuration (required)

After `terraform apply` in `gamya-couture-infra/environments/dev`:

```bash
cd gamya-couture-infra/environments/dev
terraform output -json backend_deploy_github_setup
```

Configure in **gvsharma/gamyaboutique** → Settings → Secrets and variables → Actions.

**Secret** (Actions → **Secrets** tab):

| Secret | Source |
|--------|--------|
| `AWS_BACKEND_DEPLOY_ROLE_ARN` | `backend_deploy_role_arn` output |

**Variables or secrets** (Actions → **Variables** tab preferred; **Secrets** also works):

| Name | Required | Example (dev) | Source |
|------|----------|---------------|--------|
| `DEPLOY_BUCKET` | Yes | `gamya-couture-dev-backend-deploy` | `backend_deploy_bucket` output |
| `EC2_INSTANCE_ID` | No | `i-0652a9c1b9bf2c7dd` | `ec2_instance_id` output; auto-resolved by tag `gamya-couture-dev-api` if missing/stale |
| `EC2_HOST` | No | `13.232.200.243` | `api_public_ip` output (Elastic IP); auto-resolved at deploy time if missing |

Terraform in [gamya-couture-infra](https://github.com/gvsharma/gamya-couture-infra) can manage these automatically when `GAMYABOUTIQUE_GH_TOKEN` is set on the infra repo (see `modules/github-backend-deploy-config`).

No SSH keys required for CI. Port 22 can stay locked to your admin IP only.

## EC2 one-time setup

Connect via **AWS Session Manager** (instance `i-0652a9c1b9bf2c7dd`, region `ap-south-1`).

### 1. Clone repo and bootstrap

```bash
sudo dnf install -y git
git clone https://github.com/gvsharma/gamya-boutique.git
cd gamya-boutique
sudo APP_PATH=/opt/gamya-couture bash deploy/scripts/ec2-bootstrap.sh
```

### 2. Configure runtime secrets

```bash
sudo nano /opt/gamya-couture/config/application.env
# Set DB_PASSWORD, JWT_SECRET, CORS_ALLOWED_ORIGINS
sudo chmod 640 /opt/gamya-couture/config/application.env
sudo chown root:gamya /opt/gamya-couture/config/application.env
```

### 3. RDS PostgreSQL (Terraform-managed)

Dev uses **RDS**, not local Postgres. Credentials live in SSM:

| SSM path | Value |
|----------|-------|
| `/gamya-couture/dev/db/username` | `gamya_admin` |
| `/gamya-couture/dev/db/password` | (encrypted) |

**Quick setup** — sync into `application.env`:

```bash
sudo bash deploy/scripts/sync-rds-env-from-ssm.sh
```

Then set `JWT_SECRET` and verify `CORS_ALLOWED_ORIGINS` in `/opt/gamya-couture/config/application.env`.

Manual `DB_URL`:

```
jdbc:postgresql://gamya-couture-dev-pg.c8xkhvlstsfp.ap-south-1.rds.amazonaws.com:5432/gamya
```

Flyway runs on first Spring Boot start (schema + sample data). See [docs/AWS-DEV-SETUP.md](../docs/AWS-DEV-SETUP.md).

**Alternative:** Docker on EC2 without local Postgres — `./scripts/deploy-ec2-rds.sh` (uses `docker-compose.rds.yml`).

### 4. Verify nginx → Spring Boot

Terraform user-data installs nginx proxying `:80` → `127.0.0.1:8080`. After first deploy:

```bash
curl -s http://127.0.0.1:8080/actuator/health
curl -s http://13.232.200.243/actuator/health
curl -s http://13.232.200.243/api/v1/products?page=0&size=1
```

## Deployment flow (automatic on merge to main)

```
PR merged → push to main
  → mvn verify (unit + integration tests via Testcontainers)
  → find target/gamya-couture-*.jar
  → OIDC assume AWS_BACKEND_DEPLOY_ROLE_ARN
  → Start RDS + EC2 if stopped (cost scheduler); wait SSM Online
  → aws s3 cp JAR + scripts → s3://<DEPLOY_BUCKET>/incoming/
  → SSM short probe → SSM kickoff (nohup ssm-kickoff-deploy.sh)
       → downloads artifacts, sync-rds-env-from-ssm.sh
       → remote-deploy.sh (backup, install, systemd restart, health check, rollback)
  → Poll deploy.status via SSM until success/failed
  → curl http://<EC2_HOST>/actuator/health through nginx
  → smoke-test-api.sh
```

Async SSM avoids long-running command timeouts: `ssm-kickoff-deploy.sh` runs in the background on EC2; GitHub Actions polls `/opt/gamya-couture/logs/deploy.status`. See [docs/INFRA-SETUP.md](../docs/INFRA-SETUP.md).

## systemd service

```bash
sudo systemctl status gamya-couture-backend
sudo systemctl restart gamya-couture-backend
sudo journalctl -u gamya-couture-backend -f
tail -f /opt/gamya-couture/logs/application.log
```

Service name: **`gamya-couture-backend`**

## Rollback

Automatic: if the new JAR fails `/actuator/health`, `remote-deploy.sh` restores the previous backup and restarts the service. The GitHub Actions job still fails so you know the release was bad.

Manual rollback on EC2:

```bash
sudo cp /opt/gamya-couture/backup/gamya-couture.jar.<timestamp> \
        /opt/gamya-couture/app/gamya-couture.jar
sudo chown gamya:gamya /opt/gamya-couture/app/gamya-couture.jar
sudo systemctl restart gamya-couture-backend
```

## Frontend pairing (Vercel)

| Vercel | EC2 `application.env` |
|--------|----------------------|
| `NEXT_PUBLIC_API_BASE_URL=/api/v1` | — |
| `API_PROXY_TARGET=http://13.232.200.243` | — |
| `NEXT_PUBLIC_SITE_URL=https://gamyaboutique.vercel.app` | `CORS_ALLOWED_ORIGINS` must include this origin |

See `frontend/.env.example` in this repo.

## Infra reference (Terraform outputs)

| Output | Value |
|--------|-------|
| `api_public_ip` | `13.232.200.243` |
| `ec2_instance_id` | `i-0652a9c1b9bf2c7dd` |
| `aws_region` | `ap-south-1` |
| `health_url` | `http://13.232.200.243/health` (nginx static; app health is `/actuator/health`) |
