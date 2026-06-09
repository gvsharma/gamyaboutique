# Pre-Deploy Review — Fixes Applied

## Code fixes (this repo)

### Database / Flyway
- **V11 dev seed** moved to `db/migration-dev/` — runs only with `dev` profile (`application-dev.yml` Flyway locations).
- Production profile should use `classpath:db/migration` only (no synthetic data).
- **V8 admin seed** remains in core migrations — change admin password after first deploy.

### Backend
- **JPA auditing** uses logged-in user email (`SecurityAuditorAware`).
- **Category slug** uniqueness per parent (matches DB index).
- **Category cycles** blocked when reparenting.
- **Category subtree** paths/depth refreshed on update; deactivate cascades to descendants.
- **Product images** validated (HTTPS + S3/Unsplash hosts only).
- **Taxonomy assignment** requires active fabric/print/category.
- **ProductDetailDto** includes `primaryCategoryId`.
- **ProductSummaryDto** includes `status` for admin list.
- **Cache eviction** clears product cache when categories change.

### Frontend
- **S3 upload** multipart boundary fix (no manual Content-Type).
- **401 interceptor** clears token and redirects to login.
- **AdminGuard** always re-fetches profile from API.
- **Login page** hides dev credentials in production.
- **Vercel build** fails if `NEXT_PUBLIC_API_BASE_URL` unset.
- **Archive** uses `PATCH status=ARCHIVED` (not DELETE).
- **Product edit** binds `primaryCategoryId` correctly.

---

## Infra changes (gamya-couture-infra repo)

### EC2
- [ ] Instance IAM role: S3 `PutObject`/`GetObject` on `gamya-couture-dev-media/products/*`
- [ ] Security group: EC2 → RDS port 5432
- [ ] Security group: inbound 80 from `0.0.0.0/0`, 22 restricted or use SSM only
- [ ] `application.env` on EC2 with `DB_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS=https://gamyaboutique.vercel.app`

### RDS
- [ ] PostgreSQL 16, database `gamya`
- [ ] Credentials in SSM: `/gamya-couture/dev/db/username`, `/gamya-couture/dev/db/password`
- [ ] Backup retention ≥ 7 days before production

### S3
- [ ] Bucket `gamya-couture-dev-media` with policy: public `GetObject` on `products/*`
- [ ] Block public access settings adjusted for prefix policy (or use CloudFront OAC for prod)

### Vercel
- [ ] Root directory: `frontend`
- [ ] Env: `NEXT_PUBLIC_API_BASE_URL=/api/v1`
- [ ] Env: `API_PROXY_TARGET=http://13.232.200.243`
- [ ] Env: `NEXT_PUBLIC_SITE_URL=https://gamyaboutique.vercel.app`
- [ ] Env: `NEXT_PUBLIC_IMAGE_CDN_HOST=gamya-couture-dev-media.s3.ap-south-1.amazonaws.com`

### DNS / HTTPS (recommended before real launch)
- [ ] API subdomain with ACM cert (e.g. `api.gamyacouture.com` → EC2) — removes Vercel proxy hop
- [ ] Or ALB + HTTPS in front of EC2

### Cost scheduler
- [ ] Confirm 09:00–00:00 IST window is acceptable for storefront uptime

### Production hardening (later)
- [ ] Separate `prod` Spring profile without dev Flyway seeds
- [ ] Rotate JWT secret and admin password
- [ ] Restrict Swagger/actuator to internal IPs
- [ ] CloudFront for S3 images + WAF on API
