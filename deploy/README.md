# Backend production deployment (EC2 + GitHub Actions)

Deploys the Spring Boot JAR to EC2 over SSH when a PR is merged to `main`. Infrastructure is managed separately in [gamya-couture-infra](https://github.com/gvsharma/gamya-couture-infra).

## Folder structure

```
.github/workflows/
  deploy.yml                          # CI/CD: build → test → SSH deploy → health check

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

## GitHub Secrets (required)

Configure in **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Example | Description |
|--------|---------|-------------|
| `SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Private key matching a public key in EC2 `authorized_keys` |
| `EC2_HOST` | `13.232.200.243` | Elastic IP from Terraform output `api_public_ip` |
| `EC2_USER` | `ec2-user` | SSH user on Amazon Linux 2023 |
| `APP_PATH` | `/opt/gamya-couture` | Application root on EC2 (must match bootstrap) |

Never commit secrets. Do not hardcode them in the workflow.

### Generate deploy SSH key pair

On your laptop:

```bash
ssh-keygen -t ed25519 -C "github-actions-gamya-deploy" -f gamya-deploy-key -N ""
```

- Add **`gamya-deploy-key.pub`** to EC2: `/home/ec2-user/.ssh/authorized_keys`
- Add **`gamya-deploy-key`** (private) to GitHub secret `SSH_PRIVATE_KEY`

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

### 3. PostgreSQL (required — not in this repo)

The dev EC2 has no RDS. Run Postgres locally on the instance, e.g. with Docker:

```bash
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo docker run -d --name gamya-postgres --restart unless-stopped \
  -e POSTGRES_DB=gamya_couture \
  -e POSTGRES_USER=gamya \
  -e POSTGRES_PASSWORD='<same-as-application.env>' \
  -p 127.0.0.1:5432:5432 \
  -v gamya_pg_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

Ensure `DB_URL=jdbc:postgresql://127.0.0.1:5432/gamya_couture` in `application.env`.

### 4. Authorize GitHub Actions SSH key

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "<contents-of-gamya-deploy-key.pub>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 5. Security group — SSH access for GitHub Actions

Current dev SG allows SSH only from `admin_cidr` (often a single IP). GitHub-hosted runners use dynamic IPs, so you must choose one:

| Option | Tradeoff |
|--------|----------|
| **Self-hosted runner** in VPC/subnet | Best for production; no open SSH to internet |
| **SSM Run Command** (future) | No inbound SSH; requires workflow change |
| **Temporary SG rule** for GitHub IP ranges | Higher ops burden; not recommended long-term |

For initial dev testing, add your runner’s egress IP or use a self-hosted runner.

### 6. Verify nginx → Spring Boot

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
  → scp JAR → EC2:/opt/gamya-couture/incoming/gamya-couture.jar.new
  → scp remote-deploy.sh → EC2
  → ssh sudo remote-deploy.sh
       → backup current JAR
       → install new JAR
       → systemctl restart gamya-couture-backend
       → curl http://127.0.0.1:8080/actuator/health (up to 30 attempts)
       → on failure: restore backup JAR + restart + fail job
  → curl http://<EC2_HOST>/actuator/health through nginx
```

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
| `NEXT_PUBLIC_SITE_URL=https://gamyacouture.vercel.app` | `CORS_ALLOWED_ORIGINS` must include this origin |

See `frontend/.env.example` in this repo.

## Infra reference (Terraform outputs)

| Output | Value |
|--------|-------|
| `api_public_ip` | `13.232.200.243` |
| `ec2_instance_id` | `i-0652a9c1b9bf2c7dd` |
| `aws_region` | `ap-south-1` |
| `health_url` | `http://13.232.200.243/health` (nginx static; app health is `/actuator/health`) |
