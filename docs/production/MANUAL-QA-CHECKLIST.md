# Manual QA Checklist — Gamya Couture

Use before every production release. Test on **mobile (375px)** and **desktop (1280px)** unless noted.

**Environment:** Vercel production URL + EC2 API  
**Tester:** _______________ **Date:** _______________ **Build/Commit:** _______________

Legend: ☐ Pass ☐ Fail ☐ N/A ☐ Blocked

---

## 0. Pre-flight

| # | Check | Mobile | Desktop | Notes |
|---|-------|--------|---------|-------|
| 0.1 | `/actuator/health` returns UP | — | ☐ | |
| 0.2 | Homepage loads without console errors | ☐ | ☐ | |
| 0.3 | API proxy works (`/api/v1/products` → 200 in Network tab) | ☐ | ☐ | |
| 0.4 | Product images load from CDN/S3 | ☐ | ☐ | |

---

## 1. Register

| # | Scenario | Steps | Expected | Pass |
|---|----------|-------|----------|------|
| 1.1 | Happy path (email) | `/register` → fill name, email, strong password → submit | Redirect home; navbar shows account state | ☐ |
| 1.2 | Happy path (phone) | Register with phone only (+91…) | Account created | ☐ |
| 1.3 | Duplicate email | Register existing email | Error message; no crash | ☐ |
| 1.4 | Duplicate phone | Register existing phone | Error message | ☐ |
| 1.5 | Weak password | `password123` | Validation error with hint | ☐ |
| 1.6 | Neither email nor phone | Leave both empty | Validation error | ☐ |
| 1.7 | Password visibility | Toggle/type in password field | Masked input works | ☐ |

**Edge cases:**

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 1.8 | Double-click submit | Single account created | ☐ |
| 1.9 | Email case variation | `User@Email.com` vs `user@email.com` treated as duplicate | ☐ |
| 1.10 | Phone format variants | `7995229463`, `+917995229463`, spaces | Normalized and accepted | ☐ |

---

## 2. Login

| # | Scenario | Steps | Expected | Pass |
|---|----------|-------|----------|------|
| 2.1 | Email login | Valid email + password | Redirect; session active | ☐ |
| 2.2 | Phone login | Valid phone + password | Success | ☐ |
| 2.3 | Wrong password | Valid user, bad password | Generic "Invalid credentials" | ☐ |
| 2.4 | Unknown user | Non-existent email | Same generic error (no enumeration) | ☐ |
| 2.5 | Remember me | Check box → login → close browser → reopen | Session persists (refresh token) | ☐ |
| 2.6 | Return URL | `/login?returnUrl=/wishlist` → login | Lands on wishlist | ☐ |
| 2.7 | Admin login | `admin@gamyacouture.com` | Redirect to `/admin` | ☐ |

**Edge cases:**

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 2.8 | Account lockout | 5 wrong passwords | Rate limit / lock message | ☐ |
| 2.9 | Disabled account | (if test account exists) | Cannot access protected routes | ☐ |
| 2.10 | Empty fields | Submit with blanks | Field validation errors | ☐ |

---

## 3. Forgot / Reset password

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 3.1 | Forgot — existing email | Generic success message (always) | ☐ |
| 3.2 | Forgot — unknown email | Same generic success (no enumeration) | ☐ |
| 3.3 | Reset with email token | `/reset-password?token=…` → new password → login | ☐ |
| 3.4 | Reset with phone OTP | OTP + identifier + new password | ☐ |
| 3.5 | Expired token | Error message | ☐ |
| 3.6 | Weak new password | Validation rejected | ☐ |

**Note:** Email/SMS delivery requires notification outbox processor — verify in staging before relying on 3.3/3.4.

---

## 4. Cart

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 4.1 | Add from PDP | Item in cart drawer; count badge updates | ☐ |
| 4.2 | Add from shop grid | (desktop hover / mobile via PDP) | ☐ |
| 4.3 | Guest cart persistence | Add item → refresh page → cart retained | ☐ |
| 4.4 | Update quantity | Change qty on `/cart` | Subtotal recalculates | ☐ |
| 4.5 | Remove item | Item removed; empty state shown | ☐ |
| 4.6 | Cart merge on login | Guest adds item → login → item still in cart | ☐ |
| 4.7 | Cart drawer | Open/close; scroll; checkout note visible | ☐ |

**Edge cases:**

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 4.8 | Duplicate add clicks | Quantity increments correctly (not duplicate lines) | ☐ |
| 4.9 | Low stock product | Warning shown; add respects stock cap | ☐ |
| 4.10 | Out of stock (stock=0) | Add disabled or error surfaced | ☐ |
| 4.11 | Inactive/archived product in cart | Handled gracefully | ☐ |

---

## 5. Wishlist

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 5.1 | Add from PDP (logged in) | Heart filled; badge count | ☐ |
| 5.2 | `/wishlist` page | Pinterest grid layout; images load | ☐ |
| 5.3 | Remove from wishlist | Item removed | ☐ |
| 5.4 | Move to bag | Item in cart; removed from wishlist | ☐ |
| 5.5 | Not logged in | Redirect or sign-in prompt | ☐ |

**Edge cases:**

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 5.6 | Duplicate add | No duplicate rows | ☐ |
| 5.7 | Product deactivated | Removed from wishlist list | ☐ |

---

## 6. Search & browse

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 6.1 | Shop page `/shop` | Product grid; skeleton while loading | ☐ |
| 6.2 | Search by name | Results filter (if implemented) or N/A | ☐ |
| 6.3 | Pagination | Next/previous pages work | ☐ |
| 6.4 | Empty shop | Graceful empty state | ☐ |

---

## 7. Category browse

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 7.1 | Homepage categories | Links navigate to `/category/{slug}` | ☐ |
| 7.2 | Category header | Correct category name | ☐ |
| 7.3 | Product count | "N pieces" displays | ☐ |
| 7.4 | Invalid category slug | 404 or empty state | ☐ |

---

## 8. Product gallery (PDP)

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 8.1 | Main image | Correct aspect ratio; no layout shift | ☐ |
| 8.2 | Thumbnail strip | Click changes main image | ☐ |
| 8.3 | Zoom / fullscreen | Tap main image → fullscreen; Escape closes | ☐ |
| 8.4 | Keyboard nav | Arrow keys in fullscreen | ☐ |
| 8.5 | Mobile swipe | Thumbnail row swipe (or main image) | ☐ |
| 8.6 | Single image product | No broken thumbnail row | ☐ |
| 8.7 | Missing image | Placeholder shown | ☐ |
| 8.8 | Related products | Carousel appears when data exists | ☐ |
| 8.9 | Sticky mobile ATC | Bar visible at bottom on scroll | ☐ |
| 8.10 | WhatsApp share FAB | Opens WhatsApp with product link | ☐ |

---

## 9. Profile update

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 9.1 | View profile | `/account` shows current data | ☐ |
| 9.2 | Update name | Save → success message | ☐ |
| 9.3 | Change password | Current + new password → success | ☐ |
| 9.4 | Wrong current password | Error message | ☐ |
| 9.5 | Add address | `/account/addresses` → new address listed | ☐ |
| 9.6 | Delete address | Removed from list | ☐ |
| 9.7 | Account nav pills | Profile / Addresses / Wishlist / Bag links work | ☐ |

**Edge cases:**

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 9.8 | Change password logs out other sessions | Old refresh tokens invalid | ☐ |
| 9.9 | Duplicate email on profile update | Conflict error | ☐ |

---

## 10. Logout

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 10.1 | Sign out from account | Redirect home; protected routes blocked | ☐ |
| 10.2 | Wishlist after logout | Requires login again | ☐ |
| 10.3 | Back button after logout | Does not expose cached protected data | ☐ |

---

## 11. Admin (smoke)

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 11.1 | Non-admin blocked | Customer cannot access `/admin` | ☐ |
| 11.2 | Dashboard loads | Stats visible | ☐ |
| 11.3 | Create product + upload image | S3 URL saved | ☐ |
| 11.4 | Publish product | Appears on storefront | ☐ |

---

## 12. Cross-cutting UX

| # | Check | Pass |
|---|-------|------|
| 12.1 | Typography consistent (Playfair headings, Jakarta body) | ☐ |
| 12.2 | No horizontal scroll on mobile | ☐ |
| 12.3 | Focus visible on keyboard tab | ☐ |
| 12.4 | Loading skeletons (shop, wishlist) | ☐ |
| 12.5 | 404 page (`/products/invalid-id`) | ☐ |
| 12.6 | About / Contact pages render | ☐ |

---

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA | | | |
| Product | | | |
| Engineering | | | |

**Release decision:** ☐ Go ☐ No-Go  
**Blockers (if No-Go):**
