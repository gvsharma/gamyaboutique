# eFolder Attachment API

## Business Purpose

Upload, download, list, and manage electronic **files** (attachments) in the loan eFolder; assign attachments to documents.

## Mortgage Use Case

Paystub.pdf and Paystub2.pdf uploaded to John Smith loan, assigned to "Paystubs" document container.

## Official Documentation

- [Manage Attachments](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-attachment-1)
- [V3 Get List of Attachments](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-attachments)
- [Using Cloud Storage APIs](https://developer.icemortgagetechnology.com/developer-connect/docs/using-cloud-storage-apis-for-loan-attachments)

## API Version

**V3** (required for new development) | **V1** (sunset **26.3** for many attachment operations)

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| List attachments | GET | `/encompass/v3/loans/{loanId}/attachments` |
| Manage attachments | PATCH | `/encompass/v3/loans/{loanId}/attachments` |
| Get attachment | GET | `/encompass/v3/loans/{loanId}/attachments/{attachmentId}` |
| Upload URL | POST | `/encompass/v3/loans/{loanId}/attachmentUploadUrl` |
| Download URL | POST | `/encompass/v3/loans/{loanId}/attachmentDownloadUrl` |
| V1 list/get | GET | `/encompass/v1/loans/{loanId}/attachments[/{attachmentId}]` |
| Export jobs | POST/GET | `/efolder/v1/exportjobs`, `/efolder/v1/exportjobs/{jobId}` |

## Authentication

Bearer OAuth2.

## Business Rules (Official)

- Attachment assigned to **one document at a time**
- Document may have **multiple attachments**
- Attachment may be unassigned and reassigned
- `attachmentId` from create response header or GET list
- API creatable type: **native-format** files (e.g. PDF, DOC)
- Supported types include: txt, pdf, doc/docx, tif, jpg/jpeg, emf, xps, html (Encompass only)

## Upload Flow (Official Pattern)

1. `POST .../attachmentUploadUrl` — obtain upload URL
2. PUT file to returned URL (cloud storage)
3. Assign to document via document attachments API or manage attachments

## Field Reference

| Field | Type | R/W | Meaning | Mortgage Significance |
|-------|------|-----|---------|----------------------|
| `attachmentId` / `id` | string | R | File identifier | Storage key |
| `title` | string | RW | File name | Paystub.pdf |

Additional fields per Get Attachment OpenAPI.

## Relationships

Attachment → Document (n:1) | Attachment → Condition (via document assignment)

## Lifecycle

Create/upload → assign to document → download/review → reassign or remove

## Errors

V1 sunset endpoints may fail for cloud-stored attachments — use V3.

## Pagination

List attachments: check reference for `start`/`limit` if added in recent releases — **NOT ESTABLISHED** in overview pages.

## Webhooks

Loan `attachment` event: `attachmentCreated` with id, title.

## Permissions

eFolder persona — **LENDER CONFIGURABLE**.

## Locking

Inherits loan lock.

## Version Dependencies

**V1 eFolder Attachment API sunset 26.3** — migrate to V3.

## Production Considerations

- V3 works with media server and cloud storage transparently
- Store attachmentId; regenerate download URLs (may expire)

## Common Developer Mistakes

- Using V1 upload for cloud attachments
- Assigning same attachment to two documents simultaneously

## Real Loan Example

POST attachmentUploadUrl → upload Paystub.pdf → PATCH assign to Paystubs document.

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompass/v3/loans/${LOAN_ID}/attachments" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- Where do we store files — mirror in our S3 or Encompass-only?
- Download URL TTL and refresh strategy?
