# Product FAQ

## Purpose

Product and operations questions about loan workflow visibility.

## Scope

Business concepts — not API implementation detail.

---

### What is a condition vs document?

Condition = requirement — **OFFICIAL_DOCUMENTATION**. Document = evidence container — **OFFICIAL_DOCUMENTATION**. Same paystub: condition text vs Paystubs folder.

### What shows in "Recent Activity"?

Normalized timeline: comments, uploads, status changes, milestones, tasks — **INTERNAL_ARCHITECTURE_RECOMMENDATION**. Configurable filters in UI.

### Can processors see UW-only comments?

Depends on `isExternal` and persona — **OFFICIAL_DOCUMENTATION** + **LENDER CONFIGURABLE**.

### What is loan stage?

Usually current milestone name — **ILLUSTRATIVE_BUSINESS_EXAMPLE** mapping; names **LENDER CONFIGURABLE**.

### Condition aging?

Days since `statusDate` while open — **INTERNAL_ARCHITECTURE_RECOMMENDATION** derived from **OFFICIAL_DOCUMENTATION** fields.

### SLA breach?

Compare milestone age to `days` expected — **INTERNAL_ARCHITECTURE_RECOMMENDATION**; thresholds **LENDER CONFIGURABLE**.

### Borrower communication history?

Conversation logs + HTML email logs + portal submit events — **OFFICIAL_DOCUMENTATION** sources.

### Disclosure status?

Disclosure Tracking 2015 logs — **OFFICIAL_DOCUMENTATION**. Not same as eFolder document title.

---

## Related documents

[product-faq.md](./product-faq.md) · [05-dashboard-architecture/dashboard-ux.md](../05-dashboard-architecture/dashboard-ux.md)

## Source references

[01-domain/mortgage-lifecycle.md](../01-domain/mortgage-lifecycle.md) — Last verified 2026-08-13
