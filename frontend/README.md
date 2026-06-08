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

### 2. Environment variables

In **Settings** → **Environment Variables**, add for **Production** (and Preview if you want):

| Name | Example |
|------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.your-domain.com/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | `https://gamyacouture.vercel.app` |

Without a public API URL, pages still build but product data will be empty (the app falls back when the API is unreachable).

### 3. Backend CORS (required when API is live)

On the Spring Boot host, allow your Vercel origin:

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
- [ ] `NEXT_PUBLIC_API_BASE_URL` points to a **public** API (not `localhost`)
- [ ] API `CORS_ALLOWED_ORIGINS` includes your Vercel URL
