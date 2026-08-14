# Enhanced Conditions API (Loan Instance)

## Business Purpose

Retrieve, add, update, remove, and duplicate **Enhanced Conditions** on a loan; manage condition comments, tracking, and document assignments.

## Mortgage Use Case

Robert adds paystub condition on John Smith loan (Enhanced enabled): `PATCH /encompass/v3/loans/{loanId}/conditions` with action add; Sarah assigns Paystub.pdf via documents sub-resource.

## Official Documentation

- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)
- [V3 Get All Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-conditions)
- [V3 Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1)
- [V3 Evaluate Automated Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/evaluate-automated-conditions)

## API Version

**V3**

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| List conditions | GET | `/encompass/v3/loans/{loanId}/conditions` |
| Manage conditions | PATCH | `/encompass/v3/loans/{loanId}/conditions` |
| Get condition | GET | `/encompass/v3/loans/{loanId}/conditions/{conditionId}` |
| Comments | GET/PATCH | `/encompass/v3/loans/{loanId}/conditions/{conditionId}/comments` |
| Documents | GET/PATCH | `/encompass/v3/loans/{loanId}/conditions/{conditionId}/documents` |
| Tracking | GET/PATCH | `/encompass/v3/loans/{loanId}/conditions/{conditionId}/tracking` |
| Automated evaluator | POST | `/encompass/v3/calculators/automatedConditions` |

## Authentication

Bearer OAuth2.

## GET All Enhanced Conditions

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `conditionType` | Filter by type |
| `view` | `Summary`, `Detail`, `Full` |
| `includeRemoved` | Include removed conditions |

### View levels (official)

| View | Returns |
|------|---------|
| Summary | Summary only |
| Detail | Summary + tracking + definitions |
| Full | Detail + comments |

## PATCH Manage Enhanced Conditions

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| `lockId` | Loan lock ID |

### Usage Notes (Official)

- `add` — Condition Sets, Template List, or ad hoc conditions
- `duplicate` — requires `allowDuplicate` on template; copies all except trackingEntries, comments, assignedTo
- Template apply: matching `title` + `conditionType` in payload
- Loan-level `title` is **Retrieve-Only**

## Field Reference (EnhancedConditionContract — documented)

| Field | Type | Required | R/W | Meaning | Mortgage Significance | Configurable? | Example |
|-------|------|----------|-----|---------|----------------------|---------------|---------|
| `id` | string | — | RW | Condition GUID | Primary key | No | GUID |
| `conditionType` | string | — | R | Type from template | UW/Prelim/Post-Close | **LENDER CONFIGURABLE** | "Underwriting" |
| `title` | string | — | R* | Condition name | Display | Template | *Retrieve-only at loan level |
| `internalDescription` | string | — | RW | Staff description | Processor instructions | Template | — |
| `externalDescription` | string | — | RW | TPO/borrower text | External portals | Template | — |
| `category` | string | — | RW | Income, Assets, etc. | Reporting | **LENDER CONFIGURABLE** | "Income" |
| `priorTo` | string | — | RW | Clear by milestone gate | Approval, Docs, Funding | **LENDER CONFIGURABLE** | "Approval" |
| `requestedFrom` | string | — | RW | Who provides | "Borrower" | — | "Borrower" |
| `recipient` | string | — | RW | Condition recipient | Investor rules | **LENDER CONFIGURABLE** | — |
| `daysToReceive` | integer | — | RW | Expected turnaround | SLA | Template | 3 |
| `status` | string | — | R | Current status | Dashboard | **LENDER CONFIGURABLE** | "Requested" |
| `statusDate` | datetime | — | R | Status timestamp | Aging | No | GMT |
| `statusOpen` | boolean | — | R | Open vs satisfied | Pipeline | No | — |
| `assignedTo[]` | EntityRef[] | — | RW | **Documents** assigned | Evidence link | No | Document IDs |
| `owner` | EntityRef | — | RW | Clearance owner | Workload | No | User/Role |
| `tracking[]` | array | — | RW | Status checkpoints | Audit trail | **LENDER CONFIGURABLE** | — |
| `comments[]` | LogComment | — | RW | Annotations | "Need donor statement." | No | — |
| `isRemoved` | boolean | — | RW | Soft delete | History | No | — |
| `sourceOfCondition` | string | — | R | Creation source | DUFindings, Manual, etc. | No | "Manual" |
| `definitions` | object | — | RW | Valid options | UI dropdowns | Settings | — |

Beta (official warning — not production-ready): `verifications[]`, `borrowers[]`

## Relationships

Condition → Documents (assignedTo) → Attachments | Condition → Application (borrower pair)

## Lifecycle

Add (manual/template/set/automated) → Requested → documents assigned → tracking updated → satisfied/removed

## Errors

Automated evaluator: `400`, `403` documented.

## Pagination

None per loan.

## Webhooks

Loan `condition` event subevents: create, update, assign, assignDocument, remove, comment, status change.

Enhanced Conditions webhook category also documented separately.

## Permissions

Settings define role-based actions on templates — **LENDER CONFIGURABLE**.

## Locking

`lockId` on manage PATCH.

## Version Dependencies

Encompass **20.2+**; loan `useEnhancedConditionIndicator = true`.

## Configuration Dependencies

Condition types, sets, templates in settings APIs.

## Production Considerations

- Use `view=Full` only when comments needed
- `includeRemoved=true` for audit views
- Run automated evaluator before bulk apply

## Common Developer Mistakes

- Editing loan-level `title`
- Duplicating without `allowDuplicate` on template
- Confusing `assignedTo` documents with attachments directly

## Real Loan Example

GET conditions Detail view → find paystub condition → PATCH tracking with `isChecked: true` for "Received".

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompass/v3/loans/${LOAN_ID}/conditions?view=Detail" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- Summary vs Detail vs Full for dashboard sync?
- How do we handle soft-removed conditions in reporting?
- Automated rules vs manual adds — single workflow?
