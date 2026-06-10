# Deployment Checklist — Gamya Couture

Region: **ap-south-1** | Frontend: **Vercel** | Backend: **EC2 + systemd** | DB: **RDS PostgreSQL (private)**

---

## Pre-deploy (both teams)

| # | Task | Owner | Done |
|---|------|-------|------|
| P1 | All PR checks green (CI validate workflow) | Eng | ☐ |
| P2 | Manual QA checklist completed | QA | ☐ |
| P3 | Go-live checklist reviewed (must-fix items resolved) | Eng/PM | ☐ |
| P4 | RDS snapshot / backup confirmed (< 24h old) | DevOps | ☐ |
| P5 | Change window communicated | PM | ☐ |
| P6 | Rollback owner assigned | DevOps | ☐ |

---

## Backend (Spring Boot → EC2)

### Build verification

| # | Task | Command / check | Done |
|---|------|-----------------|------|
| B1 | Clean compile | `mvn -B verify` | ☐ |
| B2 | JAR artifact exists | `target/gamya-couture-*.jar` (not `*-original`) | ☐ |
| B3 | No SNAPSHOT dependency leaks | Review `pom.xml` | ☐ |
| B4 | Flyway migrations committed | `src/main/resources/db/migration/V*.sql` | ☐ |

### DB migration order

Apply in sequence on RDS (Flyway runs automatically on startup):

| Version | Migration | Breaking? |
|---------|-----------|-----------|
| V1 | extensions_and_audit | — |
| V2 | roles_and_users | — |
| V3 | catalog_taxonomy | — |
| V4 | products | — |
| V5 | customers_and_addresses | — |
| V6 | customer_interest_and_orders | — |
| V7 | notifications_and_crm | — |
| V8 | seed_admin_user | **Rotate admin password after** |
| V9 | interest_lead_management | — |
| V10 | user_auth_extensions | Nullable email, phone, lockout |
| V11 | auth_sessions_and_recovery | Sessions, reset tokens, OTP |
| V12 | cart_wishlist_and_stock | Carts, wishlist, stock columns |

**Dev-only (NOT production):** `migration-dev/V13__dev_synthetic_seed.sql` — only when `SPRING_PROFILES_ACTIVE=dev`.

**Pre-migrate validation:**

```sql
-- On RDS (via bastion/SSM)
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;
-- After deploy
SELECT COUNT(*) FROM flyway_schema_history WHERE success = false;
```

### Environment variables (EC2 `/opt/gamya-couture/config/application.env`)

| Variable | Required | Notes |
|----------|----------|-------|
| `SPRING_PROFILES_ACTIVE` | ✅ | Use `prod` when available; currently `dev` |
| `SERVER_PORT` | ✅ | `8080` |
| `DB_URL` | ✅ | JDBC URL to private RDS |
| `DB_USER` | ✅ | |
| `DB_PASSWORD` | ✅ | From SSM; never in git |
| `JWT_SECRET` | ✅ | ≥256 bits; unique per env |
| `JWT_ACCESS_EXPIRATION_MS` | ☐ | Default 30m |
| `JWT_REFRESH_EXPIRATION_MS` | ☐ | Default 7d |
| `JWT_REMEMBER_ME_EXPIRATION_MS` | ☐ | Default 30d |
| `CORS_ALLOWED_ORIGINS` | ✅ | Vercel production URL |
| `APP_STORAGE_S3_ENABLED` | ✅ | `true` |
| `APP_STORAGE_S3_BUCKET` | ✅ | |
| `APP_STORAGE_S3_REGION` | ✅ | `ap-south-1` |
| `APP_STORAGE_S3_PUBLIC_BASE_URL` | ✅ | CloudFront URL |
| `APP_STORAGE_S3_KEY_PREFIX` | ✅ | `products/` |

**File permissions:** `640`, owner `root:gamya`

### Secrets (AWS SSM)

| Parameter | Purpose |
|-----------|---------|
| `/gamya-couture/dev/db/password` | RDS password (synced in deploy workflow) |
| `/gamya-couture/prod/jwt/secret` | **Recommended** separate prod secret |
| `/gamya-couture/prod/db/password` | **Recommended** for production |

☐ Secrets rotated if ever committed to repo examples  
☐ IAM instance role: S3 PutObject, SSM GetParameter, S3 deploy bucket read

### Deploy execution

| # | Step | Done |
|---|------|------|
| D1 | Merge to `main` triggers `deploy.yml` | ☐ |
| D2 | Validate job passes (tests, lint, security) | ☐ |
| D3 | JAR uploaded to S3 deploy bucket | ☐ |
| D4 | SSM runs `remote-deploy.sh` on EC2 | ☐ |
| D5 | systemd restart `gamya-couture-backend` | ☐ |

### Health check

```bash
curl -s http://<EC2_HOST>/actuator/health | jq .
# Expected: {"status":"UP",...}

curl -s http://<EC2_HOST>/health   # nginx
./scripts/smoke-test-api.sh http://<EC2_HOST>
```

| # | Check | Done |
|---|-------|------|
| H1 | Actuator UP locally on EC2 (`127.0.0.1:8080`) | ☐ |
| H2 | Public health via nginx | ☐ |
| H3 | Smoke tests pass in GitHub Actions | ☐ |

### Rollback strategy

`remote-deploy.sh` auto-rollback if health fails after deploy.

**Manual rollback:**

```bash
# On EC2 (SSM session)
sudo APP_PATH=/opt/gamya-couture bash /opt/gamya-couture/scripts/remote-deploy.sh
# Or restore backup JAR:
ls -lt /opt/gamya-couture/backup/
sudo cp /opt/gamya-couture/backup/gamya-couture.jar.<timestamp> /opt/gamya-couture/app/gamya-couture.jar
sudo systemctl restart gamya-couture-backend
curl -sf http://127.0.0.1:8080/actuator/health
```

| # | Task | Done |
|---|------|------|
| R1 | Identify last good backup JAR | ☐ |
| R2 | Restore + restart | ☐ |
| R3 | Verify health + smoke | ☐ |
| R4 | **Do not** downgrade Flyway without DBA review | ☐ |

---

## Frontend (Next.js → Vercel)

### Environment config (Vercel Production)

| Variable | Value | Done |
|----------|-------|------|
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` | ☐ |
| `API_PROXY_TARGET` | `http://<EC2_PUBLIC_IP>` | ☐ |
| `NEXT_PUBLIC_SITE_URL` | `https://gamyaboutique.vercel.app` (or custom domain) | ☐ |
| `NEXT_PUBLIC_IMAGE_CDN_HOST` | CloudFront hostname | ☐ |

**Root directory:** `frontend`

### Vercel production verification

| # | Check | Done |
|---|-------|------|
| V1 | Production deployment triggered from `main` | ☐ |
| V2 | Build logs: no env errors | ☐ |
| V3 | Homepage 200 | ☐ |
| V4 | `/shop` loads products | ☐ |
| V5 | Network: `/api/v1/products` → 200 (proxied) | ☐ |
| V6 | Login/register pages load | ☐ |
| V7 | Admin routes blocked for anonymous | ☐ |

### SEO checks

| # | Check | Done |
|---|-------|------|
| S1 | `<title>` per page (shop, product, about) | ☐ |
| S2 | Meta description on homepage (`layout.tsx`) | ☐ |
| S3 | Product pages have dynamic metadata | ☐ |
| S4 | `robots.txt` / sitemap (if configured) | ☐ |
| S5 | Canonical URL via `NEXT_PUBLIC_SITE_URL` | ☐ |
| S6 | Open Graph tags (optional enhancement) | ☐ |

### Image optimization

| # | Check | Done |
|---|-------|------|
| I1 | `next/image` used for product photos | ☐ |
| I2 | CDN host in `next.config.ts` remotePatterns | ☐ |
| I3 | No mixed content (HTTPS images only on Vercel) | ☐ |
| I4 | LCP image has `priority` on hero | ☐ |

### Lighthouse validation (manual)

Run Chrome DevTools → Lighthouse on:

- Homepage
- Product detail page
- Shop page

| Metric | Target | Actual |
|--------|--------|--------|
| Performance | ≥ 80 | |
| Accessibility | ≥ 90 | |
| Best Practices | ≥ 90 | |
| SEO | ≥ 90 | |

---

## Database (RDS PostgreSQL)

### Migration validation

| # | Task | Done |
|---|------|------|
| M1 | `flyway_schema_history` shows all versions success | ☐ |
| M2 | No pending migrations after app start | ☐ |
| M3 | V10 phone backfill completed without unique violation | ☐ |
| M4 | Application starts with `ddl-auto: validate` | ☐ |

### Rollback scripts

Flyway does **not** auto-generate down migrations. For emergency:

1. Restore RDS snapshot (preferred)
2. Forward-fix with new migration (V13+) — never delete applied migrations

| # | Prepared | Done |
|---|----------|------|
| DR1 | RDS snapshot ID documented | ☐ |
| DR2 | Point-in-time recovery enabled | ☐ |
| DR3 | Restore procedure tested in non-prod | ☐ |

### Indexes to verify (post V12)

```sql
-- Sessions & auth
\d user_sessions
\d login_attempts

-- Commerce
\d carts
\d cart_items
\d wishlist_items

-- Recommended additions (future migration)
-- CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
-- CREATE INDEX idx_wishlist_items_customer_id ON wishlist_items(customer_id);
-- CREATE INDEX idx_products_category_id ON products(category_id);
```

### Constraints

| Constraint | Table | Purpose |
|------------|-------|---------|
| `uq_users_email_active` | users | Unique email (soft-delete aware) |
| `uq_users_phone_active` | users | Unique phone |
| `chk_users_email_or_phone` | users | At least one identifier |
| `uq_carts_guest_active` | carts | One active guest cart per token |
| `uq_wishlist_customer_product` | wishlist_items | No duplicate wishlist entries |

---

## Post-deploy sign-off

| # | Task | Done |
|---|------|------|
| ✓ | Backend health + smoke green | ☐ |
| ✓ | Vercel production verified | ☐ |
| ✓ | Manual QA spot-check (login, cart, PDP) | ☐ |
| ✓ | Monitoring dashboards checked (see MONITORING-CHECKLIST.md) | ☐ |
| ✓ | Admin password rotated (if first V8 deploy) | ☐ |

**Deployed by:** _______________ **Date/Time (IST):** _______________
