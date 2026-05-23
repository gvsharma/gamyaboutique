# Gamya Couture — Frontend Folder Structure

```
frontend/
├── public/
│   ├── fonts/                          # Self-hosted display/body fonts (optional)
│   └── images/
│       ├── brand/                      # Logo, favicon sources
│       └── placeholders/               # Fallback product imagery
│
├── src/
│   ├── app/                            # Next.js 15 App Router (routes only)
│   │   ├── (marketing)/                # Public marketing shell (Navbar + Footer)
│   │   │   ├── layout.tsx              # Marketing layout wrapper
│   │   │   ├── page.tsx                # Home
│   │   │   ├── about/
│   │   │   │   └── page.tsx            # About
│   │   │   └── contact/
│   │   │       └── page.tsx            # Contact
│   │   │
│   │   ├── (shop)/                     # Catalog & product browsing
│   │   │   ├── layout.tsx              # Shop layout (filters sidebar on desktop)
│   │   │   ├── category/
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx        # Category listing + filters
│   │   │   │       └── loading.tsx
│   │   │   └── products/
│   │   │       └── [id]/
│   │   │           ├── page.tsx        # Product details
│   │   │           └── loading.tsx
│   │   │
│   │   ├── (account)/                  # Auth-gated / account flows
│   │   │   ├── layout.tsx              # Account layout (auth guard)
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Login / register tabs
│   │   │   └── wishlist/
│   │   │       └── page.tsx            # Wishlist (guest + logged-in)
│   │   │
│   │   ├── layout.tsx                  # Root: html, fonts, Providers
│   │   ├── providers.tsx               # QueryClient, theme, toasts
│   │   ├── globals.css                 # Tailwind + boutique CSS variables
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx                 # Root loading UI
│   │   ├── robots.ts                   # SEO robots
│   │   └── sitemap.ts                  # Dynamic sitemap (categories/products)
│   │
│   ├── components/                     # Reusable UI (mostly presentational)
│   │   ├── layout/
│   │   │   ├── navbar/
│   │   │   │   ├── navbar.tsx
│   │   │   │   ├── mobile-menu.tsx
│   │   │   │   └── nav-links.ts
│   │   │   ├── footer/
│   │   │   │   └── footer.tsx
│   │   │   └── site-shell.tsx          # Navbar + main + Footer composition
│   │   │
│   │   ├── home/
│   │   │   ├── hero-banner.tsx
│   │   │   ├── featured-categories.tsx
│   │   │   └── featured-products.tsx
│   │   │
│   │   ├── catalog/
│   │   │   ├── category-grid.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── product-filters.tsx
│   │   │   └── product-grid.tsx
│   │   │
│   │   ├── product/
│   │   │   ├── product-detail-gallery.tsx
│   │   │   ├── product-info.tsx
│   │   │   └── product-breadcrumb.tsx
│   │   │
│   │   ├── interest/
│   │   │   └── interest-form-modal.tsx # Express interest (RHF + Zod)
│   │   │
│   │   ├── forms/                      # Shared field wrappers (Input, etc.)
│   │   │   ├── form-field.tsx
│   │   │   └── submit-button.tsx
│   │   │
│   │   ├── seo/
│   │   │   ├── json-ld.tsx
│   │   │   └── page-header.tsx
│   │   │
│   │   └── ui/                         # shadcn/ui primitives (Button, Dialog, …)
│   │
│   ├── features/                       # Feature modules (hooks + containers)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   └── hooks/
│   │   │       ├── use-login.ts
│   │   │       └── use-current-user.ts
│   │   │
│   │   ├── catalog/
│   │   │   └── hooks/
│   │   │       ├── use-categories.ts
│   │   │       └── use-category-products.ts
│   │   │
│   │   ├── products/
│   │   │   └── hooks/
│   │   │       ├── use-products.ts
│   │   │       ├── use-product-detail.ts
│   │   │       └── use-submit-interest.ts
│   │   │
│   │   └── wishlist/
│   │       ├── components/
│   │       │   └── wishlist-grid.tsx
│   │       └── hooks/
│   │           └── use-wishlist.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts               # Axios instance + interceptors
│   │   │   ├── endpoints.ts            # Path constants
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── catalog.service.ts
│   │   │       └── product.service.ts
│   │   ├── query/
│   │   │   ├── query-client.ts         # getQueryClient() for RSC + client
│   │   │   └── query-keys.ts           # Centralized React Query keys
│   │   ├── auth/
│   │   │   └── token-storage.ts        # localStorage / cookie helpers
│   │   ├── seo/
│   │   │   └── metadata.ts             # buildPageMetadata(), defaults
│   │   └── utils.ts                    # cn(), formatPrice(), etc.
│   │
│   ├── hooks/                          # Cross-cutting React hooks
│   │   ├── use-media-query.ts
│   │   └── use-debounce.ts
│   │
│   ├── stores/                         # Zustand
│   │   ├── auth-store.ts
│   │   ├── wishlist-store.ts
│   │   └── ui-store.ts                 # Modals, mobile nav, interest modal
│   │
│   ├── types/                          # TypeScript models (mirror backend DTOs)
│   │   ├── api.ts                      # ApiResponse<T>, PageResponse<T>
│   │   ├── auth.ts
│   │   ├── catalog.ts
│   │   └── product.ts
│   │
│   ├── schemas/                        # Zod (forms + API validation)
│   │   ├── auth.schema.ts
│   │   ├── contact.schema.ts
│   │   └── interest.schema.ts
│   │
│   └── constants/
│       ├── routes.ts                   # ROUTES.HOME, ROUTES.category(slug), …
│       └── site.ts                     # SITE_NAME, default OG image
│
├── components.json                     # shadcn CLI config
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── ARCHITECTURE.md
```

## Route groups explained

| Group | Purpose |
|-------|---------|
| `(marketing)` | Home, About, Contact — shared premium landing chrome |
| `(shop)` | Category + Product pages — catalog UX, filters |
| `(account)` | Login, Wishlist — auth-aware layout |

Parentheses folders do **not** affect URLs (`/about`, not `/marketing/about`).

## Component ownership

| Component | Location |
|-----------|----------|
| Navbar | `components/layout/navbar/` |
| Footer | `components/layout/footer/` |
| Hero banner | `components/home/hero-banner.tsx` |
| Product card | `components/catalog/product-card.tsx` |
| Category grid | `components/catalog/category-grid.tsx` |
| Product filters | `components/catalog/product-filters.tsx` |
| Product detail gallery | `components/product/product-detail-gallery.tsx` |
| Interest form modal | `components/interest/interest-form-modal.tsx` |

## shadcn/ui

Generated components live in `src/components/ui/`. Add via:

```bash
npx shadcn@latest add button card dialog sheet input label form toast
```

## Naming conventions

- **Files**: kebab-case (`product-card.tsx`)
- **Components**: PascalCase exports
- **Hooks**: `use-*.ts` in `features/*/hooks` or `hooks/`
- **Services**: `*.service.ts` — one domain per file
- **Stores**: `*-store.ts` — single Zustand store per domain
