# Gamya Couture — Frontend

Next.js 15 storefront for Gamya Couture boutique.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — stack, data flow, conventions
- [FOLDER-STRUCTURE.md](./FOLDER-STRUCTURE.md) — full directory tree

## Quick start

**Terminal 1 — API (port 8080):**
```bash
cd ..   # repo root
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 2 — Storefront (port 3000):**
```bash
cd frontend
npm install
cp .env.example .env.local   # if .env.local missing
npm run dev
```

Open http://localhost:3000

## Backend

API base: `http://localhost:8080/api/v1` (see repo root README).

## Deploy to Vercel

The Next.js app lives in **`frontend/`**. The repo root has no `package.json`, so Vercel must use this folder as the project root (a wrong root causes **404** on `gamyacouture.vercel.app`).

### 1. Import or fix the project

1. Open [vercel.com](https://vercel.com) → your **gamyacouture** project → **Settings** → **General**.
2. Set **Root Directory** to `frontend` (confirm when prompted).
3. **Framework Preset:** Next.js (auto-detected).
4. **Build Command:** `npm run build` (default).
5. **Install Command:** `npm ci` or `npm install`.

Redeploy: **Deployments** → latest deployment → **⋯** → **Redeploy**.

### 2. Environment variables (paired with backend)

In **Settings** → **Environment Variables**, add for **Production**:

| Name | Dev EC2 value | Backend counterpart |
|------|---------------|---------------------|
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` | Spring serves `/api/v1/*` |
| `API_PROXY_TARGET` | `http://13.232.200.243` | EC2 Elastic IP (nginx → :8080) |
| `NEXT_PUBLIC_SITE_URL` | `https://gamyacouture.vercel.app` | EC2 `CORS_ALLOWED_ORIGINS` must include this |

**Why the proxy?** Vercel is HTTPS; the dev EC2 API is HTTP only. Browser calls go to `/api/v1` on your Vercel domain; Next.js rewrites proxy to EC2. Server components call EC2 directly via `API_PROXY_TARGET`.

**Local dev against EC2** — copy to `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=/api/v1
API_PROXY_TARGET=http://13.232.200.243
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Without a reachable API, pages still build but product data will be empty (RSC pages catch API errors).

### 3. Backend CORS (required when API is live)

On EC2 `.env`, allow your storefront origins (must match `NEXT_PUBLIC_SITE_URL`):

```bash
CORS_ALLOWED_ORIGINS=https://gamyacouture.vercel.app,http://localhost:3000
```

### 4. Deploy from Git

Push to the branch connected to Vercel (usually `main`). Each push triggers a new deployment.

### 5. CLI (optional)

```bash
cd frontend
npx vercel login
npx vercel link    # link to existing gamyacouture project
npx vercel --prod
```

### Checklist

- [ ] Root Directory = `frontend`
- [ ] Latest deployment status = **Ready** (not Failed)
- [ ] `NEXT_PUBLIC_API_BASE_URL=/api/v1` and `API_PROXY_TARGET=http://13.232.200.243`
- [ ] EC2 `./scripts/verify-api-integration.sh` passes
- [ ] EC2 `CORS_ALLOWED_ORIGINS` includes your Vercel URL
