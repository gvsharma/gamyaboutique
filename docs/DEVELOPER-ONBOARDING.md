# Developer Onboarding — Gamya Couture

Welcome! This guide gets you from clone to a running local stack in ~15 minutes.

---

## 1. Prerequisites

Install before cloning:

| Tool | Version | Verify |
|------|---------|--------|
| Java | 21+ | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Node.js | 20+ | `node -version` |
| npm | 10+ | `npm -version` |
| Docker Desktop | Latest | `docker info` |
| Git | 2.x | `git --version` |

Optional: AWS CLI v2 (for deploy troubleshooting), IDE with Lombok support.

---

## 2. Clone the repository

```bash
git clone https://github.com/gvsharma/gamyaboutique.git
cd gamya-boutique
git checkout main   # or your feature branch
```

**Related repo:** [gamya-couture-infra](https://github.com/gvsharma/gamya-couture-infra) — Terraform for AWS (not needed for local dev).

---

## 3. Start PostgreSQL

```bash
docker compose up -d
docker compose ps   # should show gamya-couture-db healthy
```

Database: `gamya_couture` on `localhost:5432`, user `gamya`, password `gamya_secret`.

---

## 4. Run the backend

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Wait for log line indicating Flyway migrations completed and Tomcat started on port 8080.

Verify:

```bash
curl -s http://localhost:8080/actuator/health
curl -s "http://localhost:8080/api/v1/products?page=0&size=1"
```

Open Swagger: http://localhost:8080/swagger-ui.html

---

## 5. Run the frontend

In a second terminal:

```bash
cd frontend
cp .env.local.example .env.local
npm ci
npm run dev
```

Open http://localhost:3000 — you should see the storefront with seeded products.

---

## 6. Admin login

After Flyway seeds run (V8 admin user + local V100 synthetic data):

| Field | Value |
|-------|-------|
| Email | `admin@gamyacouture.com` |
| Password | `Admin@123` |

1. Go to http://localhost:3000/login
2. Sign in with the credentials above
3. You should redirect to `/admin` (dashboard, products, categories)

**Change this password before any production launch.**

Other seed accounts (local profile only):

| Role | Email | Password |
|------|-------|----------|
| Staff | `staff1@gamyacouture.com` | `Admin@123` |
| Customer | `customer1@example.com` | `Admin@123` |

---

## 7. Test against dev EC2 (optional)

To point your local frontend at the deployed dev API:

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=/api/v1
API_PROXY_TARGET=http://<EC2_PUBLIC_IP>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_IMAGE_CDN_HOST=d2568bpd35bq6a.cloudfront.net
```

Restart `npm run dev`. The Next.js rewrite proxies `/api/v1` to EC2.

Get current EC2 IP from Terraform output or GitHub Actions deploy logs.

---

## 8. Test-before-push policy

Run these before opening a PR or pushing:

```bash
# From repo root — requires Docker
mvn -B test          # or mvn -B verify for full integration tests

# Frontend
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

CI runs the same checks in [.github/workflows/validate.yml](../.github/workflows/validate.yml).

If Docker is not running, `mvn test` will fail on Testcontainers tests — start Docker first.

---

## 9. Project conventions

| Topic | Convention |
|-------|------------|
| API base path | `/api/v1` |
| Backend packages | `com.gamyacouture.<domain>` |
| Frontend API client | `frontend/src/lib/api/` |
| DB migrations | Add new Flyway script in `src/main/resources/db/migration/V{N}__*.sql` |
| Local-only seeds | `src/main/resources/db/migration-dev/` (never shipped in JAR) |
| Env templates | Never commit real secrets; use `.example` files |

---

## 10. Where to go next

| Task | Doc |
|------|-----|
| Backend details | [BACKEND-SETUP.md](./BACKEND-SETUP.md) |
| Frontend + Vercel | [frontend/README.md](../frontend/README.md) |
| AWS / deploy | [INFRA-SETUP.md](./INFRA-SETUP.md) |
| API reference | [API_CONTRACT.md](./API_CONTRACT.md) |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Manual QA | [production/MANUAL-QA-CHECKLIST.md](./production/MANUAL-QA-CHECKLIST.md) |

---

## Common first-day issues

| Problem | Solution |
|---------|----------|
| Port 5432 already in use | Stop other Postgres or change docker-compose port |
| Port 8080 in use | Kill other Java process |
| Empty storefront | Backend not running; check `NEXT_PUBLIC_API_BASE_URL` in `.env.local` |
| Flyway error on startup | Drop Docker volume: `docker compose down -v && docker compose up -d` |
| `npm run build` fails on Vercel env | Set build env vars (see frontend README) or build locally with `.env.local` |
| Admin login 401 | Ensure backend is on `local` profile and V8 migration ran |
