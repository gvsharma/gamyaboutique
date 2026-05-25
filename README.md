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

## Phase 1 APIs

- **Public (guest):** `GET /catalog/**`, `GET /products/**`, `POST /products/{id}/interest`
- **Auth:** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`
- **CRM (STAFF/ADMIN):** `/crm/leads/**`
- **Admin:** `GET /admin/dashboard/**`

## Out of scope

Payment, orders, refresh token rotation (TODO in README only), email/SMS delivery.

## Optional: Spring Modulith

Add `spring-modulith-starter` and `ApplicationModules.of(App.class).verify()` in tests to enforce package boundaries.
