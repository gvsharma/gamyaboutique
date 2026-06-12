# Go-Live Checklist — MVP Launch (Cost-Conscious)

One-page checklist for bootstrap launch. Full detail: [docs/production/GO-LIVE-CHECKLIST.md](docs/production/GO-LIVE-CHECKLIST.md).

**Target:** 0–1,000 users · single EC2 · RDS micro · Vercel free tier.

---

## Must fix before launch (P0)

| # | Item | Cost | Owner |
|---|------|------|-------|
| 1 | **JWT_SECRET** — strong random value in SSM/EC2 env (not dev default) | $0 | DevOps |
| 2 | **Rotate admin password** — change seed `Admin@123` from V8 | $0 | DevOps |
| 3 | **CORS** — `CORS_ALLOWED_ORIGINS` = production Vercel URL only | $0 | DevOps |
| 4 | **Password reset email** — `MAIL_ENABLED=true` + Gmail app password or SendGrid free | $0/mo | Eng |
| 5 | **RDS backup** — automated backup retention ≥ 7 days (default on RDS) | ~$0–2/mo storage | DevOps |
| 6 | **Flyway V10–V13** applied on RDS (auth, cart, wishlist, indexes) | $0 | Eng |
| 7 | **Vercel env vars** — API proxy, CDN host, site URL | $0 | Eng |
| 8 | **Manual QA sign-off** — [checklist](docs/production/MANUAL-QA-CHECKLIST.md) | $0 | QA |
| 9 | **CI green on main** — `validate.yml` + deploy smoke tests | $0 (GH free) | Eng |

---

## Safe after launch (P1)

| Item | Why wait | Cost if added now |
|------|----------|-------------------|
| Token refresh interceptor | Users re-login after ~30 min | $0 |
| Guest cart signed tokens | Low traffic UUID guessing risk | $0 |
| CloudWatch alarms | Free tier metrics exist; alarms optional | ~$0.10/alarm |
| Custom API HTTPS domain | Vercel proxy works for MVP | ~$0–12/mo (Route53 + cert) |
| N+1 cart/wishlist batch fetch | Fine for hundreds of users | $0 |
| Restrict Swagger/actuator | Low scan risk at low traffic | $0 |
| Playwright E2E in CI | Manual QA + smoke tests sufficient | CI minutes |

---

## Launch day (30 min)

1. Snapshot RDS (console or CLI) — **$0** if within free backup window
2. Merge to `main` → GitHub Actions deploy
3. Verify: `curl http://<EC2>/actuator/health` → `"UP"`
4. Run storefront smoke: register → browse → add cart → wishlist
5. Test forgot-password email end-to-end
6. Monitor EC2 logs: `journalctl -u gamya-couture-backend -f`

---

## Rollback (simple)

Deploy script auto-rolls back if health check fails. Manual:

```bash
sudo cp /opt/gamya-couture/backup/gamya-couture.jar.prev /opt/gamya-couture/app/gamya-couture.jar
sudo systemctl restart gamya-couture-backend
curl -sf http://127.0.0.1:8080/actuator/health
```

RDS: restore from automated backup or pre-launch snapshot (expect minutes of downtime).

---

## Estimated monthly AWS bill (MVP)

| Service | Tier | ~Cost (ap-south-1) |
|---------|------|---------------------|
| EC2 t3.small (or t3.micro) | 1 instance | $8–15 |
| RDS db.t4g.micro PostgreSQL | Single-AZ, 20GB | $12–18 |
| S3 + CloudFront | Low traffic images | $1–5 |
| GitHub Actions | Free tier | $0 |
| Vercel | Hobby | $0 |
| SMTP (Gmail/SendGrid) | Free tier | $0 |
| **Total** | | **~$22–40/mo** |

No Redis, Multi-AZ, WAF, or ECS unless traffic justifies it.

---

## Launch decision

| All P0 checked | Recommendation |
|----------------|----------------|
| Yes | **Launch** — suitable for beta / soft launch |
| Missing mail + forgot-password exposed | **Wait** — users cannot recover accounts |
| Missing JWT/CORS/admin rotation | **Do not launch** — security risk |
