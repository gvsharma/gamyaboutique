# 09 — Documents, eFolder, and Attachments

> **Official source:** [Manage Documents (eFolder)](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1) · [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions) · [Document Tips and Tricks](https://developer.icemortgagetechnology.com/developer-connect/docs/document-tips-and-tricks) · [Loan Document Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)

**Recommended API version:** V3 for documents and attachments (backward compatible; required for cloud-hosted attachments)

---

## Core mental model — three layers

```
eFolder (loan document cabinet)
  └── Document (placeholder / folder — tracks status in pipeline)
        └── Attachment(s) (actual file(s) — PDF, image, etc.)
```

| Layer | What it is | Analogy |
|-------|------------|---------|
| **eFolder** | Loan's electronic document container | File cabinet for the loan |
| **Document** | Named placeholder tracking a document type's status | Manila folder with a label |
| **Attachment** | Binary file linked to zero or one document | Papers inside the folder |

A **document can have multiple attachments**. An **attachment** can be assigned to a document (and via conditions, linked to evidence requirements).

---

## eFolder document

Per [Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1):

- Entry in the eFolder tracking loan document status as the loan moves through the pipeline
- Like a file folder containing and tracking files for a particular loan document
- Each document has a unique **documentId** (returned on create and in list APIs)

**Primary list endpoint:**

```http
GET /encompass/v3/loans/{loanId}/documents
```

V1 and V3 document APIs can be used simultaneously; workflow does not break when mixed.

---

## Attachments

Physical files stored in media server or cloud storage (SkyDrive).

**List attachments:**

```http
GET /encompass/v3/loans/{loanId}/attachments
```

**Upload (cloud-hosted — required path):**

```http
POST /encompass/v3/loans/{loanId}/attachmentUploadUrl
```

**Download (cloud + legacy):**

```http
POST /encompass/v3/loans/{loanId}/attachmentDownloadUrl
```

**Export multi-page images:**

```http
POST /efolder/v1/exportjobs
```

Per [Document Tips and Tricks](https://developer.icemortgagetechnology.com/developer-connect/docs/document-tips-and-tricks): V3 Create Attachment URL is the only upload API supporting cloud-hosted customers.

---

## Condition ↔ document (many-to-many)

From [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions):

> Multiple documents can be assigned to a condition. **A document can be assigned to more than one condition.**

Enhanced conditions API ([V3 Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-documents)):

```http
PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}/documents?action=add
```

> Documents are used as evidence to satisfy one or more conditions and **can be applied to multiple conditions**.

**John Smith example (illustrative):**

One PDF attachment "JohnSmith_Paystub.pdf" assigned to document placeholder **Income - Paystubs** may satisfy both:

- Enhanced condition "Verify income"
- Enhanced condition "Employment documentation"

Removing assignment from one condition does not delete the document or attachment from the eFolder.

---

## Document status — documented vs illustrative

### Documented API / webhook states

Official **webhook sample** for loan `document` event shows `documentStatusUpdates` with:

```json
"selectedStatuses": [
  {
    "status": "received",
    "lastModifiedAt": "2024-11-20T04:44:07Z",
    "lastUpdateBy": "admin",
    "currentStatus": true
  }
]
```

This is **documented** in [Loan Resource Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) sample payload—not an exhaustive enum in the webhook catalog.

**Condition webhook** samples show status values like `"Requested"` in `updateStatusTrackingInConditions`.

### Illustrative lifecycle (not a guaranteed API enum)

Lenders often configure document tracking statuses in Encompass UI (e.g. Requested → Received → Reviewed → Approved). **Do not assume** a fixed global list like `received|requested|reviewed` unless validated against your lender's Enhanced Condition / document settings APIs.

| Source | What it tells you |
|--------|-------------------|
| Webhook `documentStatusUpdates` | Status changed in a transaction; includes `status` string from event |
| Webhook `selectedStatuses` | Current status flags with `currentStatus: true` |
| Document GET APIs | Full document contract for the loan |
| Enhanced condition settings | Lender-configured status lists |

**Rule:** Treat webhook `status` values as **instance data**; store and display them; do not hardcode lifecycle enums in integration code.

---

## Webhooks — document and attachment events

Loan resource events ([wbhks-re-cat-loan](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)):

### `document` event (API)

| Subevent | Description |
|----------|-------------|
| `createDocuments` | Loan document created |
| `updateDocuments` | Loan document updated |
| `assignAttachmentsToDocument` | Attachment assigned to document |
| `documentStatusUpdates` | Document status changed (see sample with `received`) |

**eventType:** `document`

**resourceRef example:** `/encompass/v3/loans/{loanId}/document`

### `attachment` event (API)

| Subevent | Description |
|----------|-------------|
| `attachmentCreated` | Attachment created |

**eventType:** `attachment`

**Sample:**

```json
{
  "eventType": "attachment",
  "meta": {
    "resourceRef": "/encompass/v3/loans/{loanId}/attachments",
    "payload": {
      "event": {
        "attachmentCreated": [
          {
            "id": "EBSP23444.pdf",
            "title": "First Attachment"
          }
        ]
      }
    }
  }
}
```

### Enhanced condition events (document-related)

`condition` event subevents include `assignDocument`, `assignDocumentsToConditions`, `documentStatusUpdates`—cross-reference [04-conditions-standard.md](./04-conditions-standard.md) / [05-conditions-enhanced.md](./05-conditions-enhanced.md) if present in KB.

---

## John Smith — eFolder examples

| Document placeholder | Attachment(s) | Condition link |
|---------------------|---------------|----------------|
| Income - Paystubs | `Paystub_Jan.pdf`, `Paystub_Feb.pdf` | Verify income |
| Appraisal | `Appraisal_Report.pdf` | Property valuation |
| Title Commitment | `ABC_Title_Commitment.pdf` | Title clearance |
| Bank Statements | `Chase_Stmt.pdf` | Asset verification |

**Sarah uploads appraisal** (XYZ Appraisal vendor):

1. `POST .../attachmentUploadUrl` → upload to cloud URL
2. Webhook: `attachment` / `attachmentCreated`
3. `PATCH` or document API assigns attachment to **Appraisal** document
4. Webhook: `document` / `assignAttachmentsToDocument`
5. Sarah sets status → webhook `documentStatusUpdates` with `status: "received"` (if configured)

---

## V1 vs V3 guidance

| Concern | Recommendation |
|---------|----------------|
| New integrations | V3 for attachments (cloud support) |
| Legacy media server | V3 download URL still recommended |
| Documents | V1 or V3; IDs interoperable |
| Attachment type limitations | Some V1 attachment APIs may not work for all types—use V3 equivalent |

---

## Production integration concerns

1. **Cloud vs legacy storage** — Route all upload/download through V3 URL APIs; do not assume file paths on lender network.
2. **Many-to-many indexing** — Model `condition_id ↔ document_id` as many-to-many; attachment deduplication by `attachmentId`.
3. **Webhook payload ≠ full document** — Use `resourceRef` + GET document/attachment for authoritative state.
4. **Status strings** — Store lender-specific status values from webhooks/API; avoid hardcoded enums.
5. **Idempotency** — `attachmentCreated` and `assignAttachmentsToDocument` may arrive in quick succession; order not guaranteed.
6. **Large files** — Use upload URL flow; avoid embedding binaries in loan PATCH payloads.
7. **eSign metadata** — Original-format download via `attachmentDownloadUrl` when retaining eSign/OCR metadata ([Document Tips and Tricks](https://developer.icemortgagetechnology.com/developer-connect/docs/document-tips-and-tricks)).
8. **Lock requirements** — Some document/condition mutations require `lockId` when loan is locked.

---

## Related files

| File | Topic |
|------|-------|
| [10-document-orders-delivery-disclosures.md](./10-document-orders-delivery-disclosures.md) | Document orders create eFolder containers |
| [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) | Condition-document assignment |
| [11-conversation-logs-notes-comments.md](./11-conversation-logs-notes-comments.md) | Comments vs document status |
