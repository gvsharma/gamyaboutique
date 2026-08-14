# Lifecycle Map

## Purpose

**State transitions** across loan origination objects for product and engineering.

## Scope

Summarized lifecycle; full matrix → [master-lifecycle-matrix.md](./master-lifecycle-matrix.md).

## Key concepts

| Object | Official lifecycle anchors |
|--------|---------------------------|
| Loan | create, update, move, delete — **OFFICIAL_DOCUMENTATION** |
| Milestone | startDate, doneIndicator, finishMilestones WH — **OFFICIAL_DOCUMENTATION** |
| Task | status, completed — **OFFICIAL_DOCUMENTATION** |
| Enhanced Condition | add, status, tracking, isRemoved — **OFFICIAL_DOCUMENTATION** |
| Document | create, documentStatus, removed — **OFFICIAL_DOCUMENTATION** |
| Disclosure | log CRUD, delivery side-effects — **OFFICIAL_DOCUMENTATION** |

## Definitions

- **BUSINESS EXAMPLE** states (e.g. "Re-requested") — not ICE enum unless documented
- **LENDER CONFIGURABLE** status labels on conditions/documents

## Relationships

Mortgage narrative: [01-domain/mortgage-lifecycle.md](../01-domain/mortgage-lifecycle.md) — **ILLUSTRATIVE_BUSINESS_EXAMPLE** stages

## API references

Milestone finish: `PATCH .../milestones/{id}` `{ "doneIndicator": true }` — **OFFICIAL_DOCUMENTATION**

## Examples

Processing → Cond. Approval → Doc Preparation — **ILLUSTRATIVE_BUSINESS_EXAMPLE**; names **LENDER CONFIGURABLE**

## Production notes

Milestone History Log captures transitions — **OFFICIAL_DOCUMENTATION**; not same as milestone GET comments field

## Common mistakes

- Treating milestone `comments` as history thread — overwrites — **OFFICIAL_DOCUMENTATION**

## FAQ

See [product-faq.md](./product-faq.md).

## Related documents

- [milestone-map.md](./milestone-map.md) · [condition-map.md](./condition-map.md)

## Source references

- [master-lifecycle-matrix.md](./master-lifecycle-matrix.md) — Last verified 2026-08-13
