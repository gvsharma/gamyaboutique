# Gamya Couture — Frontend Architecture

Next.js 15 App Router storefront for the Gamya Couture boutique. Consumes the Spring Boot API at `/api/v1`.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS variables (boutique theme) |
| UI primitives | shadcn/ui |
| Server/async state | TanStack React Query |
| Client state | Zustand (auth, wishlist, UI) |
| HTTP | Axios (interceptors, JWT) |
| Forms | React Hook Form + Zod |

## Principles

- **Mobile first** — base styles for small screens; `md:` / `lg:` for layout upgrades.
- **Premium boutique UI** — restrained palette, serif display + sans body, generous whitespace, subtle motion.
- **SEO** — `generateMetadata` per route, `sitemap.ts`, `robots.ts`, JSON-LD on product/category pages.
- **Reusable components** — presentational components in `components/`; data wiring in `features/` and route `page.tsx` files.
- **Clean boundaries** — `app/` = routes only; `lib/api` = HTTP; `stores/` = client persistence; `schemas/` = Zod.

## Folder structure

See [FOLDER-STRUCTURE.md](./FOLDER-STRUCTURE.md) for the full tree.

## Route map

| Page | App path | API |
|------|----------|-----|
| Home | `/` | `GET /catalog/categories`, featured products |
| About | `/about` | static |
| Category | `/category/[slug]` | `GET /catalog/categories/{slug}/products` |
| Product details | `/products/[id]` | `GET /products/{id}`, `POST /products/{id}/interest` |
| Contact | `/contact` | static / future lead API |
| Wishlist | `/wishlist` | client (Zustand) |
| Login | `/login` | `POST /auth/login`, `GET /auth/me` |

## Data flow

```
page.tsx (RSC or client)
  → hooks (useProducts, useCategoryProducts)
    → React Query
      → lib/api/services/*
        → Axios client (Bearer from Zustand/auth)
```

## Auth

- Login stores JWT via `lib/auth/token-storage` + `auth-store`.
- Axios request interceptor attaches `Authorization: Bearer`.
- Protected routes: `(account)` layout checks auth; redirect to `/login`.

## Environment

All API URLs flow through `lib/api/config.ts` (single source of truth for `/api/v1`).

| Mode | `NEXT_PUBLIC_API_BASE_URL` | `API_PROXY_TARGET` |
|------|---------------------------|-------------------|
| Local Spring Boot | `http://localhost:8080/api/v1` | *(unset)* |
| Vercel + dev EC2 | `/api/v1` | `http://13.232.200.243` |

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Request paths (Vercel + EC2)

```
Browser (client components)
  → GET /api/v1/products  (same origin, HTTPS)
  → Next.js rewrite
  → http://13.232.200.243/api/v1/products  (nginx → Spring :8080)

Server components (SSR)
  → serverFetch("/products")
  → http://13.232.200.243/api/v1/products  (direct via API_PROXY_TARGET)
```

Backend CORS on EC2 must include `NEXT_PUBLIC_SITE_URL` for auth flows; catalog GETs via rewrite are same-origin and do not hit CORS in the browser.
