# Roadmap — Gamya Couture

Prioritized backlog for bootstrap MVP. See [GO_LIVE_CHECKLIST.md](GO_LIVE_CHECKLIST.md) for launch gates.

---

## P0 — Must do before launch

| Item | Area | Notes |
|------|------|-------|
| Strong `JWT_SECRET` in prod (SSM) | Security | Fail if default placeholder |
| Rotate admin seed password | Security | V8 `Admin@123` |
| `MAIL_ENABLED=true` + SMTP creds on EC2 | Auth | Code wired; founder must configure |
| `CORS_ALLOWED_ORIGINS` = production Vercel URL | Deploy | |
| RDS backup ≥ 7 days; snapshot before migrate | DB | Default RDS feature — verify retention |
| Flyway V10–V13 on RDS | DB | Includes cart/wishlist + indexes |
| Manual QA sign-off | QA | [checklist](docs/production/MANUAL-QA-CHECKLIST.md) |
| Vercel env vars | Frontend | API proxy, CDN, site URL |

---

## P1 — Safe after launch

| Item | Area | Notes |
|------|------|-------|
| Frontend token refresh interceptor | Auth/UX | `/auth/refresh` exists |
| Guest cart signed token / merge ownership | Security | Low traffic UUID risk |
| CloudWatch alarms (EC2, RDS) | Ops | ~$0.10/alarm |
| Custom API HTTPS domain | Infra | Vercel proxy OK for MVP |
| N+1 fix: cart/wishlist batch product fetch | Performance | |
| Surface API errors in UI (cart, auth) | UX | |
| Auth hydration on app load | UX | Navbar logged-out until /account |
| Restrict Swagger/actuator in prod | Security | |
| Playwright E2E in CI (nightly) | QA | Specs exist; not CI-gated |
| Phone-only forgot password (SMS) | Auth | Email-only for MVP |

---

## P2 — Nice to have

Checkout/payments, WhatsApp orders, recommendations, custom domain SEO, Redis, Multi-AZ, WAF, ECS — see prior backlog in git history.

---

## Completed (reference)

- ✅ SMTP password reset sender (`PasswordResetEmailSender`)
- ✅ Auth/cart/wishlist unit tests (lean ROI)
- ✅ DB indexes V13
- ✅ Auth failure + exception logging
- ✅ Cart inactive product filtering + merge stock cap
- ✅ CI validate + deploy gates + smoke tests
- ✅ Session revoke on password change
- ✅ Playwright E2E specs (manual)
- ✅ GO_LIVE_CHECKLIST.md

---

## Related

- [GO_LIVE_CHECKLIST.md](GO_LIVE_CHECKLIST.md)
- [CHANGELOG.md](CHANGELOG.md)
- [docs/DECISIONS.md](docs/DECISIONS.md)
