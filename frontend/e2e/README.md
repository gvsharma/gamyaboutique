# Playwright E2E — Gamya Couture

Browser automation for **storefront (user)** and **admin** journeys.

## How this helps you

| Problem | How Playwright helps |
|---------|---------------------|
| "Did my deploy break login or cart?" | Smoke suite catches critical paths in minutes |
| "Admin publish still works?" | Admin specs create → publish → verify on shop |
| "I only tested locally" | Same scripts run against `localhost`, Vercel preview, or dev EC2 |
| "Manual QA checklist is long" | Automate repeatable rows; keep edge cases manual |
| "Cursor agent exploring UI" | `@playwright/mcp` in `.cursor/mcp.json` drafts/fixes these specs |

## Layout

```
e2e/
├── auth.setup.ts              # Optional: cache admin/customer storageState
├── fixtures/
│   ├── env.ts                 # E2E_RUN gate + credentials
│   ├── admin-test.ts          # Auto admin login fixture
│   └── customer-test.ts       # Register + login customer fixture
├── pages/                     # Page Object Model
├── smoke/                     # PR CI gate (~3–8 min with stack)
├── user/                      # Storefront flows
└── admin/                     # Admin flows
```

## Suites

| Project | Specs | Needs backend |
|---------|-------|---------------|
| **smoke** | `critical-path`, `marketing-routes` | Partial (`E2E_RUN=1` for cart/admin redirect) |
| **user** | `auth`, `browse-cart`, `forgot-password`, `addresses`, `wishlist`, `mobile` | Yes |
| **admin** | `access-control`, `products-crud`, `categories`, `ops-readonly` | Yes |

## Prerequisites

1. **Frontend:** `npm run dev` (port 3000) or set `E2E_BASE_URL`
2. **Backend:** Spring Boot on 8080 with Flyway seed (`local` profile)
3. **Env:** `E2E_RUN=1` for API-backed tests

### Credentials (local dev defaults)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gamyacouture.com` | `Admin@123` |

Override with `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD`.

## Commands

```bash
cd frontend

# Smoke — used on every PR in CI (starts full stack in GitHub Actions)
npm run test:e2e:smoke

# User flows
npm run test:e2e:user

# Admin flows
npm run test:e2e:admin

# Full regression (nightly / pre-release)
npm run test:e2e:full

# Interactive debugger
npm run test:e2e:ui
```

### Local full stack

```bash
# Terminal 1
docker compose up -d postgres
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd frontend && E2E_RUN=1 npm run test:e2e:full
```

## CI integration

| Workflow | When | What runs |
|----------|------|-----------|
| `validate.yml` → **E2E smoke** | Every PR / push to `main` | Postgres + backend + frontend + `test:e2e:smoke` |
| `e2e-nightly.yml` | Weekdays 02:30 UTC + manual | Full suite (`test:e2e:full`) |

### Nightly against dev (optional)

Set GitHub secrets and run workflow with **target = dev**:

| Secret | Example |
|--------|---------|
| `E2E_BASE_URL` | `https://gamyaboutique.vercel.app` |
| `E2E_ADMIN_EMAIL` | `admin@gamyacouture.com` |
| `E2E_ADMIN_PASSWORD` | (dev admin password) |

Run during EC2/RDS uptime window (see infra scheduler docs).

## Playwright MCP (Cursor)

Project config: `.cursor/mcp.json` (`@playwright/mcp`).

Use MCP to explore failures; keep regression in this folder as versioned specs.
