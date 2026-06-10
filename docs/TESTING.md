# Testing — Gamya Couture

QA reference for automated and manual testing. See also [docs/production/TESTING-STRATEGY.md](./production/TESTING-STRATEGY.md) for CI roadmap.

---

## Test strategy summary

| Layer | Tool | When | Gate |
|-------|------|------|------|
| Backend unit | JUnit 5 + Mockito | `mvn test` | CI |
| Backend integration | Testcontainers Postgres | `mvn verify` | CI |
| API smoke | `scripts/smoke-test-api.sh` | Post-deploy | CD |
| Frontend lint | ESLint | PR | CI |
| Frontend build | `next build` + tsc | PR | CI |
| Security | npm audit + Trivy | PR | CI |
| Manual QA | Checklist below | Pre-release | Human |
| E2E | Playwright (`frontend/e2e/`) | Pre-release | Manual (`E2E_RUN=1`) |

```bash
# Local full validation
mvn verify                    # needs Docker for GamyaCoutureApplicationTests
cd frontend && npm ci && npm run lint && npx tsc --noEmit && npm run build
./scripts/smoke-test-api.sh http://localhost:8080

# E2E (frontend + backend must be running)
cd frontend
E2E_RUN=1 E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

---

## Automated smoke tests

### `scripts/smoke-test-api.sh`

| Check | Expected |
|-------|----------|
| `/actuator/health` | UP |
| `GET /categories/tree` | 200 |
| `GET /products` | 200 |
| Guest cart add/get | 200 |
| `GET /wishlist` (no token) | 401 |
| Login + `/auth/me` | 200 (if `SMOKE_EMAIL`/`SMOKE_PASSWORD` set) |

### `scripts/verify-api-integration.sh`

Legacy catalog-only check: categories tree + products page.

---

## Manual QA checklist (abbreviated)

Full checklist: [docs/production/MANUAL-QA-CHECKLIST.md](./production/MANUAL-QA-CHECKLIST.md)

### Auth
- [ ] Register with email; register with phone
- [ ] Login email/phone; wrong password → generic error
- [ ] Logout; protected routes blocked
- [ ] Forgot password → generic message
- [ ] Reset password (when delivery wired)
- [ ] Guest cart merges after login; badge count correct

### Cart
- [ ] Add from PDP; update qty; remove
- [ ] Guest persistence across refresh
- [ ] Stock cap when quantity exceeds inventory

### Wishlist
- [ ] Add/remove (logged in)
- [ ] Move to bag removes from wishlist
- [ ] Redirect when logged out

### Catalog
- [ ] Shop pagination; category browse
- [ ] PDP gallery, zoom, related products
- [ ] Interest form submission

### Admin
- [ ] Admin login → dashboard
- [ ] Create product + S3 upload + publish
- [ ] Customer blocked from `/admin`

### Cross-cutting
- [ ] Mobile 375px layout
- [ ] No console errors on happy path

---

## Backend unit tests (lean ROI)

| Class | Covers |
|-------|--------|
| `AuthServiceTest` | Login (unknown user, bad password), duplicate register, forgot-password delegation |
| `CartServiceTest` | Add/increment stock cap, remove, update qty, inactive product |
| `WishlistServiceTest` | Add, duplicate skip, remove soft-delete, inactive filter |

Run: `mvn test -Dtest=AuthServiceTest,CartServiceTest,WishlistServiceTest`

---

## E2E tests (Playwright)

| ID | Spec | Flow |
|----|------|------|
| E2E-01 | `e2e-01-auth.spec.ts` | Register → login |
| E2E-02 | `e2e-02-browse-cart-wishlist.spec.ts` | Shop → add bag → cart; wishlist (needs creds) |
| E2E-03 | `e2e-03-forgot-password.spec.ts` | Forgot password generic message |

Not gated in CI — run manually before release. Requires `E2E_RUN=1`.

---

## Auth test cases

| ID | Case | Steps | Expected |
|----|------|-------|----------|
| A1 | Valid login | POST login | 200 + tokens |
| A2 | Unknown user | Bad identifier | 401 generic |
| A3 | Wrong password | Valid user | 401 generic |
| A4 | Lockout | 5 failures | 429 locked |
| A5 | Register duplicate | Same email | 409 |
| A6 | Weak password | Register | 400 validation |
| A7 | Refresh | POST /auth/refresh | New token pair |
| A8 | Logout | POST /auth/logout | Refresh revoked |
| A9 | Password reset | Reset flow | Old sessions invalid |
| A10 | Protected route | No Bearer | 401 |

---

## Cart edge cases

| ID | Case | Expected |
|----|------|----------|
| C1 | Add same product twice | Single line, qty summed |
| C2 | Qty > stock | 422 Insufficient stock |
| C3 | Add inactive product | 404 |
| C4 | Merge guest → auth | Items in customer cart |
| C5 | Merge exceeds stock | Capped at stock max |
| C6 | Clear empty cart | Empty CartDto |
| C7 | PATCH invalid itemId | 404 |

---

## Wishlist edge cases

| ID | Case | Expected |
|----|------|----------|
| W1 | Add duplicate | Idempotent list |
| W2 | Remove not in list | Updated list |
| W3 | Move to cart | In cart, out of wishlist |
| W4 | Inactive product | Hidden from GET list |
| W5 | No auth | 401 |

---

## UI test scenarios

| ID | Scenario | Viewport |
|----|----------|----------|
| U1 | Homepage hero + carousel | Desktop + mobile |
| U2 | Floating label forms (auth) | Mobile |
| U3 | Cart drawer open/close | Mobile |
| U4 | PDP sticky add-to-bag bar | Mobile |
| U5 | Wishlist masonry grid | Desktop |
| U6 | Admin product form validation | Desktop |
| U7 | 404 product page | Any |
| U8 | Keyboard: gallery Escape/arrows | Desktop |

---

## Regression suite (release)

1. CI validate workflow green
2. Deploy smoke tests green
3. Manual QA checklist signed off
4. Spot-check Vercel production URL
5. Admin password not default (prod)

---

## Test data

| Environment | Admin | Notes |
|-------------|-------|-------|
| Local | `admin@gamyacouture.com` / `Admin@123` | V8 seed |
| EC2 dev | Same — **rotate in prod** | |
| CI | Testcontainers ephemeral DB | `@ActiveProfiles("test")` |

---

## Known gaps

| Gap | Priority |
|-----|----------|
| No AuthService unit tests | P1 |
| No Playwright E2E | P1 |
| No frontend Vitest tests | P2 |
| GamyaCoutureApplicationTests requires Docker | CI has Docker ✅ |

---

## Related

- [.github/workflows/validate.yml](../.github/workflows/validate.yml)
- [docs/production/GO-LIVE-CHECKLIST.md](./production/GO-LIVE-CHECKLIST.md)
