# Backend Setup — Gamya Couture

Spring Boot modular monolith serving REST APIs at `/api/v1`. Source lives at the repo root (`src/`), not in a separate `backend/` folder.

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Java | 21 | Matches `pom.xml` `<java.version>` |
| Maven | 3.9+ | Wrapper not included — use system Maven |
| Docker | Latest | Required for integration tests (Testcontainers) |
| PostgreSQL | 16–17 | Local Docker, Supabase (primary hosted), or legacy RDS |

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
  application-local.yml     Local Docker Postgres + Flyway
  application-dev.yml       Legacy EC2 / RDS profile
  application-supabase.yml  Hosted Supabase (Flyway off)
  db/migration/             Flyway V1–V21 (local/RDS JAR path)
  db/migration-dev/         Local-only seed V100 (excluded from JAR)
supabase/migrations/        Canonical schema for Supabase project
```

Artifact: `target/gamya-couture-0.1.0-SNAPSHOT.jar`

---

## Spring profiles

| Profile | When | Database | Schema management |
|---------|------|----------|-------------------|
| `local` | Laptop dev | Docker Postgres `gamya_couture` | Flyway `db/migration` + `db/migration-dev` |
| `supabase` | Laptop or EC2 → Supabase | Project `nlntrftvzcwtrdenufoi` | `supabase/migrations` (Flyway **disabled**) |
| `dev` | Legacy EC2 → RDS | RDS database `gamya` | Flyway `db/migration` only |
| (default) | Tests | Testcontainers | Per test config |

Activate locally (Docker):

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Activate against Supabase:

```bash
cp .env.supabase.example .env.supabase   # fill DB_PASSWORD
set -a && source .env.supabase && set +a
mvn spring-boot:run -Dspring-boot.run.profiles=supabase
```

On EC2 (preferred), set in `/opt/gamya-couture/config/application.env`:

```bash
DB_PROVIDER=supabase
SPRING_PROFILES_ACTIVE=supabase
```

Template: [deploy/env/application.supabase.env.example](../deploy/env/application.supabase.env.example)

---

## Database options

### Option A — Docker Postgres (recommended for offline local dev)

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

### Option B — Supabase (preferred hosted DB)

Project: [gamyacouture](https://supabase.com/dashboard/project/nlntrftvzcwtrdenufoi) (`ap-southeast-2`).

| Setting | Value |
|---------|-------|
| JDBC (direct) | `jdbc:postgresql://db.nlntrftvzcwtrdenufoi.supabase.co:5432/postgres?sslmode=require` |
| User | `postgres` |
| Password | Dashboard → Database settings (not in git) |
| Profile | `supabase` (`spring.flyway.enabled=false`) |

Schema + seed live under `supabase/migrations/`. Auth remains **custom Spring JWT** (not Supabase Auth). Spring connects as `postgres` and bypasses RLS; RLS protects PostgREST/anon access.

Deploy note: when `DB_PROVIDER=supabase` (or profile/`DB_URL` contains supabase), `sync-rds-env-from-ssm.sh` **does not** overwrite credentials with RDS SSM values. Optional password-only SSM path: `/gamya-couture/dev/supabase/db/password`.

### Option C — RDS (legacy)

Point env vars at the Terraform-managed RDS instance. Use profile `dev`:

```bash
export SPRING_PROFILES_ACTIVE=dev
export DB_PROVIDER=rds
export DB_URL=jdbc:postgresql://<rds-endpoint>:5432/gamya
export DB_USER=gamya_admin
export DB_PASSWORD=<from SSM>
mvn spring-boot:run
```

Template: [deploy/env/application.env.example](../deploy/env/application.env.example) (RDS section commented).

**Note:** Local Docker uses database `gamya_couture`; AWS RDS uses `gamya`. Same Flyway scripts apply to both.

### Option D — Docker app container → RDS (legacy)

For EC2 without systemd:

```bash
cp .env.prod.example .env   # edit DB_URL, credentials
docker compose -f docker-compose.rds.yml up -d --build
```

Or: `./scripts/deploy-ec2-rds.sh`

---

## Schema management

| Path | Used by |
|------|---------|
| `supabase/migrations/` | Supabase project (MCP / CLI) — source of truth for hosted DB |
| `src/main/resources/db/migration/` | Flyway on `local` / `dev` (V1–V21 consolidated state) |

| Behavior | Detail |
|----------|--------|
| `local` / `dev` | Flyway on every Spring Boot startup |
| `supabase` | Flyway **off** — apply SQL via Supabase migrations only |
| Local extra seed | `db/migration-dev/V100__dev_synthetic_seed.sql` — **local profile only** |
| JAR packaging | `migration-dev/` is **excluded** from production JAR (see `pom.xml`) |
| Dev RDS | `validate-on-migrate: false`, `out-of-order: true` in `application-dev.yml` |

Verify after startup:

```bash
curl -s http://localhost:8080/actuator/health
curl -s "http://localhost:8080/api/v1/products?page=0&size=3"
```

Check Flyway history (local/RDS only):

```sql
SELECT installed_rank, version, description, success
FROM flyway_schema_history ORDER BY installed_rank;
```

**Default credentials** (admin seed):

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

| Variable | Local default | EC2 (Supabase) |
|----------|---------------|----------------|
| `DB_URL` | Docker `gamya_couture` | Supabase JDBC + `sslmode=require` |
| `DB_USER` / `DB_PASSWORD` | `gamya` / `gamya_secret` | `postgres` + Dashboard / SSM supabase path |
| `DB_PROVIDER` | — | `supabase` (or `rds` legacy) |
| `SPRING_PROFILES_ACTIVE` | `local` | `supabase` |
| `JWT_SECRET` | Dev placeholder | Strong secret (≥256 bits) |
| `JWT_ACCESS_EXPIRATION_MS` | 1800000 (30m) | optional |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Vercel + localhost |
| `APP_STORAGE_S3_ENABLED` | `false` | `true` |
| `APP_STORAGE_S3_BUCKET` | — | `gamya-couture-dev-media` |
| `APP_STORAGE_S3_PUBLIC_BASE_URL` | — | CloudFront URL |
| `MAIL_ENABLED` | `false` | `true` when SMTP configured |

Templates: [application.supabase.env.example](../deploy/env/application.supabase.env.example) · [application.env.example](../deploy/env/application.env.example)

---

## S3 product images

Locally, S3 is disabled by default. On EC2 (`supabase` or `dev` profile), uploads go to S3 via the instance IAM role when `APP_STORAGE_S3_ENABLED=true`.

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
sudo cp deploy/env/application.supabase.env.example /opt/gamya-couture/config/application.env
# Set DB_PASSWORD from Supabase Dashboard; optional: put password in SSM
#   /gamya-couture/dev/supabase/db/password then run sync-rds-env-from-ssm.sh
# Edit JWT_SECRET, verify CORS — keep DB_PROVIDER=supabase
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

Deploy scripts sync DB password from SSM when present: Supabase path if `DB_PROVIDER=supabase`, else RDS. They never rewrite a Supabase `DB_URL` to RDS. Rollback is automatic if health check fails.

Details: [deploy/README.md](../deploy/README.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [INFRA-SETUP.md](./INFRA-SETUP.md)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Flyway checksum mismatch on RDS | Dev profile allows out-of-order; check logs |
| Deploy overwrote Supabase with RDS | Ensure `DB_PROVIDER=supabase` or profile/URL targets supabase.co |
| Supabase auth failed / SSL | Use `sslmode=require`; confirm Dashboard DB password |
| Connection refused to Postgres | `docker compose ps`; ensure port 5432 free |
| EC2 cannot reach Supabase (IPv6) | Use Session-mode pooler JDBC from Dashboard → Connect |
| Tests fail with Docker error | Start Docker Desktop |
| Port 8080 in use | `lsof -i :8080` and stop conflicting process |
| S3 upload 403 on EC2 | Verify instance IAM role has `s3:PutObject` on media bucket |
