# Gamya Couture — Frontend

Next.js 15 App Router storefront and admin UI for Gamya Couture boutique.

**Live:** [gamyaboutique.vercel.app](https://gamyaboutique.vercel.app) (production)  
**API:** Spring Boot on EC2, proxied via `/api/v1` rewrite

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | CI uses Node 22 (see `validate.yml`) |
| npm | 10+ | Lockfile: `package-lock.json` — use `npm ci` |

No pnpm or yarn — npm only.

---

## Quick start (local)

**Terminal 1 — Backend** (repo root):

```bash
docker compose up -d
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 2 — Frontend:**

```bash
cd frontend
cp .env.local.example .env.local
npm ci
npm run dev
```

Open http://localhost:3000

---

## Environment variables

Copy [`.env.local.example`](./.env.local.example) to `.env.local`:

```bash
cp .env.local.example .env.local
```

### Local development (backend on localhost)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |

Leave `API_PROXY_TARGET` unset — the app calls the backend directly.

### Local frontend → dev EC2 API

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` |
| `API_PROXY_TARGET` | `http://<EC2_PUBLIC_IP>` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_IMAGE_CDN_HOST` | `d2568bpd35bq6a.cloudfront.net` |

### Vercel production

Set in **Vercel → Project → Settings → Environment Variables**:

| Variable | Value | Why |
|----------|-------|-----|
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` | Same-origin API calls (HTTPS) |
| `API_PROXY_TARGET` | `http://<EC2_PUBLIC_IP>` | Server-side rewrite to HTTP backend |
| `NEXT_PUBLIC_SITE_URL` | `https://gamyaboutique.vercel.app` | Canonical URL, metadata |
| `NEXT_PUBLIC_IMAGE_CDN_HOST` | CloudFront hostname | `next/image` remote patterns |

**Why the proxy?** Vercel serves HTTPS; dev EC2 is HTTP-only. Browser requests go to `/api/v1` on your Vercel domain; Next.js rewrites proxy to EC2 server-side (no mixed content).

Config: [`next.config.ts`](./next.config.ts) — rewrites, image domains, Vercel-safe defaults.

Validate pairing with backend:

```bash
./scripts/check-env-pairing.sh .env.prod.example frontend/.env.local
```

Legacy reference: [`.env.example`](./.env.example) (Vercel-oriented template).

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (Next.js config) |
| `npx tsc --noEmit` | Typecheck (also run in CI) |
| `npm run test:e2e` | Playwright E2E (`E2E_RUN=1` to enable) |

---

## Project structure

```
frontend/
├── src/app/              # App Router pages (route groups)
│   ├── (marketing)/      # Home, about, contact, policies
│   ├── (shop)/           # Shop, products, categories
│   ├── (account)/        # Login, register, profile
│   └── (admin)/          # Admin dashboard, products, categories
├── src/components/       # UI components by domain
├── src/lib/api/          # Axios client, endpoints, services
├── src/stores/           # Zustand (auth, wishlist)
├── e2e/                  # Playwright tests
└── next.config.ts        # Rewrites, image config
```

Deep dives: [ARCHITECTURE.md](./ARCHITECTURE.md) · [FOLDER-STRUCTURE.md](./FOLDER-STRUCTURE.md)

---

## API configuration

- Client-side requests use `NEXT_PUBLIC_API_BASE_URL`
- Server Components use the same base; on Vercel with proxy, requests hit `/api/v1` which rewrites to EC2
- Auth tokens stored in Zustand + localStorage; sent as `Authorization: Bearer`

Backend must allow your origin in `CORS_ALLOWED_ORIGINS` when calling EC2 directly (not needed for Vercel proxy path from browser).

---

## Deploy to Vercel

### 1. Project settings

The Next.js app lives in **`frontend/`**. The repo root has no `package.json`.

1. Vercel → **gamyacouture** project → **Settings → General**
2. **Root Directory:** `frontend`
3. **Framework:** Next.js (auto-detected)
4. **Build Command:** `npm run build`
5. **Install Command:** `npm ci`

### 2. Environment variables

Add production env vars (see table above). Redeploy after changes.

### 3. Deploy trigger

Push to `main` — Vercel auto-deploys when connected to GitHub.

### 4. CLI (optional)

```bash
cd frontend
npx vercel login
npx vercel link
npx vercel --prod
```

### Checklist

- [ ] Root Directory = `frontend`
- [ ] Latest deployment = **Ready**
- [ ] `NEXT_PUBLIC_API_BASE_URL=/api/v1`
- [ ] `API_PROXY_TARGET` = current EC2 Elastic IP
- [ ] EC2 `CORS_ALLOWED_ORIGINS` includes Vercel URL
- [ ] `./scripts/verify-api-integration.sh http://<EC2>` passes

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 404 on Vercel | Root directory must be `frontend` |
| Empty product pages | Backend down or wrong `API_PROXY_TARGET` |
| Mixed content error | Use `/api/v1` + proxy, not `http://` in `NEXT_PUBLIC_API_BASE_URL` on Vercel |
| CORS on login | Add origin to EC2 `CORS_ALLOWED_ORIGINS` |
| Images broken | Set `NEXT_PUBLIC_IMAGE_CDN_HOST`; check `next.config.ts` remotePatterns |
| Build fails in CI | Env vars required for build — see `validate.yml` |

---

## Related docs

| Doc | Contents |
|-----|----------|
| [../README.md](../README.md) | Monorepo overview |
| [../docs/DEVELOPER-ONBOARDING.md](../docs/DEVELOPER-ONBOARDING.md) | Full local setup |
| [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) | Production deploy |
| [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md) | REST API reference |
