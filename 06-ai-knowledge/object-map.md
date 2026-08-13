# Object Map

## Purpose

Index of **Encompass business objects** with pointers to canonical documentation.

## Scope

Object definitions and IDs. Full 17-column matrix → [master-object-matrix.md](./master-object-matrix.md).

## Key concepts

| Object | Primary ID (ENCOMPASS) | Parent |
|--------|------------------------|--------|
| Loan | `loan.id` GUID | — |
| Application | id in loan body | Loan |
| Enhanced Condition | `id` | Loan |
| Document | `documentId` | Loan |
| Attachment | attachment `id` | Document (when assigned) |
| Workflow Task | task `id` | Loan (via workEntity) |
| Milestone Log | milestone `id` | Loan |
| Conversation Log | log `id` | Loan |
| Disclosure Log | disclosure log id | Loan |

## Definitions

- **Fixed collection** — cannot delete items, only empty — **OFFICIAL_DOCUMENTATION**
- **Variable collection** — add/remove/reorder — **OFFICIAL_DOCUMENTATION**
- **Editable log** — user CRUD (conversation, AUS) — **OFFICIAL_DOCUMENTATION**
- **System log** — read-only (milestone history, HTML email, lock) — **OFFICIAL_DOCUMENTATION**

## Relationships

[relationship-map.md](./relationship-map.md) · Condition ↔ Document ↔ Attachment chain — **OFFICIAL_DOCUMENTATION**

## API references

Per-object rows in [master-object-matrix.md](./master-object-matrix.md).

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** Paystub condition → Paystubs document → Paystub.pdf attachment.

## Production notes

Store Encompass GUIDs as immutable keys — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

## Common mistakes

- Confusing Workflow Task with Milestone Task — **OFFICIAL_DOCUMENTATION** (distinct)

## FAQ

See [developer-faq.md](./developer-faq.md).

## Related documents

- [loan-map.md](./loan-map.md) · [condition-map.md](./condition-map.md) · [document-map.md](./document-map.md)

## Source references

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) — Last verified 2026-08-13
