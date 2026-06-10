# API Contract — Gamya Couture

Base URL: `/api/v1`  
Envelope: all responses use `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "optional",
  "data": { },
  "timestamp": "2026-06-09T12:00:00Z",
  "path": null,
  "errors": null
}
```

Errors return `success: false` with HTTP 4xx/5xx and optional `errors[]` field validation list.

**Auth header:** `Authorization: Bearer <accessToken>`  
**Guest cart:** `X-Guest-Cart-Id: <uuid>`

Interactive docs: `/swagger-ui.html` (public in dev — restrict in prod).

---

## Auth (`/auth`)

| Method | Path | Auth | Body | Response `data` |
|--------|------|------|------|-----------------|
| POST | `/auth/login` | Public | `LoginRequest` | `TokenResponse` |
| POST | `/auth/register` | Public | `RegisterRequest` | `TokenResponse` |
| POST | `/auth/refresh` | Public | `{ refreshToken }` | `TokenResponse` |
| POST | `/auth/logout` | Public* | `{ refreshToken? }` | `null` |
| POST | `/auth/forgot-password` | Public | `{ identifier }` | `null` |
| POST | `/auth/reset-password` | Public | `ResetPasswordRequest` | `null` |
| GET | `/auth/me` | Bearer | — | `UserProfileResponse` |

\*Logout is public; revokes refresh token if provided.

### `LoginRequest`
```json
{ "identifier": "email or phone", "password": "...", "rememberMe": false }
```

### `RegisterRequest`
```json
{
  "email": "optional@example.com",
  "phone": "optional +91...",
  "password": "Min8!char",
  "firstName": "...",
  "lastName": "..."
}
```
Validation: `@EmailOrPhoneRequired`, `@ValidPassword` (8+ chars, upper, lower, digit, special).

### `TokenResponse`
```json
{
  "accessToken": "jwt...",
  "refreshToken": "opaque...",
  "tokenType": "Bearer",
  "expiresInMs": 1800000,
  "refreshExpiresInMs": 604800000
}
```

### `ResetPasswordRequest`
Either `{ "token": "uuid", "newPassword": "..." }` OR `{ "otp": "123456", "identifier": "phone/email", "newPassword": "..." }`

### Errors
| Scenario | Status | Message |
|----------|--------|---------|
| Bad credentials | 401 | Invalid credentials |
| Account locked | 429 | Account temporarily locked |
| Duplicate register | 409 | Email/phone already registered |
| Invalid reset | 401 | Invalid or expired token/OTP |

---

## Products (`/products`)

| Method | Path | Auth | Query/Body | Response |
|--------|------|------|------------|----------|
| GET | `/products` | Public | `ProductListFilter`, page, size, sort | `PageResponse<ProductSummaryDto>` |
| GET | `/products/search` | Public | `q`, filters, page | `PageResponse<ProductSummaryDto>` |
| GET | `/products/{id}` | Public | — | `ProductDetailDto` |
| POST | `/products/{id}/interest` | Public | `ProductInterestRequest` | `ProductInterestCreatedResponse` |
| GET | `/products/{id}/related` | Public | — | `ProductSummaryDto[]` |
| POST | `/products/{id}/view` | Public | — | `null` |

### `ProductInterestRequest`
```json
{ "email": "...", "phone": "...", "message": "optional" }
```

### Errors
| Scenario | Status |
|----------|--------|
| Product not found | 404 |
| Inactive/archived product | 404 |

---

## Categories & catalog

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/categories/tree` | Public | `CategoryTreeNodeDto[]` |
| GET | `/catalog/categories` | Public | `CategoryDto[]` |
| GET | `/catalog/categories/{slug}/products` | Public | `PageResponse<ProductSummaryDto>` |

---

## Cart (`/cart`)

| Method | Path | Auth | Headers | Body | Response |
|--------|------|------|---------|------|----------|
| GET | `/cart` | Public | Guest optional | — | `CartDto` |
| POST | `/cart/items` | Public | Guest optional | `AddCartItemRequest` | `CartDto` |
| PATCH | `/cart/items/{itemId}` | Public | Guest optional | `{ quantity }` | `CartDto` |
| DELETE | `/cart/items/{itemId}` | Public | Guest optional | — | `CartDto` |
| DELETE | `/cart` | Public | Guest optional | — | `CartDto` |
| POST | `/cart/merge` | **Bearer** | Guest header | — | `CartDto` |

### `AddCartItemRequest`
```json
{
  "productId": "uuid",
  "quantity": 1,
  "selectedSize": "optional",
  "selectedColor": "optional"
}
```

### `CartDto`
```json
{
  "id": "uuid",
  "guestToken": "uuid",
  "itemCount": 2,
  "subtotal": 4999.00,
  "currency": "INR",
  "items": [ { "id", "productId", "quantity", "product": ProductSummaryDto } ]
}
```

### Errors
| Scenario | Status | Message |
|----------|--------|---------|
| Insufficient stock | 422 | Insufficient stock |
| Product not found/inactive | 404 | Product not found |
| Item not in cart | 404 | Cart item not found |

---

## Wishlist (`/wishlist`)

All endpoints require **Bearer** token.

| Method | Path | Response |
|--------|------|----------|
| GET | `/wishlist` | `ProductSummaryDto[]` |
| POST | `/wishlist/items/{productId}` | `ProductSummaryDto[]` |
| DELETE | `/wishlist/items/{productId}` | `ProductSummaryDto[]` |
| POST | `/wishlist/items/{productId}/move-to-cart` | `null` |

### Errors
| Scenario | Status |
|----------|--------|
| No customer profile | 403 |
| Product not found | 404 |

---

## Customer profile (`/customers`)

All require **Bearer**.

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/customers/me` | — | `CustomerProfileDto` |
| PUT | `/customers/me` | `UpdateCustomerProfileRequest` | `CustomerProfileDto` |
| PUT | `/customers/me/password` | `{ currentPassword, newPassword }` | `null` |
| GET | `/customers/me/addresses` | — | `AddressDto[]` |
| POST | `/customers/me/addresses` | `UpsertAddressRequest` | `AddressDto` |
| PUT | `/customers/me/addresses/{id}` | `UpsertAddressRequest` | `AddressDto` |
| DELETE | `/customers/me/addresses/{id}` | — | `null` |
| GET | `/customers/me/recently-viewed` | — | `ProductSummaryDto[]` |

---

## Inquiry (`/interests`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/interests` | Public | `CreateInterestRequest` | `InterestCreatedResponse` |

Alternative: `POST /products/{id}/interest` (preferred on storefront).

---

## Admin (`/admin/**`)

Requires **Bearer** + role **ADMIN** (`@PreAuthorize`).

### Dashboard
| GET | `/admin/dashboard/summary` | `DashboardSummaryDto` |
| GET | `/admin/dashboard/leads-by-status` | `LeadsByStatusDto` |

### Products
| GET | `/admin/products` | Paginated list (all statuses) |
| GET | `/admin/products/{id}` | `ProductDetailDto` |
| POST | `/admin/products` | Create → `ProductDetailDto` |
| PUT | `/admin/products/{id}` | Update |
| PATCH | `/admin/products/{id}/status` | `{ "status": "ACTIVE" }` |
| DELETE | `/admin/products/{id}` | Soft delete (204) |

### Categories
| GET/POST | `/admin/categories` | List / create |
| PUT | `/admin/categories/{id}` | Update |
| DELETE | `/admin/categories/{id}` | Deactivate (204) |

### Media
| POST | `/admin/media/upload` | `multipart/form-data`: `file`, optional `folder` → `{ url, provider }` |

### Taxonomy
| GET | `/admin/taxonomy/fabrics` | Option list |
| GET | `/admin/taxonomy/prints` | Option list |

---

## CRM (`/crm/leads`)

Requires **Bearer** + role **STAFF** or **ADMIN**.

| GET | `/crm/leads` | Paginated leads |
| POST | `/crm/leads` | Create lead |
| PATCH | `/crm/leads/{id}/status` | Update status |
| DELETE | `/crm/leads/{id}` | Soft delete |

---

## Pagination

`PageResponse<T>` fields: `content`, `page`, `size`, `totalElements`, `totalPages`, `first`, `last`.

Query params: `page` (0-based), `size`, `sort` (e.g. `createdAt,desc`).

---

## Health (non-API prefix)

| GET | `/actuator/health` | Public |
| GET | `/actuator/info` | Public |

---

## Frontend endpoint map

See `frontend/src/lib/api/endpoints.ts` for client-side path constants.
