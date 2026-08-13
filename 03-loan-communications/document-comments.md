# Document Comments & eFolder History

Annotations and audit for **eFolder documents** — logical containers, not attachment file bytes.

---

## Document comments API

### Read

```
GET /encompass/v3/loans/{loanId}/documents?view=detail|full
GET /encompass/v3/loans/{loanId}/documents/{documentId}
```

Official: response includes **comments on documents** when using `detail` or `full` view.

### Write

Document PATCH endpoints (collection or single document) — comment mutation shape per OpenAPI on [Update Document](https://developer.icemortgagetechnology.com/developer-connect/reference/update-document).

---

## Who writes / reads

| | |
|--|--|
| **Writes** | Users with eFolder document access for their role |
| **Reads** | Roles returned in document list (`rolesWithAccess` or equivalent) — **LENDER CONFIGURABLE** |

---

## What document comments mean

QC and review notes on a **document container** — missing pages, illegible signatures, wrong year on paystub, etc.

**Not the same as:**

| Object | Difference |
|--------|------------|
| Condition comment | About the requirement — not the PDF quality |
| Attachment | The file bytes — comments live on **document** |
| Conversation log | Loan-level call log — not tied to eFolder container |

---

## Editable / deletable / historical

| Property | Value |
|----------|-------|
| **Editable** | Yes — via document PATCH |
| **Per-comment delete** | **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** |
| **Historical** | Partial — rely on webhooks + eFolder history for audit |
| **Soft delete (document)** | Removed documents via `includeRemoved=true` |

Document `documentStatus` (26.1+, replaces deprecated `status`) tracks workflow state separately from comment text.

---

## Webhooks (official)

Loan resource `document` event subevents:

| Subevent | Timeline use |
|----------|--------------|
| `createDocuments` | `DOCUMENT_CREATED` |
| `updateDocuments` | `DOCUMENT_UPDATED`, `DOCUMENT_COMMENTED` (if comments changed) |
| `assignAttachmentsToDocument` | `DOCUMENT_ATTACHMENT_ASSIGNED` — **NORMALIZED INTERNAL** |
| `documentStatusUpdates` | `DOCUMENT_STATUS_CHANGED` — **NORMALIZED INTERNAL** |

Official `eventType` on notification: `document`.

---

## eFolder history API

```
GET /encompass/v3/loans/{loanId}/histories/eFolder
```

Broader **eFolder audit trail** — complements inline document comments and webhooks.

| | Document comments | eFolder history |
|--|-------------------|-----------------|
| Focus | User annotations | Platform audit |
| Typical user | Staff QC notes | System + user actions |
| Editable | Yes | **No** (audit read) |
| Webhook | document events | Partial overlap |

Use both for compliance-grade timeline — dedupe in normalization.

---

## Document assigned to condition

Happens on **condition** API, not document API:

```
PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}/documents
```

Timeline: `DOCUMENT_ASSIGNED_TO_CONDITION` with cross-links in `metadata.conditionId` and `metadata.documentId`.

---

## Attachment upload vs document created

| Event | API | Meaning |
|-------|-----|---------|
| Document container created | `POST .../documents` | eFolder folder exists |
| File uploaded | `POST .../attachments` | Bytes stored |
| Attachment assigned to document | `PATCH .../documents/{id}/attachments` | File linked to container |

Webhook: `attachment` **create** + `document` **assignAttachmentsToDocument**.

Timeline:

- **NORMALIZED INTERNAL EVENT TYPE** `DOCUMENT_CREATED`
- **NORMALIZED INTERNAL EVENT TYPE** `DOCUMENT_UPLOADED` (attachment create)
- **NORMALIZED INTERNAL EVENT TYPE** `DOCUMENT_ATTACHMENT_ASSIGNED`

---

## John Smith example

| Action | Timeline |
|--------|----------|
| Sarah creates "Paystubs" document | `DOCUMENT_CREATED` |
| Paystub PDF uploaded | `DOCUMENT_UPLOADED` |
| Robert comments "Signature page unreadable." | `DOCUMENT_COMMENTED` |
| Document linked to paystub condition | `DOCUMENT_ASSIGNED_TO_CONDITION` |
| Status → Reviewed | `DOCUMENT_STATUS_CHANGED` |

---

## PII considerations

Document titles and comments may reference borrower financial data. Attachment files contain **PII** — timeline should index comment text and metadata, not store file bytes in event stream.

---

## References

- [02-apis/document-api.md](../02-apis/document-api.md)
- [02-apis/attachment-api.md](../02-apis/attachment-api.md)
- [01-domain/documents-efolder.md](../01-domain/documents-efolder.md)
