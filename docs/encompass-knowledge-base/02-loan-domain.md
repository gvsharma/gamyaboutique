# 02 — Loan Domain (V3 Loan Management API)

> **Primary source:** [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)  
> **Endpoints:** [V3 Get Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1) · [V3 Create Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/create-loan-1) · [V3 Update Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/update-loan-1)  
> **Related:** [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) · [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md)

---

## A. Purpose

The V3 Loan Management API is the primary interface for reading and writing loan data between your application and Encompass. Loans are also **created and deleted** through this API. This document covers `loanId`, views, entity taxonomy, EFC webhooks, and when to GET a loan after an event.

---

## B. Business meaning

Per [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management):

> A loan is made up of numerous data types and formats that describe the details of the loan such as borrower, subject property, loan type, etc. This API is used to read and write the values of these data elements between your application and Encompass.

The V3 loan contract is classified into **four entity types** (see Section F). Payload construction must follow the [V3 Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1).

---

## C. `loanId` — the immutable primary key

| Property | Detail |
|----------|--------|
| Format | 32-digit unique identifier (GUID) |
| Assignment | Assigned when the loan is **created** |
| Mutability | **Does not change** through the lifetime of the loan |
| Usage | Required path parameter for nearly all loan-scoped calls: `{loanId}` |
| On create | Returned in response body from `POST /encompass/v3/loans` |
| Manual lookup | Smart Client → right-click loan in pipeline → Properties → GUID |

**Example (documented format):** `547x8xx1-15xx-4fbx-8x23-x033121x1402`

For John Smith's $400K conventional loan, every subsequent API call — conditions, milestones, documents — uses this single `loanId`.

---

## D. Core endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/encompass/v3/loans/{loanId}` | Retrieve loan data |
| `POST` | `/encompass/v3/loans` | Create a new loan |
| `PATCH` | `/encompass/v3/loans/{loanId}` | Update an existing loan |

**Servers:**
- Production: `https://api.elliemae.com`
- UAT: `https://concept.api.elliemae.com`

**Authentication:** OAuth Bearer token (same flow as V1 per [Using V3 APIs](https://developer.icemortgagetechnology.com/developer-connect/docs/using-v3-apis)).

### GET query parameters (documented)

| Parameter | Description |
|-----------|-------------|
| `view` | `entity` · `log` · `full` · `id` (create/update only for `id`) |
| `includeEmpty` | `true` to include empty fields/objects (relevant for fixed collections) |
| `includeRemoved` | Include records removed from entities |
| `entities` | Comma-separated list of loan entities to retrieve |

---

## E. Loan views — `entity`, `log`, `full`, `id`

Per [About Loan Views](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management#about-loan-views):

| View | Returns | Recommended use |
|------|---------|-----------------|
| **`entity`** | Everything in the loan file **other than log entries** | Default for most integrations |
| **`log`** | **Only log entries** in the loan file | When you need AUS tracking, conversation logs, milestone history, etc. |
| **`full`** | Both loan content **and** log entries | Largest payload — **not recommended for general use** unless log detail is required |
| **`id`** | IDs of loan resources created or updated | **Only available on Create/Update** responses |

### View decision matrix

| Need | View |
|------|------|
| Borrower, property, loan terms | `entity` |
| Conversation logs, AUS tracking | `log` |
| Everything including system logs | `full` (use sparingly) |
| Just created resource IDs after PATCH | `id` (on write response) |

### Breaking change note (24.2+)

Per [Breaking Change Notices](https://developer.icemortgagetechnology.com/developer-connect/docs/breaking-change-notices), certain log entities that were incorrectly returned with `view=entity` are now returned **only** with `view=logs` or `view=full`. If your integration depended on log data in `view=entity`, migrate to `view=logs`.

---

## F. Four entity types on the V3 loan contract

Per [Loan Management — Manage Loan using V3 APIs](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management):

### 1. Fixed Collections

| Property | Detail |
|----------|--------|
| Size | Pre-populated with empty items at loan creation |
| IDs | Derived from entity fields and/or collection index |
| Delete | Items can never be truly removed — only **emptied** (non-id fields null/blank/zero) |
| Reorder | Not possible |
| Field IDs | Standard (non-repeatable) Encompass field IDs |
| CRUD via loan API | Create & Update Loan APIs |
| GET inclusion | `view=entity\|full` if populated; empty objects with `includeEmpty=true` |
| Examples | File Contacts, Fixed Assets, Custom Fields |

### 2. Variable Collections

| Property | Detail |
|----------|--------|
| Size | Variable; empty at loan creation |
| IDs | Auto-generated (typically GUIDs) |
| Delete/reorder | Supported |
| Field IDs | Repeatable/indexed field IDs |
| CRUD via loan API | Create on POST; update on PATCH; separate endpoints added incrementally |
| GET inclusion | `view=entity\|full` if present |
| Examples | VoDs, VoLs, VoEs |

**Three endpoint patterns for variable collections:**

| Location | Pattern |
|----------|---------|
| Directly under loan | `/encompass/v3/loans/{loanId}/{entityName}` |
| Under application | `/encompass/v3/loans/{loanId}/applications/{applicationId}/{entityName}` |
| Under applicant | `/encompass/v3/loans/{loanId}/applications/{applicationId}/{applicantType}/{entityName}` |

### 3. Editable Logs

| Property | Detail |
|----------|--------|
| Field IDs | Items defined **without** Encompass Field IDs |
| CRUD | Create on POST; update on PATCH; separate endpoints incrementally |
| GET inclusion | `view=logs\|full` if present |
| Examples | AUS Tracking Logs, Conversation Logs |

### 4. System Logs

| Property | Detail |
|----------|--------|
| Editability | **Cannot be edited** by any user |
| GET inclusion | `view=logs\|full` if present |
| Examples | Milestone History Log, HTML Email logs, Lock Action Logs |

See [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md) for JSON examples.

---

## G. V1 vs V3 — when to use V3

Per [V1 vs V3 Encompass APIs](https://developer.icemortgagetechnology.com/developer-connect/docs/v1-vs-v3-encompass-apis-whats-the-difference-1):

| Aspect | V1 | V3 |
|--------|----|----|
| Architecture | RESTful wrappers on legacy SOAP/WCF | True REST operations |
| Schema | Legacy contract | Industry-standard loan JSON schema + JSON paths |
| Recommendation | Migrate where V3 parity exists | **Best practice for new integrations** |
| New features | — | New `/encompass` APIs added to V3 only |
| Support | Both stable today; V1 will be deprecated over time where V3 parity exists | Preferred |

---

## H. Enhanced Field Change (EFC) webhook

### What it is

Per [Loan webhook catalog](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) and [EFC Features and Usage Notes](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes):

| Property | Detail |
|----------|--------|
| Event name | `enhancedfieldchange` |
| Trigger | Loan created or updated (Web or API); fires on save / successful API execution |
| Payload | Previous and new values for changed fields in both Encompass and V3 LoanModel |
| Scope | **All** loan-level field changes; field-level filters **not possible** |
| Feature flag | Requires feature flag enabled in Encompass instance |
| Virtual fields | Only trigger EFC when new loan file version created from update |
| Chunking | Large payloads split into multiple webhooks with `chunkId` |

### EFC payload structure (documented)

```json
{
  "eventType": "enhancedfieldchange",
  "meta": {
    "resourceType": "Loan",
    "resourceId": "<loanId>",
    "resourceRef": "/encompass/v3/loans/<loanId>/enhancedFieldChange",
    "payload": {
      "event": {
        "fieldChangeEvents": [
          {
            "modifiedField": "36#2",
            "parentFieldId": "36",
            "encompass": { "previousValue": "", "newValue": "John" },
            "v3LoanModel": { "newValue": "John" }
          }
        ]
      }
    }
  }
}
```

### EFC vs `fieldchange` vs `change`

| Event | Filtering | Payload |
|-------|-----------|---------|
| `enhancedfieldchange` | None — all field changes | Previous + new values for Encompass and V3 model |
| `fieldchange` | Subscriber specifies fields via subscription filters | Subject field + cascading updates |
| `change` | Subscriber specifies filter attributes | Specified attribute updates |

### EFC production guidance

Per [EFC Best Practices](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-best-practices):

- Limit to **1 webhook subscription per clientId**; route on client side
- Implement queue-based ingestion (payloads can be large)
- Exercise caution — payload includes **PII**
- Loan creation payload is **significantly larger** than subsequent updates

---

## I. When to GET loan after an event

Webhooks notify; they do not replace authoritative reads. Use this decision table:

| Event received | GET loan? | View | Rationale |
|----------------|-----------|------|-----------|
| `create` | Yes (if you need full file) | `entity` | Initial sync; EFC creation payload is very large but GET is authoritative |
| `update` / `change` / `fieldchange` | If you need fields not in payload | `entity` | Webhook may not include all changed data |
| `enhancedfieldchange` | Usually **no** for changed fields | — | Payload includes previous/new values; GET only if you need unrelated entities |
| `enhancedfieldchange` (chunked) | After reassembly, same as above | — | Must collect all chunks first |
| `milestone` | Optional | `entity` or milestone API | Payload includes milestone `id` and `title`; use `GET .../milestones/{milestoneId}` for detail |
| `condition` | Yes | — | Use `GET .../conditions` or `GET .../conditions/{conditionId}` (Enhanced) |
| `document` / `attachment` | Yes | — | Use document/attachment APIs; not full loan GET |
| `move` | Optional | `entity` | Folder change may affect pipeline view only |
| `lock` / `unlock` | Before write operations | — | Acquire lock before PATCH; don't rely solely on webhook timing |

**General rule:** Use `meta.resourceRef` from the webhook to determine the correct GET endpoint. For loan-wide reconciliation, `GET /encompass/v3/loans/{loanId}?view=entity` is the authoritative read.

---

## J. John Smith example — loan operations

### Create (illustrative)

> Illustrative payload based on documented contract. Field values are examples; resolve actual JSON paths via [V3 Get Field Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-field-schema-1).

```http
POST /encompass/v3/loans?view=id
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "applications": [
    {
      "borrower": {
        "firstName": "John",
        "lastName": "Smith"
      }
    }
  ],
  "baseLoanAmount": 400000,
  "property": {
    "loanPurposeType": "Purchase"
  },
  "loanAmortizationTermMonths": 360
}
```

Response includes `loanId` (GUID) and, with `view=id`, IDs of created resources.

### Update loan amount (PATCH)

```http
PATCH /encompass/v3/loans/{loanId}
```

Field ID `2` → `$.baseLoanAmount` per Field Schema live sample.

### Read loan for integration sync

```http
GET /encompass/v3/loans/{loanId}?view=entity
```

Avoid `view=full` unless conversation logs or milestone history are required.

---

## K. `useEnhancedConditionIndicator` on the loan

| Property | Value |
|----------|-------|
| Field ID | `ENHANCEDCOND.X1` |
| JSON path | `loan.useEnhancedConditionIndicator` |
| Type | `boolean` |
| `true` | Enhanced Conditions framework active |
| `false` | Standard Conditions framework active |

Per [26.1 release notes](https://developer.icemortgagetechnology.com/developer-connect/changelog/261-major-release): from 26.1, this attribute can be changed **only if no conditions (enhanced or standard) exist** in the loan.

Writable via `PATCH /encompass/v3/loans/{loanId}` on the loan contract.

---

## L. Production concerns

| Concern | Detail |
|---------|--------|
| **Payload size** | `view=full` is largest; use `entities` filter when supported |
| **includeEmpty** | Required to see empty fixed collection slots |
| **Lock before write** | Loan lock/unlock webhooks are not real-time; implement retry logic |
| **EFC volume** | All field changes → high event volume; plan queue capacity |
| **Multi-chunk EFC** | Must reassemble before processing |
| **Null vs empty** | Breaking changes have addressed null vs empty string behavior — review release notes |
| **Date formats** | `yyyy-MM-ddTHH:mm:ssZ` (datetime), `yyyy-MM-dd` (date) |
| **String field limits** | No absolute limit in architecture; compliance/form constraints may apply per field |

---

## M. Common mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Polling `view=full` on every change | Performance degradation, large payloads | Use `view=entity` + targeted GETs |
| Deleting fixed collection items | Not supported — only empty them | Set non-id fields to null/blank/zero |
| Assuming variable collection CRUD is only via loan PATCH | Separate entity endpoints exist | Check docs for `{entityName}` endpoints |
| Ignoring `includeEmpty` for fixed collections | Missing pre-populated slots | Pass `includeEmpty=true` |
| Processing EFC chunk 1 of N as complete | Incomplete field change set | Wait for all chunks via `chunkId` |
| Using V1 loan contract with V3 endpoints | Contract mismatch errors | Use V3 Loan Schema |
| PATCH without loan lock | Concurrent write conflicts | Acquire exclusive lock; handle lock webhooks |
| Reading system logs expecting editability | System logs are read-only | Use editable log APIs for conversation/AUS logs |

---

## Cross-references

| Topic | File |
|-------|------|
| Domain overview | [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) |
| Schema, field IDs, collections | [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md) |
| Conditions (loan-level indicator) | [05-conditions-enhanced.md](./05-conditions-enhanced.md) |
| Webhook event catalog | [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) |
