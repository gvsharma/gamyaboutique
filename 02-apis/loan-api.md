# Loan Management API

## Business Purpose

Create, read, update, and delete Encompass loan files; read/write loan data fields; access loan schema; manage loan folders and batch updates.

## Mortgage Use Case

John Smith's $400,000 purchase loan is created via `POST /encompass/v3/loans`, populated with borrower/property data, updated through processing, and read by the lending dashboard via `GET` with `view=entity`.

## Official Documentation

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [V3 Create Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/create-loan-1)
- [V3 Get Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1)
- [V3 Update Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/update-loan-1)
- [V3 Delete Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/delete-loan-1)
- [V3 Get Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1)
- [V3 Field Reader](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-field-reader)
- [V3 Field Writer](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-field-writer)

## API Version

**V3** (primary) | **V1** (legacy parity)

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| Create Loan | POST | `/encompass/v3/loans` |
| Get Loan | GET | `/encompass/v3/loans/{loanId}` |
| Update Loan | PATCH | `/encompass/v3/loans/{loanId}` |
| Delete Loan | DELETE | `/encompass/v3/loans/{loanId}` |
| Field Reader | POST | `/encompass/v3/loans/{loanId}/fieldReader` |
| Field Writer | POST | `/encompass/v3/loans/{loanId}/fieldWriter` |
| Audit Trail | POST | `/encompass/v3/loans/{loanId}/auditTrail` |
| Get Loan Schema | GET | `/encompass/v3/schemas/loan` |
| Get Field Schema | GET | `/encompass/v3/schemas/loan/standardFields` |
| Get Virtual Fields | GET | `/encompass/v3/schemas/loan/virtualFields` |
| Loan Folders | GET | `/encompass/v3/loanFolders` |
| V1 Create/Get/Update/Delete | POST/GET/PATCH/DELETE | `/encompass/v1/loans[/{loanId}]` |
| V1 Field Reader | POST | `/encompass/v1/loans/{loanId}/fieldReader` |
| Batch Update | POST | `/encompass/v1/loanBatch/updateRequests` |

Base URL: `https://api.elliemae.com`

## Authentication

`Authorization: Bearer <access_token>` — see [api-authentication.md](./api-authentication.md)

## V3 Get Loan

### Path Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `loanId` | Yes | Permanent loan GUID |

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `view` | No | `entity` (default data), `logs`, `full` (both) |
| `entities` | No | Comma-separated entity subset |
| `includeEmpty` | No | Include empty fixed-collection slots |
| `includeRemoved` | No | Include removed records |

### Response

`200 OK` — `LoanContract` body. Fields without persona permission are **not returned** (official usage note).

### Documented Errors

`400`, `401`, `403`, `404`, `500`

## V3 Create Loan

### Query Parameters (documented)

| Parameter | Required | Description |
|-----------|----------|-------------|
| `loanFolder` | Yes | Target pipeline folder |
| `view` | No | `entity`, `full`, `id`, `logs`; default 204 no body |
| `loId` | No | Loan Officer user ID at creation |
| `templateType` | No | Template type when applying template |
| `templatePath` | No | Template path (requires templateType) |
| `action` | No | e.g. `tpoRegister` |

### Response

`201 Created` — loan body with `id` (loanId)

### Documented Errors

`400`, `401`, `403`, `409`, `500`

## V3 Update Loan

### Query Parameters (documented)

| Parameter | Required | Description |
|-----------|----------|-------------|
| `lockId` | No | Lock ID for exclusive loan lock |
| `view` | No | Response view |
| `action` | No | TPO actions (`tpoSubmit`, `tpoRegister`, etc.) |
| `invalidFieldBehavior` | No | `Include`, `Exclude`, `Fail` |

### Request Body

`LoanContract` partial update per V3 schema.

## Field Reference (Get Loan — key top-level fields)

| Field | Type | Required | Read/Write | Meaning | Mortgage Significance | Configurable? | Example |
|-------|------|----------|------------|---------|----------------------|---------------|---------|
| `id` | string | — | Read | Loan GUID | Canonical integration key | No | GUID from create response |
| `loanNumber` | string | — | Read/Write | Lender loan number | Display ID in pipeline | **LENDER CONFIGURABLE** auto-number | Official live samples |
| `loanFolder` | string | — | Read/Write | Pipeline folder | Organization/workflow | **LENDER CONFIGURABLE** | — |
| `applications[]` | array | — | Read/Write | Borrower pairs | Borrower/co-borrower/property | — | See borrowers doc |
| `useEnhancedConditionIndicator` | boolean | — | Read/Write | Enhanced vs standard conditions | Determines condition API set | Loan/template | `true`/`false` |

Full schema: thousands of fields — use `GET /encompass/v3/schemas/loan`.

## Loan Entity Classification (V3)

| Type | Behavior |
|------|----------|
| Fixed collections | Pre-populated; cannot delete, only empty |
| Variable collections | Add/remove/reorder; dedicated endpoints incrementally |
| Editable logs | Conversation logs, AUS logs — `view=logs` |
| System logs | Milestone history, HTML email, lock logs — read-only |

## Relationships

- Parent of applications, milestones, conditions, documents, disclosure logs
- Referenced by workflow task `workEntity` and associations
- Webhook `resourceId` for Loan resource events

## Lifecycle

Create → entity updates via PATCH → logs accumulate → delete (permanent) or move to trash (`move` webhook)

## Pagination

Loan CRUD: none. Batch update: async job via `/encompass/v1/loanBatch/updateRequests`.

## Filtering

Field Reader: request specific field IDs. Loan Pipeline (separate API) for multi-loan search.

## Webhooks

Loan resource: `create`, `update`, `delete`, `move`, `change`, `fieldchange`, `enhancedfieldchange`, `lock`, `unlock`, `milestone`, `document`, `attachment`, `condition`, `disclosureTracking`, `submit`, `alertchange`

## Permissions

Persona-scoped field access on GET; API key from Super Administrator.

## Locking

`lockId` query on PATCH; Resource Lock APIs at `/encompass/v3/resourceLocks`.

## Version Dependencies

V3 recommended over V1 for new development. V1 Loan Contract differs — migration effort required.

## Configuration Dependencies

Loan folder, templates, custom fields — **LENDER CONFIGURABLE**.

## Production Considerations

- Avoid `view=full` except when logs required
- Always store immutable `loanId`
- Re-fetch after webhooks via `resourceRef`

## Common Developer Mistakes

- Confusing V1 and V3 loan contracts
- Assuming GET returns all fields regardless of persona
- Omitting `loanFolder` on create

## Real Loan Example

Mike creates John Smith loan → `POST /encompass/v3/loans?loanFolder=My%20Pipeline&view=entity` → response `id` stored as dashboard primary key.

## Java Example

```java
// Illustrative — uses documented endpoint and Bearer auth pattern
HttpRequest getLoan = HttpRequest.newBuilder()
    .uri(URI.create("https://api.elliemae.com/encompass/v3/loans/" + loanId + "?view=entity"))
    .header("Authorization", "Bearer " + accessToken)
    .GET()
    .build();
HttpResponse<String> response = HttpClient.newHttpClient().send(getLoan, HttpResponse.BodyHandlers.ofString());
```

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompass/v3/loans/${LOAN_ID}?view=entity" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

## Questions an Architect Should Ask

- V3-only or dual V1/V3 during migration?
- Which `entities` subset minimizes payload for our dashboard?
- Do we use Field Reader/Writer or full PATCH for field updates?
- How do we model fixed vs variable collections in our DB?
