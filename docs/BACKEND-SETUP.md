# Backend Setup — Gamya Couture

Spring Boot modular monolith serving REST APIs at `/api/v1`. Source lives at the repo root (`src/`), not in a separate `backend/` folder.

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Java | 21 | Matches `pom.xml` `<java.version>` |
| Maven | 3.9+ | Wrapper not included — use system Maven |
| Docker | Latest | Required for integration tests (Testcontainers) |
| PostgreSQL | 16 | Via Docker locally, or RDS for dev/prod |

---

## Project layout

```
src/main/java/com/gamyacouture/
  auth/          Login, register, JWT sessions, password reset
  cart/          Guest + authenticated cart
  wishlist/      Saved items
  product/       Product browse + admin CRUD
  catalog/       Categories, fabrics, prints, tags, offers
  customer/      Profile, addresses
  crm/           Customer interest / leads
  admin/         Dashboard, media upload, taxonomy
  shared/        Security config, exceptions, S3 storage

src/main/resources/
  application.yml           Base config
  application-local.yml     Local dev profile
  application-dev.yml       EC2 / RDS dev profile
  db/migration/             Flyway V1–V20 (included in JAR)
  db/migration-dev/         Local-only seed V100 (excluded from JAR)
```

Artifact: `target/gamya-couture-0.1.0-SNAPSHOT.jar`

---

## Spring profiles

| Profile | When | Database | Flyway locations |
|---------|------|----------|------------------|
| `local` | Laptop dev | Docker Postgres `gamya_couture` | `db/migration` + `db/migration-dev` |
| `dev` | EC2 against RDS | RDS database `gamya` | `db/migration` only |
| (default) | Tests | Testcontainers / H2 | Per test config |

Activate locally:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

On EC2, set in `/opt/gamya-couture/config/application.env`:

```bash
SPRING_PROFILES_ACTIVE=dev
```

---

## Database options

### Option A — Docker Postgres (recommended for local dev)

```bash
docker compose up -d
```

| Setting | Value |
|---------|-------|
| Host | `localhost:5432` |
| Database | `gamya_couture` |
| User / password | `gamya` / `gamya_secret` |

Flyway runs automatically on startup. The `local` profile also applies `V100__dev_synthetic_seed.sql` for sample boutique data.

Alternative if you use a local Postgres install: `./scripts/setup-local-db.sh`

### Option B — RDS (dev environment)

Point env vars at the Terraform-managed RDS instance. Use profile `dev`:

```bash
export SPRING_PROFILES_ACTIVE=dev
export DB_URL=jdbc:postgresql://<rds-endpoint>:5432/gamya
export DB_USER=gamya_admin
export DB_PASSWORD=<from SSM>
mvn spring-boot:run
```

Template: [deploy/env/application.env.example](../deploy/env/application.env.example)

**Note:** Local Docker uses database `gamya_couture`; AWS dev uses `gamya`. Same migration scripts apply to both.

### Option C — Docker app container → RDS

For EC2 without systemd:

```bash
cp .env.prod.example .env   # edit DB_URL, credentials
docker compose -f docker-compose.rds.yml up -d --build
```

Or: `./scripts/deploy-ec2-rds.sh`

---

## Flyway migrations

Migrations live in `src/main/resources/db/migration/` (V1 through V20).

| Behavior | Detail |
|----------|--------|
| When they run | Every Spring Boot startup |
| Local extra seed | `db/migration-dev/V100__dev_synthetic_seed.sql` — **local profile only** |
| JAR packaging | `migration-dev/` is **excluded** from production JAR (see `pom.xml`) |
| Dev RDS | `validate-on-migrate: false`, `out-of-order: true` in `application-dev.yml` |

Verify after startup:

```bash
curl -s http://localhost:8080/actuator/health
curl -s "http://localhost:8080/api/v1/products?page=0&size=3"
```

Check migration history (psql):

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history ORDER BY installed_rank;
```

**Default credentials** (V8 seed):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gamyacouture.com` | `Admin@123` |
| Staff (local seed) | `staff1@gamyacouture.com` | `Admin@123` |
| Customer (local seed) | `customer1@example.com` | `Admin@123` |

---

## Running tests

Integration tests use **Testcontainers** — Docker must be running.

```bash
# Unit tests only
mvn -B test

# Full CI gate (unit + integration)
mvn -B verify
```

CI runs `mvn -B -ntp verify` in [.github/workflows/validate.yml](../.github/workflows/validate.yml).

**Before every push:** run `mvn -B test` (or `verify`) and frontend build. See [DEVELOPER-ONBOARDING.md](./DEVELOPER-ONBOARDING.md).

---

## API documentation (Swagger)

With the backend running:

| URL | Description |
|-----|-------------|
| http://localhost:8080/swagger-ui.html | Interactive UI |
| http://localhost:8080/v3/api-docs | OpenAPI JSON |

Configured in `application.yml` via springdoc-openapi.

---

## Environment variables

All config is overridable via environment variables. Key vars:

| Variable | Local default | EC2 |
|----------|---------------|-----|
| `DB_URL` | `jdbc:postgresql://localhost:5432/gamya_couture` | RDS JDBC URL |
| `DB_USER` / `DB_PASSWORD` | `gamya` / `gamya_secret` | `gamya_admin` + SSM |
| `JWT_SECRET` | dev placeholder | Strong secret |
| `JWT_ACCESS_EXPIRATION_MS` | 1800000 (30m) | optional |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Vercel + localhost |
| `APP_STORAGE_S3_ENABLED` | `false` | `true` |
| `APP_STORAGE_S3_BUCKET` | — | `gamya-couture-dev-media` |
| `APP_STORAGE_S3_PUBLIC_BASE_URL` | — | CloudFront URL |
| `MAIL_ENABLED` | `false` | `true` when SMTP configured |

Full template: [deploy/env/application.env.example](../deploy/env/application.env.example)

---

## S3 product images

Locally, S3 is disabled by default. On EC2 (`dev` profile), uploads go to S3 via the instance IAM role.

Admin upload endpoint: `POST /api/v1/admin/media/upload` (multipart, requires ADMIN JWT).

Example policies: [deploy/s3/](../deploy/s3/)

---

## EC2 production path

Backend on EC2 is managed by **systemd**, deployed via **GitHub Actions → S3 → SSM** (no SSH from CI).

### One-time bootstrap

```bash
# On EC2 via AWS Session Manager
sudo dnf install -y git
git clone https://github.com/gvsharma/gamyaboutique.git
cd gamya-boutique
sudo bash deploy/scripts/ec2-bootstrap.sh
sudo cp deploy/env/application.env.example /opt/gamya-couture/config/application.env
sudo bash deploy/scripts/sync-rds-env-from-ssm.sh
# Edit JWT_SECRET, verify CORS
sudo systemctl enable --now gamya-couture-backend
```

### Runtime paths on EC2

| Path | Purpose |
|------|---------|
| `/opt/gamya-couture/app/gamya-couture.jar` | Active JAR |
| `/opt/gamya-couture/config/application.env` | Secrets (640 root:gamya) |
| `/opt/gamya-couture/backup/` | Previous JARs (auto-pruned) |
| `/opt/gamya-couture/logs/` | App + deploy logs |

### Service management

```bash
sudo systemctl status gamya-couture-backend
sudo systemctl restart gamya-couture-backend
sudo journalctl -u gamya-couture-backend -f
tail -f /opt/gamya-couture/logs/application.log
```

### Automatic deploy (merge to `main`)

1. `validate.yml` — `mvn verify`, frontend lint/build
2. Build JAR → upload to S3 deploy bucket
3. SSM kickoff → `ssm-kickoff-deploy.sh` → `remote-deploy.sh`
4. Health check via nginx + smoke tests

Deploy scripts sync RDS password from SSM on each deploy. Rollback is automatic if health check fails.

Details: [deploy/README.md](../deploy/README.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [INFRA-SETUP.md](./INFRA-SETUP.md)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Flyway checksum mismatch on RDS | Dev profile allows out-of-order; check logs |
| Connection refused to Postgres | `docker compose ps`; ensure port 5432 free |
| Tests fail with Docker error | Start Docker Desktop |
| Port 8080 in use | `lsof -i :8080` and stop conflicting process |
| S3 upload 403 on EC2 | Verify instance IAM role has `s3:PutObject` on media bucket |
