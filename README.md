# Gamya Couture — Backend - Website(Next js)

Production-grade modular monolith for Gamya Couture boutique CRM and ecommerce catalog.

## Stack

- Java 21, Spring Boot 3.4, Maven
- PostgreSQL, Spring Data JPA, Flyway
- JWT authentication, Spring Security
- Lombok, MapStruct, OpenAPI (Swagger)

## Modules

| Package | Responsibility |
|---------|----------------|
| `auth` | Login, register, user accounts |
| `product` | Products, images, interest submission |
| `catalog` | Categories, browse by category |
| `crm` | Lead management |
| `customer` | Customer profiles |
| `notification` | Outbox / event listeners (skeleton) |
| `admin` | Dashboard APIs (ADMIN only) |
| `shared` | Security, API envelope, exceptions, audit |

## Frontend

Next.js 15 App Router storefront scaffold lives in [`frontend/`](frontend/). See [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md) and [frontend/FOLDER-STRUCTURE.md](frontend/FOLDER-STRUCTURE.md).

## Prerequisites

- Java 21+
- Maven 3.9+
- Docker (for local PostgreSQL)

## Quick start

```bash
docker compose up -d
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

- API base: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/actuator/health`

## Default admin (local dev)

After Flyway runs, seed user is available:

- Email: `admin@gamyacouture.com`
- Password: `Admin@123`

## Environment variables

| Variable | Default |
|----------|---------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/gamya_couture` |
| `DB_USER` | `gamya` |
| `DB_PASSWORD` | `gamya_secret` |
| `JWT_SECRET` | (see `application.yml` — change in production) |
| `JWT_ACCESS_EXPIRATION_MS` | `3600000` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` |

## Dev EC2 + RDS + Vercel (paired setup)

Full step-by-step: **[docs/AWS-DEV-SETUP.md](docs/AWS-DEV-SETUP.md)**

Backend and frontend env vars are designed to work together. See `frontend/.env.example` and `.env.prod.example`.

**Database:** Flyway migrations in `src/main/resources/db/migration/` create all tables and seed sample data on startup. RDS database name is `gamya` (local Docker uses `gamya_couture`).

**Production deploy:** GitHub Actions deploys to EC2 on every merge to `main`. See [deploy/README.md](deploy/README.md) for EC2 bootstrap, secrets, and systemd setup.

| Layer | Variable | Dev value |
|-------|----------|-----------|
| **EC2** | `DB_URL` | `jdbc:postgresql://gamya-couture-dev-pg....amazonaws.com:5432/gamya` |
| **EC2** | `DB_USER` / `DB_PASSWORD` | `gamya_admin` / `gamyaadmin` |
| **EC2** | `APP_STORAGE_S3_BUCKET` | `gamya-couture-dev-media` |
| **EC2** | `CORS_ALLOWED_ORIGINS` | `https://gamyaboutique.vercel.app,http://localhost:3000` |
| **EC2** | `SPRING_PROFILES_ACTIVE` | `dev` |
| **Vercel** | `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` |
| **Vercel** | `API_PROXY_TARGET` | `http://13.232.200.243` |
| **Vercel** | `NEXT_PUBLIC_SITE_URL` | `https://gamyaboutique.vercel.app` |

### Deploy backend on EC2 (RDS)

```bash
# On EC2 (Session Manager)
git clone <repo> && cd gamya-boutique
sudo bash deploy/scripts/ec2-bootstrap.sh
sudo bash deploy/scripts/sync-rds-env-from-ssm.sh
# Edit JWT_SECRET in /opt/gamya-couture/config/application.env
sudo systemctl start gamya-couture-backend
./scripts/verify-api-integration.sh http://13.232.200.243
```

nginx on the host proxies `:80` → Spring Boot `:8080`. Public API base: `http://13.232.200.243/api/v1`.

### Deploy frontend on Vercel

Set the three Vercel variables above, redeploy, then open the storefront — products load from EC2 via same-origin rewrite (avoids HTTPS→HTTP mixed content).

## Phase 1 APIs

- **Public (guest):** `GET /catalog/**`, `GET /products/**`, `POST /products/{id}/interest`
- **Auth:** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`
- **CRM (STAFF/ADMIN):** `/crm/leads/**`
- **Admin:** `GET /admin/dashboard/**`

## Out of scope

Payment, orders, refresh token rotation (TODO in README only), email/SMS delivery.

## Optional: Spring Modulith

Add `spring-modulith-starter` and `ApplicationModules.of(App.class).verify()` in tests to enforce package boundaries.
