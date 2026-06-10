# Engineering Decisions — Gamya Couture

Rationale for key architectural choices. Prevents re-litigating decisions in future PRs.

---

## Email or phone login

**Decision:** Users register and login with **email OR phone** (at least one required).

**Why:**
- Target market (Hyderabad boutique) — many customers prefer phone over email
- Single `identifier` field on login simplifies UX
- V10 migration: nullable email, partial unique indexes on email and phone

**Trade-offs:**
- Phone normalization is India-centric (`PhoneNormalizer` adds +91 for 10-digit)
- Verification columns exist but OTP verify-on-register not built yet

---

## JWT + server-side refresh sessions

**Decision:** Short-lived **JWT access tokens** + opaque **refresh tokens** stored hashed in `user_sessions`.

**Why:**
- Stateless API scaling on EC2 (no server-side HTTP sessions)
- Refresh rotation enables logout and password-change session invalidation
- Remember-me extends refresh TTL (30 days) without long-lived JWTs

**Alternatives rejected:**
- Session cookies only — harder with Vercel separate origin without cookie domain setup
- Long-lived JWT only — no revocation on password change

**Trade-offs:**
- Access token not revocable until expiry (~30 min)
- Frontend refresh interceptor not yet implemented

---

## DB design choices

**Decision:** PostgreSQL + Flyway + JPA soft-delete.

**Why:**
- Relational model fits catalog taxonomy, CRM leads, cart line items
- Flyway versioned migrations for reproducible RDS deploys
- `deleted_at` + partial unique indexes preserve history and uniqueness among active rows

**Patterns:**
- UUID primary keys everywhere
- `users` ↔ `customers` 1:1 for commerce
- Cart owner: `customer_id` OR `guest_token` (CHECK constraint)
- Wishlist CASCADE on product delete; cart_items RESTRICT

---

## Cart persistence strategy

**Decision:** Server-side carts for **guest and authenticated** users; guest identified by `X-Guest-Cart-Id` UUID in localStorage.

**Why:**
- Consistent cart across devices when user returns with same browser
- Merge on login via `POST /cart/merge`
- Supports future checkout without client-only cart

**Trade-offs:**
- Guest cart security = UUID secrecy (IDOR risk if leaked)
- No signed guest token yet
- Checkout not implemented — cart is pre-order intent only

---

## Wishlist design

**Decision:** Auth-only wishlist in `wishlist_items`; soft-delete; unique per customer+product.

**Why:**
- Wishlist is a saved preference tied to identity
- `move-to-cart` endpoint keeps cart rules centralized in `CartService`
- Pinterest-style grid is presentation-only (CSS columns)

**Alternatives rejected:**
- localStorage wishlist — lost on device change

---

## UI framework choice

**Decision:** Next.js 15 App Router + Tailwind CSS + custom design tokens.

**Why:**
- SSR/SSG for SEO on product pages
- Vercel deployment fits boutique traffic profile
- Tailwind enables premium bespoke aesthetic without heavy component library lock-in
- Route groups `(marketing)`, `(shop)`, `(account)`, `(admin)` separate layouts

**Design:** Playfair Display + Plus Jakarta Sans; pearl/ivory/maroon palette.

---

## Image strategy

**Decision:** Admin uploads to **S3**; public URLs via **CloudFront**; storefront uses `next/image`.

**Why:**
- Product photos are large; S3 + CDN is cost-effective in ap-south-1
- EC2 instance role avoids embedding AWS keys in app
- URL validation restricts to HTTPS S3/CloudFront/Unsplash (dev)

**Flow:** Upload → get URL → save in `product_images` → PDP gallery sorts by `display_order`.

---

## Deployment architecture

**Decision:** Modular monolith JAR on **single EC2** + **RDS**; frontend on **Vercel**; infra in **separate Terraform repo**.

**Why:**
- Small team / MVP cost control
- GitHub Actions OIDC → S3 → SSM deploy proven pattern
- Vercel handles frontend CDN/SSL; API proxied via rewrite to EC2 HTTP

**Alternatives for scale:**
- ECS/Fargate or Elastic Beanstalk for backend
- ALB + HTTPS + custom API domain
- Redis for session/IP rate limits

---

## API envelope

**Decision:** All responses wrapped in `ApiResponse<T>` with `success`, `message`, `data`, `errors`.

**Why:** Consistent client parsing in Axios; field validation errors in one shape.

**Gap:** `ErrorCode` enum not serialized — clients rely on HTTP status + message text.

---

## CRM dual interest endpoints

**Decision:** Both `POST /interests` and `POST /products/{id}/interest` exist.

**Why:** Historical — product-scoped endpoint added for PDP; CRM controller predates it.

**Guidance:** Storefront uses product-scoped endpoint; consider consolidating later.

---

## Notification outbox

**Decision:** Password reset enqueues to `notification_outbox` rather than inline SMTP/SMS.

**Why:** Decouple delivery from request thread; ready for worker/Lambda processor.

**Status:** Outbox written; **processor not deployed** — forgot-password delivery incomplete.

---

## When to revisit

| Decision | Revisit when |
|----------|--------------|
| EC2 monolith | Traffic > single instance or need zero-downtime deploy |
| Guest cart UUID | Security audit or checkout launch |
| JWT access TTL | Frontend refresh implemented |
| Dev Spring profile on EC2 | Production launch — create `application-prod.yml` |
| Phone-only verification | Regulatory or fraud requirements increase |

---

## Related

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [AUTH_FLOW.md](./AUTH_FLOW.md)
- [TODO.md](../TODO.md)
