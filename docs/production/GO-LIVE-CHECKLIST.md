# Go-Live Checklist — Gamya Couture

Classification of open items from production readiness audit.  
**Target:** Controlled launch (beta) → full production.

---

## Must fix before launch 🔴

Block release until complete.

| # | Item | Area | Status | Owner |
|---|------|------|--------|-------|
| M1 | **JWT_SECRET** set to strong unique value (not dev default) | Security | ☐ | DevOps |
| M2 | **Rotate admin password** (`V8` seed `Admin@123`) | Security | ☐ | DevOps |
| M3 | **Scrub secrets** from committed env examples; rotate if exposed | Security | ☐ | Eng |
| M4 | **CORS** includes production Vercel URL | Backend | ☐ | DevOps |
| M5 | **RDS backup** retention ≥ 7 days; snapshot before first prod migrate | DB | ☐ | DevOps |
| M6 | **Flyway V10–V12** applied successfully on RDS | DB | ☐ | Eng |
| M7 | **CI gates** pass on main (validate workflow) | CI/CD | ✅ Implemented |
| M8 | **Deploy smoke tests** pass post-deploy | CI/CD | ✅ Implemented |
| M9 | **EC2 → RDS** security group rule verified | Infra | ☐ | DevOps |
| M10 | **S3 upload** IAM permission on EC2 instance role | Infra | ☐ | DevOps |
| M11 | **Vercel env vars** set (API proxy, CDN host, site URL) | Frontend | ☐ | Eng |
| M12 | **Manual QA checklist** signed off | QA | ☐ | QA |
| M13 | **Password reset delivery** — email/SMS processor OR disable forgot-password UI until wired | Auth | ☐ | Eng |
| M14 | **HTTPS for API** (custom domain + ACM) OR accept Vercel proxy-only path with documented risk | Infra | ☐ | DevOps |

---

## Safe after launch 🟡

Can ship beta with monitoring; fix within 2–4 weeks.

| # | Item | Area | Risk if deferred | Priority |
|---|------|------|------------------|----------|
| A1 | Frontend **token refresh** interceptor | Auth/UX | Users logged out at 30 min | Week 1 |
| A2 | **Auth hydration** on app load (navbar state) | UX | Shows logged-out until /account | Week 1 |
| A3 | **Guest cart security** (signed token / merge ownership) | Security | UUID leak → cart hijack | Week 2 |
| A4 | **Cart/wishlist N+1** batch queries | Performance | Slow cart at scale | Week 2 |
| A5 | **Surface API errors** on add-to-cart / auth forms | UX | Silent failures | Week 1 |
| A6 | **`application-prod.yml`** profile (no dev Flyway seeds) | Deploy | Dev config in prod | Week 2 |
| A7 | **Restrict Swagger/actuator** to internal IPs | Security | API surface disclosure | Week 2 |
| A8 | Missing DB **indexes** (cart_items, wishlist_items) | Performance | Slow queries at volume | Week 3 |
| A9 | **GlobalExceptionHandler** for constraint violations → 409 | API | 500 on race conditions | Week 2 |
| A10 | **CloudWatch** alarms (EC2, RDS, 5xx) | Monitoring | Blind to outages | Week 1 |
| A11 | **Playwright E2E** in CI (nightly) | QA | Manual-only regression | Week 3 |
| A12 | **Auth integration tests** | QA | Auth regressions undetected | Week 2 |
| A13 | Login **account lock** still reveals existence (429) | Security | Targeted attacks | Week 3 |
| A14 | **Concurrent refresh** race on sessions | Auth | Duplicate sessions | Week 4 |

---

## Nice to have 🟢

Improve quality; no launch blocker.

| # | Item | Area |
|---|------|------|
| N1 | Email/phone **verification** on register |
| N2 | Refresh-token **reuse detection** |
| N3 | Web Share API on PDP |
| N4 | Debounced cart quantity input |
| N5 | Gallery focus trap + scroll lock |
| N6 | Skip-to-main link |
| N7 | `robots.txt` + sitemap.xml |
| N8 | Open Graph / Twitter cards |
| N9 | CloudFront + WAF in front of API |
| N10 | Scheduled purge of expired sessions/tokens |
| N11 | Vitest component tests |
| N12 | Lighthouse CI in GitHub Actions |
| N13 | Separate smoke test customer account in prod |
| N14 | Custom domain (`gamyacouture.com`) |
| N15 | Checkout / payment flow |

---

## Launch decision matrix

| Condition | Decision |
|-----------|----------|
| All **Must fix** (M1–M14) complete except M13 documented workaround | ✅ **Go** (beta) |
| M13 unresolved AND forgot-password promoted in UI | ❌ **No-Go** |
| Any Critical security item (M1, M3, M9) open | ❌ **No-Go** |
| Manual QA No-Go | ❌ **No-Go** |

---

## Beta vs full production

| Capability | Beta launch | Full production |
|------------|-------------|-----------------|
| Browse catalog | ✅ | ✅ |
| Register/login | ✅ | ✅ |
| Guest + auth cart | ✅ | ✅ |
| Wishlist | ✅ | ✅ |
| Forgot password | ⚠️ If delivery wired | ✅ |
| Checkout/payment | ❌ | ✅ |
| Custom domain + HTTPS API | Optional | ✅ |
| 24/7 on-call | ❌ | ✅ |
| E2E automated regression | ❌ | ✅ |

---

## Sign-off

| Gate | Approver | Date | Status |
|------|----------|------|--------|
| Engineering | | | ☐ |
| QA | | | ☐ |
| DevOps / Infra | | | ☐ |
| Product / Business | | | ☐ |

**Launch type:** ☐ Closed beta ☐ Open beta ☐ Full production  
**Go-live date (IST):** _______________

---

## Post-launch (first 72 hours)

| Hour | Action |
|------|--------|
| 0 | Verify deploy + smoke + manual spot-check |
| 1 | Monitor nginx 5xx, RDS connections |
| 4 | Review `login_attempts` for anomalies |
| 24 | Full manual QA regression on production |
| 48 | Review CloudWatch / logs; triage Safe-after-launch items |
| 72 | Go/no-go for marketing traffic increase |
