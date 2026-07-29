# Cursor Cloud Agent — Gamya Couture

Instructions for agents running in Cursor Cloud on this repository.

## Stack

| Layer | Path | Notes |
|-------|------|-------|
| Backend | `/workspace` | Java 21, Spring Boot 3.4, Maven |
| Frontend | `frontend/` | Next.js 15, Node 22 |
| Local DB | `docker compose` | Postgres 16 on `:5432` |
| Hosted DB | Supabase | Primary for EC2/prod (`supabase` profile) |
| Infra | `../gamya-couture-infra` | Terraform (optional clone) |

## Default local dev flow

1. Postgres terminal starts via `docker compose up postgres`
2. API terminal waits for DB, then `mvn spring-boot:run -Dspring-boot.run.profiles=local`
3. Frontend terminal runs `npm run dev` in `frontend/`

Verify:

```bash
curl -s http://localhost:8080/actuator/health
curl -s "http://localhost:8080/api/v1/products?page=0&size=1"
```

Storefront: http://localhost:3000  
Swagger: http://localhost:8080/swagger-ui.html

## Test credentials (local seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gamyacouture.com` | `Admin@123` |

## Validation commands

```bash
# Backend (same as CI)
mvn -B -ntp verify

# Frontend
cd frontend && npm ci && npm run lint && npx tsc --noEmit && npm run build

# Smoke
./scripts/smoke-test-api.sh http://127.0.0.1:8080
cd frontend && npm run test:e2e:smoke
```

## Supabase profile (hosted DB)

Requires dashboard secrets (`DB_PASSWORD`, etc.). Do not commit credentials.

```bash
export SPRING_PROFILES_ACTIVE=supabase
export DB_URL='jdbc:postgresql://db.nlntrftvzcwtrdenufoi.supabase.co:5432/postgres?sslmode=require'
export DB_USER=postgres
export DB_PASSWORD='<from-dashboard>'
mvn spring-boot:run -Dspring-boot.run.profiles=supabase
```

Template: `deploy/env/application.supabase.env.example`

## AWS / deploy guardrails

- **Do not** start/stop EC2 or deploy to production unless explicitly asked.
- EC2 workflows: `.github/workflows/deploy.yml`, `stop-ec2.yml`, `start-ec2.yml`
- Legacy RDS exists in AWS but app uses **Supabase** as primary DB.
- For AWS CLI from cloud agents, configure `CURSOR_AWS_ASSUME_IAM_ROLE_ARN` in [Cloud Agents secrets](https://cursor.com/dashboard/cloud-agents).

## Related docs

- `docs/DEVELOPER-ONBOARDING.md` — full local setup
- `docs/INFRA-SETUP.md` — AWS + GitHub Actions
- `frontend/e2e/README.md` — Playwright (MCP in `.cursor/mcp.json`)
