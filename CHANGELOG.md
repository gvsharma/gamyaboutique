# Changelog — Gamya Couture

Major changes tracked for onboarding and release notes. Versions follow approximate delivery order, not semver releases.

---

## [Unreleased]

### MVP launch readiness
- SMTP password reset via `PasswordResetEmailSender` (Gmail/SendGrid; `MAIL_ENABLED` flag)
- Auth failure logging in `AuthService` + `GlobalExceptionHandler`
- Cart DTO filters inactive/deleted products; merge compile fix
- Flyway **V13** — indexes on `cart_items(cart_id)`, `wishlist_items(customer_id)`
- Lean unit tests: `AuthServiceTest`, `CartServiceTest`, `WishlistServiceTest`
- Playwright E2E specs (E2E-01/02/03) — manual run with `E2E_RUN=1`
- Root [GO_LIVE_CHECKLIST.md](../GO_LIVE_CHECKLIST.md) — cost-conscious launch guide

### Documentation
- Comprehensive docs: README, FEATURES, ARCHITECTURE, DATABASE_SCHEMA, API_CONTRACT, AUTH_FLOW, DEPLOYMENT, TESTING, DECISIONS, TODO
- Production QA pack under `docs/production/`

### CI/CD
- Reusable `validate.yml` workflow (backend tests, frontend lint/build, Trivy + npm audit)
- `ci.yml` for PR gates; `deploy.yml` requires validate before EC2 deploy
- Post-deploy `smoke-test-api.sh` in deploy pipeline

### Security fixes
- Session revocation on password reset and profile password change
- Disabled-user refresh token blocked
- Login enumeration reduced (unknown user → generic 401)
- JWT filter no longer 500s on disabled users
- Reset-password rate limiting

### Cart / wishlist fixes
- Stock validation on total quantity when incrementing cart line
- Cart merge skips inactive products and caps stock
- Wishlist UI uses `move-to-cart` endpoint
- Cart/wishlist query invalidation after login/register

### UI
- Form accessibility: `Input`/`Textarea` useId + ARIA
- Admin light reskin; account/cart/marketing consistency
- Flyway dev seed renamed V11 → V13 (collision fix)

---

## Customer auth & sessions (V10, V11)

### Database
- **V10:** Nullable email; phone column; lockout fields; email-or-phone constraints
- **V11:** `user_sessions`, `password_reset_tokens`, `otp_verifications`, `login_attempts`

### Backend
- Register/login with email or phone
- Refresh token rotation and logout
- Forgot password (email token + phone OTP via outbox)
- Reset password with session revocation
- Account lockout (5 failures / 15 min)
- Login and forgot-password rate limiting
- `@ValidPassword` strength rules

### Frontend
- Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`
- `AuthCard`, floating inputs, password validation parity with backend
- `completeAuthSession`: profile fetch + guest cart merge
- Account guard with `returnUrl`

---

## Cart & wishlist (V12)

### Database
- **V12:** `carts`, `cart_items`, `wishlist_items`, `recently_viewed_products`
- Product `stock_quantity`, `low_stock_threshold`

### Backend
- Guest cart via `X-Guest-Cart-Id`
- Authenticated customer cart
- `POST /cart/merge` on login
- Wishlist CRUD + move-to-cart
- Stock validation on cart mutations
- Related products and record-view endpoints

### Frontend
- Cart drawer, cart page, guest storage in localStorage
- Wishlist page with Pinterest masonry grid
- PDP add-to-cart, wishlist toggle, low-stock badge
- Navbar cart/wishlist badges

---

## Premium UI redesign

### Design system
- Playfair Display + Plus Jakarta Sans fonts
- Tailwind tokens: pearl, ivory, maroon, champagne
- Shared components: `Button`, `SectionHeader`, `Skeleton`, floating `Input`
- `globals.css` utilities: container-premium, surface-card, admin-card

### Pages updated
- Homepage: hero, featured categories, trending carousel
- Shop, category, PDP, about, contact
- Auth pages, account, addresses, cart, wishlist
- Admin shell, dashboard, products, categories forms

### Product gallery
- Thumbnail strip, fullscreen zoom, keyboard navigation
- Touch swipe on thumbnails; lazy-loaded images
- Related products carousel on PDP

---

## Core platform (V1–V9, pre-commerce)

### Catalog & products
- Categories tree, fabrics, prints, tags
- Product CRUD (admin), full-text search
- S3 image upload + CloudFront URLs
- Customer interest / CRM lead pipeline

### Infrastructure
- Spring Boot modular monolith
- Flyway migrations V1–V9
- EC2 + RDS + GitHub Actions deploy
- Vercel frontend with API proxy
- Docker Compose local PostgreSQL

### Admin
- Dashboard summary
- Product and category management
- Seeded admin user (V8)

---

## Migration reference

| Version | Summary |
|---------|---------|
| V10 | Auth extensions |
| V11 | Sessions & recovery |
| V12 | Cart, wishlist, stock |

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

---

## Format

Future entries should follow:

```markdown
## [YYYY-MM-DD] Short title
### Added / Changed / Fixed / Security
- Bullet points
```
