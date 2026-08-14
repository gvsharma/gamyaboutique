# Document Map

## Purpose

**eFolder, documents, attachments, orders, and delivery** in one retrieval index.

## Scope

Document domain + APIs. Canonical: [01-domain/documents-efolder.md](../01-domain/documents-efolder.md).

## Key concepts

```
eFolder → Document (container) → Attachment (file)
Document Order → generate package → Document Delivery → Disclosure log + eFolder containers
```

All **OFFICIAL_DOCUMENTATION** model.

## Definitions

| Term | Meaning |
|------|---------|
| `documentStatus` | Current status field — **VERSION_DEPENDENT** 26.1+ |
| `status` | Deprecated — **VERSION_DEPENDENT** |
| `includeRemoved` | Soft-removed docs on GET — **OFFICIAL_DOCUMENTATION** |
| eFolder history | `GET .../histories/eFolder` — **OFFICIAL_DOCUMENTATION** |

## Relationships

Document ↔ Condition n:m — **OFFICIAL_DOCUMENTATION** · [relationship-map.md](./relationship-map.md)

## API references

| Operation | Path |
|-----------|------|
| List documents | `GET /encompass/v3/loans/{id}/documents` — **OFFICIAL_DOCUMENTATION** |
| Attachments | `/encompass/v3/loans/{id}/attachments` — **OFFICIAL_DOCUMENTATION** |
| Opening order | `POST .../documentOrders/opening` — **OFFICIAL_DOCUMENTATION** |
| Delivery | `POST .../documentOrders/opening/{id}/delivery` — **OFFICIAL_DOCUMENTATION** |

Files: [02-apis/document-api.md](../02-apis/document-api.md) · [02-apis/document-order-api.md](../02-apis/document-order-api.md) · [02-apis/document-delivery-api.md](../02-apis/document-delivery-api.md)

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** Paystubs document with two PDF attachments.

## Production notes

- V1 attachment sunset **VERSION_DEPENDENT** 26.3
- Store metadata only in dashboard — **INTERNAL_ARCHITECTURE_RECOMMENDATION**
- Webhook `documentStatusUpdates` for status history — **OFFICIAL_DOCUMENTATION**

## Common mistakes

- Storing attachment bytes in operational DB — **INTERNAL_ARCHITECTURE_RECOMMENDATION** avoid

## FAQ

**Q: Document vs attachment comment?** Comments on **document** — **OFFICIAL_DOCUMENTATION**.

## Related documents

- [document-map.md](./document-map.md) · [03-loan-communications/document-comments.md](../03-loan-communications/document-comments.md) · [disclosure in loan-map](./loan-map.md)

## Source references

- [Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1) — Last verified 2026-08-13
