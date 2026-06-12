# Testing Strategy — Gamya Couture

## Goals

- Catch regressions before merge to `main`
- Block broken builds from EC2 deploy
- Validate critical commerce flows (auth, cart, catalog)
- Keep feedback fast on PRs (< 15 min)

## Test pyramid

```
                    ┌─────────────┐
                    │  E2E (few)  │  Playwright — critical journeys
               ┌────┴─────────────┴────┐
               │  API / Integration    │  REST Assured / MockMvc + Testcontainers
          ┌────┴───────────────────────┴────┐
          │     Frontend component/unit     │  Vitest + RTL (planned)
     ┌────┴─────────────────────────────────┴────┐
     │           Backend unit tests               │  JUnit 5 + Mockito
     └────────────────────────────────────────────┘
```

---

## 1. Unit tests (backend)

**Scope:** Pure logic, validators, mappers, service methods with mocked dependencies.

**Tooling:** JUnit 5, Mockito, AssertJ (via spring-boot-starter-test).

**Current coverage:**

| Area | Status | Location |
|------|--------|----------|
| CRM interest service | ✅ | `CustomerInterestServiceTest` |
| Product controller (mock) | ✅ | `ProductControllerTest` |
| Category controller | ✅ | `CategoryControllerTest` |
| Auth (login, lockout, reset) | ❌ **Add** | `AuthServiceTest`, `SessionServiceTest` |
| Cart stock validation | ❌ **Add** | `CartServiceTest` |
| Password validator | ❌ **Add** | `PasswordValidatorTest` |

**Priority additions (P0):**

```java
// AuthServiceTest — login unknown user returns generic 401
// CartServiceTest — addItem validates existing + new quantity against stock
// SessionServiceTest — revokeAllForUser clears active sessions
```

**Run:** `mvn test` or `mvn -Dtest=AuthServiceTest test`

**Gate:** Required in CI (`mvn verify`)

---

## 2. Integration tests (backend)

**Scope:** Spring context, DB, Flyway migrations, repository queries, security filters.

**Tooling:** `@SpringBootTest`, Testcontainers PostgreSQL 16, `@Transactional` rollback where appropriate.

**Current:**

| Test | What it validates |
|------|-------------------|
| `GamyaCoutureApplicationTests` | Context loads + Flyway V1–V12 on real Postgres |

**Planned (P1):**

| Test class | Scenarios |
|------------|-----------|
| `AuthIntegrationTest` | Register → login → refresh → logout; lockout after 5 failures |
| `CartIntegrationTest` | Guest add → merge on login; stock cap; inactive product rejected |
| `WishlistIntegrationTest` | Add duplicate → 409; moveToCart removes item |
| `FlywayMigrationTest` | Clean DB applies all migrations without error |

**Pattern:**

```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class AuthIntegrationTest {
  @Container static PostgreSQLContainer<?> postgres = ...;
  @Autowired TestRestTemplate rest;
  // ...
}
```

**Gate:** Included in `mvn verify` (CI)

---

## 3. API tests

**Scope:** HTTP contract, status codes, JSON envelope (`ApiResponse`), auth headers.

**Tooling options:**

| Tool | Use case |
|------|----------|
| MockMvc (standalone) | Controller unit tests — **current** |
| `@WebMvcTest` + `@MockBean` | Slice tests per controller |
| REST Assured | Full HTTP against `@SpringBootTest` random port |
| Postman/Newman | External collection for staging |

**Public endpoints to cover:**

```
GET  /api/v1/categories/tree          → 200
GET  /api/v1/products?page=0&size=12    → 200, pagination fields
GET  /api/v1/products/{id}              → 200 / 404
POST /api/v1/auth/register              → 201/200, 409 duplicate
POST /api/v1/auth/login                 → 200, 401 generic
POST /api/v1/cart/items                 → 200 (guest header)
GET  /api/v1/wishlist                   → 401 without token
```

**Post-deploy smoke:** `scripts/smoke-test-api.sh` (runs in deploy workflow)

**Optional secrets for authenticated smoke:** `SMOKE_TEST_EMAIL`, `SMOKE_TEST_PASSWORD` in GitHub Actions.

---

## 4. Frontend tests

**Scope:** Components, hooks, form validation, API client behavior.

**Tooling (recommended — not yet installed):**

| Layer | Tool |
|-------|------|
| Unit/component | Vitest + React Testing Library |
| API mocking | MSW (Mock Service Worker) |
| Snapshot | Minimal — prefer behavioral assertions |

**Priority tests (P1):**

| Component / module | Cases |
|--------------------|-------|
| `Input` / `Textarea` | Label `htmlFor` wiring, error `aria-describedby` |
| `login-form` | Validation errors, successful redirect |
| `product-image-gallery` | Keyboard nav, thumbnail selection |
| `auth.service` | Token storage, merge cart called post-login |
| `cart.service` | Guest header attached when no token |

**Current CI gate:** `npm run lint`, `npx tsc --noEmit`, `npm run build`

**Run locally:**

```bash
cd frontend
npm ci && npm run lint && npx tsc --noEmit && npm run build
```

---

## 5. E2E tests

**Scope:** Full browser journeys against staging (Vercel preview + EC2 API).

**Tooling:** Playwright (recommended).

**Critical journeys (P1):**

| ID | Journey |
|----|---------|
| E2E-01 | Browse shop → open PDP → add to cart → view cart drawer |
| E2E-02 | Register → login → profile visible in navbar |
| E2E-03 | Login → add wishlist → move to bag |
| E2E-04 | Guest cart → login → cart merged (count matches) |
| E2E-05 | Admin login → create draft product → publish |
| E2E-06 | Forgot password form submits (no enumeration leak in UI) |

**Environment:**

```bash
BASE_URL=https://gamyaboutique.vercel.app
# Or preview URL from PR
```

**Gate:** Run nightly or pre-release (not blocking PR initially); promote to blocking after stability.

---

## 6. Regression tests

**When:** Before every production release and after hotfixes.

**Automated regression suite:**

1. CI validate workflow (backend + frontend + security)
2. `smoke-test-api.sh` against staging/production
3. Manual QA checklist (see MANUAL-QA-CHECKLIST.md)

**Manual regression focus areas:**

- Auth flows (register/login/logout/reset)
- Cart merge after login
- Admin product CRUD + S3 upload
- Category navigation + product grid
- Mobile layout (375px viewport)

---

## 7. Smoke tests

**Post-deploy (automated):** `scripts/smoke-test-api.sh`

| Check | Expected |
|-------|----------|
| `/actuator/health` | `"status":"UP"` |
| `GET /api/v1/categories/tree` | 200 |
| `GET /api/v1/products` | 200 |
| Guest cart add/get | 200 |
| `GET /api/v1/wishlist` (no token) | 401 |

**Post-Vercel (manual, 5 min):**

- Homepage loads, hero image visible
- Shop page shows products
- Login page renders
- `/api/v1/products` proxied correctly (Network tab → 200)

---

## CI/CD gates

| Stage | Trigger | Must pass |
|-------|---------|-----------|
| PR validation | `pull_request → main` | validate.yml (all jobs) |
| Main validation | `push → main` | validate.yml |
| Deploy | `push → main` (after validate) | health + smoke |
| Vercel | merge to main | build succeeds |

**Deploy is blocked when:**

- `mvn verify` fails
- Frontend lint/typecheck/build fails
- Trivy CRITICAL/HIGH or npm audit HIGH
- Post-deploy health or smoke fails (auto-rollback via `remote-deploy.sh`)

---

## Test data & environments

| Environment | DB | Profile | Notes |
|-------------|-----|---------|-------|
| Local | Docker Postgres | `local` | `docker-compose.yml` |
| CI | Testcontainers | `test` | Ephemeral per run |
| EC2 dev | RDS private | `dev` | V13 dev seed optional |
| Production | RDS private | `prod` (planned) | No dev seeds |

**Never use production credentials in CI logs.** Use GitHub encrypted secrets for smoke auth.

---

## Roadmap (90 days)

| Week | Deliverable |
|------|-------------|
| 1 | AuthServiceTest + CartServiceTest; smoke script in deploy ✅ |
| 2 | AuthIntegrationTest with Testcontainers |
| 3 | Vitest setup + Input/LoginForm tests |
| 4 | Playwright E2E for E2E-01, E2E-02 |
| 6 | Newman/REST Assured full API collection |
| 8 | Nightly E2E against staging; Lighthouse CI on frontend |
