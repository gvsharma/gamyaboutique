# Luxury boutique product roadmap

Strategic phases for Gamya Couture storefront, admin, and platform — written for CPTO / solution architecture alignment.

## Design principles (world-class UX)

| Principle | Application |
|-----------|-------------|
| **Restraint** | Fewer homepage chapters; one carousel, not three |
| **Rhythm** | `section-luxury` spacing (80–112px); generous whitespace |
| **Editorial first** | Collections and stories before taxonomy grids |
| **Imagery-led** | 3:4 and 4:5 portraits; slow, subtle hover motion |
| **Human exit** | Consultation and WhatsApp as quiet, persistent paths |
| **Draft-tolerant ops** | Admin captures minimal data; publish when ready |
| **Performance** | LCP on hero; lazy video; responsive images |

## Phase A — Perception (implemented)

**Goal:** Feel like a luxury boutique without new merchandising backend.

- Homepage reduced to ~6 chapters: Hero → Video → Featured collection → Category doors → Editor's pick → Story → Consultation
- Navigation simplified: Collections, Women, Girls, Custom stitching, Our story
- Static trust line (no marquee ticker)
- Cleaner header (pearl, less pink gradient)
- Collection pages as lookbooks with consultation CTA
- `/collections` index for curated edits

## Phase B — Merchandising engine (implemented)

**Goal:** Change homepage without code deploys.

- `homepage_slots` table with `FEATURED_COLLECTION` and `CURATED_EDIT`
- Public API: `GET /api/v1/site/homepage`
- Admin API: `PUT /api/v1/admin/homepage/slots/{key}`
- Admin UI: `/admin/homepage` — pick featured collection, carousel labels, product IDs

**Slot resolution order (curated edit):**

1. Manual `product_ids` if set
2. Products from `collection_slug` if set
3. Latest active shop products (fallback)

## Phase C — Relationship layer (implemented)

**Goal:** Revenue through conversation, especially custom stitching.

- `POST /api/v1/consultations` — public consultation requests (occasion, budget, timeline)
- Extended `crm_leads` with consultation fields + `stylist_notes`
- Contact page consultation form; admin leads drawer with stylist notes
- Product-aware WhatsApp links on PDP (size, color, price, URL)
- Wishlist → WhatsApp stylist bar
- Removed auto-popup support dialog (luxury = no interruption)

## Phase D — Performance & polish (next)

**Goal:** Fast, calm, credible on mobile India.

- Hero image srcset and priority LCP tuning
- Video: one featured clip, poster-first, no autoplay with sound
- PDP: sticky buy/inquire on mobile, gallery-first layout
- Audit tap targets (min 44px), font scale, and footer link count

## Phase E — Content platform (future)

**Goal:** Scale stories without engineering each season.

- Homepage slot types: `HERO`, `STORY_BLOCK`, `VIDEO`, `COLLECTION`, `PRODUCT_LIST`
- CMS blocks for About / seasonal landing pages
- Scheduled collection visibility (already partially on `seasonal_collections`)

## Architecture guardrails

1. **Collections = stories; categories = navigation** — do not duplicate in nav
2. **Single source of truth** — homepage reads slots API, not hardcoded sections
3. **Publish gates** — ACTIVE products require type + price; drafts stay internal
4. **Media on CDN** — images/video are the product; optimize pipeline early
5. **Admin parity** — every storefront slot should be editable in admin within 2 clicks

## Success metrics

- Homepage bounce rate and scroll depth on mobile
- Consultation / WhatsApp clicks per session
- Time from draft product → ACTIVE with media
- Collection page → PDP → inquiry conversion
