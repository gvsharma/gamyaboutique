# AWS Dev Setup — Vercel → EC2 → RDS

End-to-end guide to run the Gamya Couture storefront on Vercel with the Spring Boot API on EC2 and PostgreSQL on RDS.

## Architecture

```
Browser (HTTPS)
  → Vercel Next.js
      → /api/v1/* rewrite → http://13.232.200.243/api/v1/*
      → SSR serverFetch → http://13.232.200.243/api/v1/* (direct)

EC2 (Spring Boot :8080, nginx :80)
  → Flyway migrations on startup
  → JDBC → RDS PostgreSQL (gamya database)

Product images
  → S3 public URLs stored in product_images.url (optional upload API)
```

## Your Terraform outputs (dev)

| Resource | Value |
|----------|-------|
| API (EC2) | `http://13.232.200.243` |
| RDS host | `gamya-couture-dev-pg.c8xkhvlstsfp.ap-south-1.rds.amazonaws.com` |
| Database | `gamya` |
| DB user (SSM) | `/gamya-couture/dev/db/username` → `gamya_admin` |
| DB password | `gamyaadmin` (dev; also in SSM `/gamya-couture/dev/db/password`) |
| Region | `ap-south-1` |
| Cost scheduler | Mon–Fri 06:00–11:00; Sat 18:00–00:00; Sun 06:00–00:00 IST |

---

## Step 1 — Database schema & sample data (Flyway)

**No manual SQL required.** The Spring Boot app runs [Flyway](https://flywaydb.org/) migrations from `src/main/resources/db/migration/` on every startup.

| Migration | Purpose |
|-----------|---------|
| V1 | Extensions, audit triggers |
| V2 | Roles + users tables, seed roles |
| V3 | Catalog taxonomy (categories, fabrics, prints, tags, offers) |
| V4 | Products, product_images, search index |
| V5 | Customers, addresses |
| V6 | Customer interest, manual orders |
| V7 | Notifications, CRM leads |
| V8 | Admin user seed |
| V9 | Interest lead workflow |
| V11 | ~10 rows per table synthetic boutique data |

### Default credentials after first deploy

| Account | Email | Password |
|---------|-------|----------|
| Admin | `admin@gamyacouture.com` | `Admin@123` |
| Staff (seed) | `staff1@gamyacouture.com` | `Admin@123` |
| Customer (seed) | `customer1@example.com` | `Admin@123` |

> Change admin password after first login in production.

### Verify migrations on EC2

```bash
# After backend starts
curl -s http://127.0.0.1:8080/actuator/health
curl -s "http://127.0.0.1:8080/api/v1/products?page=0&size=3" | head -c 500
```

You should see products with Unsplash image URLs from the V11 seed.

---

## Step 2 — Configure EC2 backend (RDS)

### Option A — systemd (recommended, GitHub Actions deploy)

```bash
# One-time bootstrap (Session Manager on EC2)
sudo dnf install -y git
git clone https://github.com/gvsharma/gamya-boutique.git
cd gamya-boutique
sudo bash deploy/scripts/ec2-bootstrap.sh

# Pull RDS credentials from SSM into application.env
sudo bash deploy/scripts/sync-rds-env-from-ssm.sh

# Set JWT + CORS manually
sudo nano /opt/gamya-couture/config/application.env
```

Copy the ready-made dev config (password `gamyaadmin`, S3 enabled):

```bash
sudo cp deploy/env/application.env.example /opt/gamya-couture/config/application.env
sudo chmod 640 /opt/gamya-couture/config/application.env
sudo chown root:gamya /opt/gamya-couture/config/application.env
```

Or use SSM for credentials and override password:

```bash
sudo DB_PASSWORD=gamyaadmin bash deploy/scripts/sync-rds-env-from-ssm.sh
```

Defaults in `application-dev.yml` match the example env file — backend starts with dev profile even if only `SPRING_PROFILES_ACTIVE=dev` is set.

Deploy JAR (first time or via CI):

```bash
# Build on EC2 or copy from CI artifact
mvn -q -DskipTests package
sudo cp target/gamya-couture-*.jar /opt/gamya-couture/app/gamya-couture.jar
sudo chown gamya:gamya /opt/gamya-couture/app/gamya-couture.jar
sudo systemctl start gamya-couture-backend
sudo systemctl status gamya-couture-backend
```

### Option B — Docker on EC2 (RDS, no local Postgres)

```bash
cp .env.prod.example .env
# Edit .env with DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET
./scripts/deploy-ec2-rds.sh
```

---

## Step 3 — Configure Vercel frontend

In **Vercel → Project → Settings → Environment Variables** (Production):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` |
| `API_PROXY_TARGET` | `http://13.232.200.243` |
| `NEXT_PUBLIC_SITE_URL` | `https://gamyaboutique.vercel.app` |
| `NEXT_PUBLIC_IMAGE_CDN_HOST` | `gamya-couture-dev-media.s3.ap-south-1.amazonaws.com` |

Redeploy after saving. The Next.js rewrite proxies browser calls to EC2 over HTTP (server-side), avoiding mixed-content errors.

Validate pairing locally:

```bash
./scripts/check-env-pairing.sh .env frontend/.env.local
```

---

## Step 4 — Smoke test full stack

```bash
# From your laptop
./scripts/verify-api-integration.sh http://13.232.200.243
```

On the Vercel site:

1. Home page loads categories and featured products
2. `/products/{id}` shows product detail + images
3. Interest form submits successfully
4. `/login` with `admin@gamyacouture.com` / `Admin@123` → redirects to `/admin`
5. Admin UI: create products, upload S3 images, manage categories

---

## Step 5 — S3 product images (`gamya-couture-dev-media`)

S3 is **enabled by default** in the dev profile and `application.env.example`.

### 5a. Bucket policy (public read for product images)

```bash
aws s3api put-bucket-policy \
  --bucket gamya-couture-dev-media \
  --policy file://deploy/s3/bucket-policy.example.json \
  --region ap-south-1
```

### 5b. EC2 instance IAM (upload permission)

Attach `deploy/s3/ec2-instance-policy.example.json` to the EC2 instance role (Terraform or console).

Restart after IAM change: `sudo systemctl restart gamya-couture-backend`

### 5c. Upload via API

```bash
TOKEN=$(curl -s -X POST http://13.232.200.243/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@gamyacouture.com","password":"Admin@123"}' \
  | jq -r '.data.accessToken')

curl -X POST http://13.232.200.243/api/v1/admin/media/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./my-saree.jpg" \
  -F "folder=products"
```

Response includes `data.url` — store that URL in `product_images.url` (admin product UI coming later; for now use SQL or keep seed Unsplash URLs).

### 5d. Frontend

`next.config.ts` already allows `**.amazonaws.com`. Set `NEXT_PUBLIC_IMAGE_CDN_HOST` if you use a custom CloudFront domain.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `502` from EC2 | Spring Boot not running — `sudo systemctl status gamya-couture-backend` |
| Flyway connection refused | EC2 SG must allow outbound to RDS; RDS SG must allow EC2 SG on 5432 |
| CORS error on login | Add Vercel URL to `CORS_ALLOWED_ORIGINS` on EC2 |
| Empty products on Vercel | Check `API_PROXY_TARGET`; redeploy Vercel after env change |
| RDS stopped (outside scheduler window) | Wait for next scheduled start or start RDS manually in console |
| `next/image` broken for S3 | Add bucket hostname to `NEXT_PUBLIC_IMAGE_CDN_HOST` |

### Logs

```bash
sudo journalctl -u gamya-couture-backend -f
tail -f /opt/gamya-couture/logs/application.log
```

---

## Local development (unchanged)

```bash
docker compose up -d          # local Postgres gamya_couture
mvn spring-boot:run -Dspring-boot.run.profiles=local
cd frontend && npm run dev
```

Local DB uses database `gamya_couture`; AWS dev uses `gamya` — same Flyway scripts apply to both.
