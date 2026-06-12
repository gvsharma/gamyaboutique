# Features — Gamya Couture

Quick business reference. All features below exist in code unless marked **planned**.

---

## User features

### Home (`/`)

| | |
|---|---|
| **Description** | Hero banner, featured categories, trending product carousel |
| **APIs** | `GET /products`, `GET /categories/tree` |
| **DB** | `products`, `categories`, `product_images` |
| **Logic** | Server-fetched products for carousel; categories from active tree |
| **Edge cases** | Empty catalog → carousel hidden |
| **Future** | Personalized recommendations, seasonal campaigns |

---

### Shop (`/shop`)

| | |
|---|---|
| **Description** | Paginated product grid with optional search |
| **APIs** | `GET /products`, `GET /products/search?q=` |
| **DB** | `products`, `product_images`, taxonomy joins |
| **Logic** | Filters: category, fabric, print; sort by `createdAt`; only `ACTIVE` products |
| **Edge cases** | Loading skeleton; API down → error message |
| **Future** | Faceted filters UI, sort options |

---

### Search

| | |
|---|---|
| **Description** | Text search on shop page via query param |
| **APIs** | `GET /products/search?q=&page=&size=` |
| **DB** | `products.search_vector` (GIN index, V4) |
| **Logic** | Full-text search combined with list filters |
| **Edge cases** | Empty query falls back to list |
| **Future** | Search suggestions, typo tolerance |

---

### Categories (`/category/[slug]`)

| | |
|---|---|
| **Description** | Browse products within one category |
| **APIs** | `GET /catalog/categories`, `GET /catalog/categories/{slug}/products` |
| **DB** | `categories`, `products` |
| **Logic** | Slug lookup; paginated active products in category |
| **Edge cases** | Unknown slug → fallback title from slug text |
| **Future** | Subcategory drill-down |

---

### Product detail (`/products/[id]`)

| | |
|---|---|
| **Description** | Gallery, price, low-stock badge, add to cart/wishlist, interest form, related products |
| **APIs** | `GET /products/{id}`, `POST /products/{id}/view`, `GET /products/{id}/related`, `POST /products/{id}/interest`, cart/wishlist mutations |
| **DB** | `products`, `product_images`, `customer_interest`, `recently_viewed_products` |
| **Logic** | View recorded for auth users; related = same category; stock validation on add |
| **Edge cases** | 404 if missing/archived; placeholder image if no S3 URL |
| **Future** | Size/color variant selector, reviews |

---

### Login / Register

| | |
|---|---|
| **Description** | Email **or** phone + password; guest cart merge on success |
| **APIs** | `POST /auth/login`, `POST /auth/register`, `POST /cart/merge`, `GET /auth/me` |
| **DB** | `users`, `customers`, `user_sessions`, `carts` |
| **Logic** | BCrypt passwords; JWT access + opaque refresh token; lockout after 5 failures |
| **Edge cases** | Duplicate email/phone → 409; weak password rejected |
| **Future** | Email/phone verification OTP |

**Routes:** `/login`, `/register`

---

### Forgot / Reset password

| | |
|---|---|
| **Description** | Request reset by identifier; reset via email token or phone OTP |
| **APIs** | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| **DB** | `password_reset_tokens`, `otp_verifications`, `notification_outbox` |
| **Logic** | Anti-enumeration on forgot; tokens hashed; sessions revoked on reset |
| **Edge cases** | Expired token/OTP → 401; delivery via outbox (**processor not wired**) |
| **Future** | SES/SMS worker |

**Routes:** `/forgot-password`, `/reset-password`

---

### Cart

| | |
|---|---|
| **Description** | Guest cart (localStorage UUID) or customer cart; drawer + full page |
| **APIs** | `GET/POST/PATCH/DELETE /cart/**`, `POST /cart/merge` |
| **DB** | `carts`, `cart_items`, `products.stock_quantity` |
| **Logic** | Guest header `X-Guest-Cart-Id`; merge sums lines; stock cap on add/update |
| **Edge cases** | Inactive product in cart; merge caps stock; no checkout yet |
| **Future** | Checkout, abandoned cart recovery |

**Routes:** `/cart`, cart drawer in navbar

---

### Wishlist

| | |
|---|---|
| **Description** | Saved products (auth only); Pinterest-style grid; move to cart |
| **APIs** | `GET/POST/DELETE /wishlist/items/{id}`, `POST .../move-to-cart` |
| **DB** | `wishlist_items`, `customers` |
| **Logic** | Unique per customer+product; inactive products filtered from list |
| **Edge cases** | Login required; duplicate add idempotent |
| **Future** | Share wishlist, price-drop alerts |

**Route:** `/wishlist`

---

### Profile

| | |
|---|---|
| **Description** | Update name/email/phone; change password; manage addresses |
| **APIs** | `GET/PUT /customers/me`, `PUT /customers/me/password`, address CRUD |
| **DB** | `users`, `customers`, `addresses` |
| **Logic** | Profile syncs user + customer rows; password change revokes all sessions |
| **Edge cases** | Duplicate email/phone on update → 409 |
| **Future** | Order history, preferences |

**Routes:** `/account`, `/account/addresses`

---

### Gallery (PDP)

| | |
|---|---|
| **Description** | Main image, thumbnails, fullscreen zoom, keyboard nav |
| **APIs** | (images from `ProductDetailDto.images`) |
| **DB** | `product_images` ordered by `display_order` |
| **Logic** | `next/image`; touch swipe on thumbnails; lazy-loaded thumbs |
| **Edge cases** | Single image hides strip; Unsplash placeholder |
| **Future** | Swipe on hero, 360° views |

---

### Inquiry (Express your interest)

| | |
|---|---|
| **Description** | Lead capture on PDP — email, phone, optional message |
| **APIs** | `POST /products/{id}/interest` (also legacy `POST /interests`) |
| **DB** | `customer_interest`, `customer_interest_audit_log` |
| **Logic** | Creates CRM lead; guest or authenticated |
| **Edge cases** | Validation on email/phone format |
| **Future** | WhatsApp deep link, trial booking |

---

## Admin features

### Dashboard (`/admin`)

| | |
|---|---|
| **Description** | Counts: active products, categories, open leads, recent interests |
| **APIs** | `GET /admin/dashboard/summary` |
| **DB** | `products`, `categories`, `customer_interest`, `crm_leads` |
| **Auth** | ADMIN role |
| **Future** | Charts, revenue (when orders exist) |

---

### Product CRUD (`/admin/products`)

| | |
|---|---|
| **Description** | List, create, edit, publish/archive, soft-delete |
| **APIs** | `GET/POST/PUT/PATCH/DELETE /admin/products/**` |
| **DB** | `products`, `product_images`, taxonomy FKs, `stock_quantity` |
| **Logic** | SKU unique; status DRAFT→ACTIVE→ARCHIVED; image URL validation |
| **Edge cases** | Duplicate SKU → error; S3 required for uploads on EC2 |
| **Future** | Bulk import, inventory alerts |

---

### Categories CRUD (`/admin/categories`)

| | |
|---|---|
| **Description** | Hierarchical categories; create with parent/slug/order |
| **APIs** | `GET/POST/PUT/DELETE /admin/categories` |
| **DB** | `categories` (path, depth, parent_id) |
| **Logic** | Slug unique per parent; deactivate cascades subtree |
| **Edge cases** | Cycle prevention on reparent |
| **Future** | Category images |

---

### Image upload

| | |
|---|---|
| **Description** | Multipart upload to S3; URL stored on product |
| **APIs** | `POST /admin/media/upload` |
| **DB** | URL in `product_images` |
| **Logic** | EC2 instance IAM role; CloudFront public URL returned |
| **Edge cases** | S3 disabled locally → upload fails |
| **Future** | Image resize/optimization pipeline |

---

### Role-based login

| | |
|---|---|
| **Description** | ADMIN → `/admin`; CUSTOMER → storefront |
| **APIs** | `POST /auth/login`, `GET /auth/me` (roles in response) |
| **DB** | `users`, `user_roles`, `roles` |
| **Logic** | `@PreAuthorize` on admin controllers; frontend `AdminGuard` |
| **Edge cases** | Customer cannot access admin routes (403) |
| **Future** | STAFF CRM UI |

---

## Feature matrix

| Feature | Guest | Auth | Admin |
|---------|-------|------|-------|
| Browse catalog | ✅ | ✅ | ✅ |
| Cart | ✅ | ✅ | — |
| Wishlist | ❌ | ✅ | — |
| Interest form | ✅ | ✅ | — |
| Profile | ❌ | ✅ | — |
| Admin panel | ❌ | ❌ | ✅ |
