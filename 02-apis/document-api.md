# eFolder Document API

## Business Purpose

Manage eFolder **document** records — logical containers tracking loan document status, comments, role access, and attachment assignments.

## Mortgage Use Case

Sarah creates "Paystubs" document on John Smith loan; underwriter links it to paystub condition; closer adds comment "Signature page unreadable."

## Official Documentation

- [Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1)
- [V3 Get List of Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents)
- [Create Document](https://developer.icemortgagetechnology.com/developer-connect/reference/create-document)
- [Update Document](https://developer.icemortgagetechnology.com/developer-connect/reference/update-document)

## API Version

**V3** (primary) | **V1** (legacy)

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| List documents | GET | `/encompass/v3/loans/{loanId}/documents` |
| Manage documents | PATCH | `/encompass/v3/loans/{loanId}/documents` |
| Create document | POST | `/encompass/v3/loans/{loanId}/documents` |
| Get document | GET | `/encompass/v3/loans/{loanId}/documents/{documentId}` |
| Update document | PATCH | `/encompass/v3/loans/{loanId}/documents/{documentId}` |
| Document attachments | GET/PATCH | `/encompass/v3/loans/{loanId}/documents/{documentId}/attachments` |
| eFolder history | GET | `/encompass/v3/loans/{loanId}/histories/eFolder` |
| Document groups (settings) | GET | `/encompass/v3/settings/eFolder/documentGroups` |

## Authentication

Bearer OAuth2.

## GET List of Documents

### Query Parameters (documented)

| Parameter | Description |
|-----------|-------------|
| `view` | `summary`, `detail` (default), `full` |
| `includeRemoved` | Include removed documents |
| `requireActiveAttachments` | Only docs with active attachments |

### Response includes (official)

- Document list
- Roles with access
- Comments on documents

## Field Reference

| Field | Type | Required | R/W | Meaning | Mortgage Significance | Configurable? | Example |
|-------|------|----------|-----|---------|----------------------|---------------|---------|
| `documentId` / `id` | string | — | R | Document GUID | API key; from create header | No | GUID |
| `title` | string | — | RW | Document name | eFolder label | No | "Paystubs" |
| `documentStatus` | string | — | RW | Status tracking | Received/reviewed | **LENDER CONFIGURABLE** | Per webhook samples |
| `status` | string | — | — | **Deprecated 26.1** | Use `documentStatus` | — | — |
| comments | array | — | R | Document comments | QC notes | No | — |

Exact contract fields: per OpenAPI on Get List of Documents reference page.

## Relationships

Document → Attachments (1:n) | Document ↔ Conditions (n:m) | Document ≠ Attachment

## Lifecycle

Create container → assign attachments → status updates → may mark removed (`includeRemoved`)

## Errors

Per reference OpenAPI (`401` minimum documented).

## Pagination

None per loan.

## Webhooks

Loan `document` event:

- `createDocuments`, `updateDocuments`, `assignAttachmentsToDocument`, `documentStatusUpdates`

## Permissions

Role access returned in list — **LENDER CONFIGURABLE** eFolder setup.

## Locking

Inherits loan lock.

## Version Dependencies

`documentStatus` replaces `status` in **26.1**.

## Production Considerations

- Use `requireActiveAttachments=true` for "received docs only" views
- Document Order delivery creates containers automatically

## Common Developer Mistakes

- Using deprecated `status` attribute
- Confusing document with attachment file

## Real Loan Example

GET documents detail → locate Paystubs → read `documentStatus` for dashboard chip.

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompass/v3/loans/${LOAN_ID}/documents?view=detail" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- Do we sync document status from webhooks or poll?
- How do we model removed documents?
