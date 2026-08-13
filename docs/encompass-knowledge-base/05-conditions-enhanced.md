# 05 — Enhanced Conditions (Deep Dive)

> **Primary source:** [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions) · [V3 Manage Enhanced Conditions OpenAPI](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1)  
> **Related:** [04-conditions-standard.md](./04-conditions-standard.md) · [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) · [02-loan-domain.md](./02-loan-domain.md)

---

## A. Purpose

Enhanced Conditions (introduced Encompass 20.2) provide lender-configurable condition management at the condition and field level, with cross-loan reporting. This is the deepest reference in the knowledge base for the `EnhancedConditionContract`, V3 condition endpoints, views, and Settings APIs.

---

## B. Prerequisites

| Requirement | Detail |
|-------------|--------|
| Encompass version | 20.2+ for Enhanced Conditions feature |
| Loan indicator | `loan.useEnhancedConditionIndicator = true` |
| Field ID | `ENHANCEDCOND.X1` |
| Setup guide | "Working with Enhanced Conditions: Setup and User Guide" (Encompass Resource Center — requires access) |

Per [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions):

> If the attribute is set to true, then the loan uses Enhanced Conditions. If set to false, Standard Conditions are used in the loan, for which separate APIs are available.

---

## C. API sets overview

Encompass Developer Connect provides **three API sets** for Enhanced Conditions:

| Set | Purpose | Base paths |
|-----|---------|------------|
| **Managing Enhanced Conditions** | CRUD on loan conditions; comments; document assign/unassign | `/encompass/v3/loans/{loanId}/conditions` |
| **Enhanced Conditions Settings** | Types, sets, templates; role-based actions | `/encompass/v3/settings/loan/conditions/*` |
| **Automated Conditions Evaluator** | Evaluate business rules → applicable templates | `POST /encompass/v3/calculators/automatedConditions` |

---

## D. Loan-level endpoints

### GET — list conditions

```
GET /encompass/v3/loans/{loanId}/conditions
```

Per [V3 Get All Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-conditions):

| Parameter | Description |
|-----------|-------------|
| `conditionType` | Filter by condition type |
| `view` | `Summary` · `Detail` · `Full` |
| `includeRemoved` | Include removed conditions |

### GET — single condition

```
GET /encompass/v3/loans/{loanId}/conditions/{conditionId}
```

| Parameter | Description |
|-----------|-------------|
| `view` | `Summary` · `Detail` · `Full` |

### PATCH — manage conditions

```
PATCH /encompass/v3/loans/{loanId}/conditions
```

Per [V3 Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1):

| Parameter | Values |
|-----------|--------|
| `action` | `Add` · `Update` · `Duplicate` · `Remove` |
| `view` | `Summary` · `Detail` · `Full` · `id` |
| `lockId` | Loan lock identifier |

**Usage notes (documented):**
- `Add` can add Condition Sets, Condition Templates List, or adhoc enhanced conditions
- Template match: provide `title` + `conditionType` — if they match a configured template, template is applied
- At loan-level, **`title` is Retrieve-Only** and cannot be edited
- `Duplicate`: requires `allowDuplicate` on template, provide `conditionID`; copies everything **except** `trackingEntries`, `comments`, `assignedTo`

---

## E. Views — Summary, Detail, Full

| View | Returns |
|------|---------|
| **Summary** | Summary of the enhanced condition |
| **Detail** | Summary + **tracking** + **definitions** |
| **Full** | Summary + tracking + definitions + **comments** |

Use `view=Full` when you need comment threads. Use `view=Summary` for pipeline lists. Use `view=Detail` for status/tracking without comment payload.

On PATCH responses, `view=id` returns only `{ "id": "<conditionId>" }`.

---

## F. EnhancedConditionContract — complete field reference

From official OpenAPI schema on [V3 Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1):

### Identity and type

| Field | Type | R/W | Description |
|-------|------|-----|-------------|
| `id` | string | R (on existing) | Unique condition identifier (GUID). Required for Update/Remove/Duplicate. |
| `conditionType` | string | **Read-only** | Type from template (e.g., Preliminary, Underwriting, Post-Closing) |
| `title` | string | **Retrieve-Only at loan level** | Condition name (e.g., "Income - Personal Tax Returns") |
| `internalId` | string | R/W | Internal ID for Encompass Web (alphanumeric, no special chars) |
| `internalDescription` | string | R/W | Internal description for Web users |
| `externalId` | string | R/W | External ID for TPO users (alphanumeric) |
| `externalDescription` | string | R/W | External description for TPO users |
| `externalPrintDate` | string | RetrieveOnly | Last external print date |
| `printDefinitions` | string[] | R/W | Print definition identifiers (e.g., `InternalPrint`, `ExternalPrint`) |
| `publishedDate` | string | RetrieveOnly | Date condition was published |

### Classification

| Field | Type | R/W | Description |
|-------|------|-----|-------------|
| `source` | string | R/W | Source system (e.g., "Fannie Mae", "Escrow") — values from settings |
| `application` | ApplicationReferenceContract | R/W | Borrower pair reference (`entityType: Application`) |
| `category` | string | R/W | Category (Assets, Credit, Income, Legal, Liability, Property, etc.) — settings-driven |
| `priorTo` | string | R/W | When condition must be cleared (Approval, Docs, Funding, Closing, Purchase) — settings-driven |
| `recipient` | string | R/W | Recipient (e.g., MERS, Investor) — settings-driven |
| `startDate` | string | R/W | Condition effective date |
| `endDate` | string | R/W | Condition no longer required date |
| `requestedFrom` | string | R/W | Person/entity condition is requested from |
| `daysToReceive` | integer | R/W | Expected days to receive |

### Status (read-only on loan)

| Field | Type | R/W | Description |
|-------|------|-----|-------------|
| `status` | string | **RetrieveOnly** | Current status name (e.g., "Requested") |
| `statusDate` | string | **RetrieveOnly** | When current status was applied (GMT) |
| `statusOpen` | boolean | **RetrieveOnly** | Whether condition is open or satisfied |
| `age` | integer | **RetrieveOnly** | Days open (ageStartDate → now or ageClosedDate) |
| `ageStartDate` | string | **RetrieveOnly** | Age calculation start |
| `ageClosedDate` | string | **RetrieveOnly** | Age calculation end (when closed/cleared) |

### Assignment and ownership

| Field | Type | R/W | Description |
|-------|------|-----|-------------|
| `assignedTo` | EntityReference[] | R/W | **Documents** assigned to the condition (`entityType: Document`) |
| `documentReceiptDate` | string | R/W | Date document was received |
| `owner` | EntityReference | R/W | User/role responsible for managing/clearing |
| `partner` | string | **RetrieveOnly** | Partner/third-party — settings-driven |

### Audit

| Field | Type | R/W | Description |
|-------|------|-----|-------------|
| `createdBy` | EntityReference | R/W | Creator |
| `createdDate` | string | R/W | Creation timestamp |
| `lastModifiedBy` | EntityReference | **RetrieveOnly** | Last modifier |
| `lastModifiedDate` | string | **RetrieveOnly** | Last modification timestamp |
| `isRemoved` | boolean | R/W | Whether condition was removed from loan |

### Tracking

| Field | Type | Description |
|-------|------|-------------|
| `tracking` | TrackingEntry[] | Status tracking events (see below) |
| `delegatedTrackingStatuses` | DelegatedTrackingStatus[] | Delegated statuses and roles (`action: Add/Remove`) |

#### TrackingEntryContractAttributes

| Field | Type | R/W | Description |
|-------|------|-----|-------------|
| `status` | string | R/W | Status name marked complete |
| `user` | EntityReference | RetrieveOnly | Who marked the status |
| `date` | string | RetrieveOnly | When status was marked |
| `isChecked` | string | **Required** | `true` = create tracking entry; `false` = remove. Default false. |

Documented tracking status examples from live data: **Requested, Re-requested, Fulfilled, Received, Reviewed, Rejected, Cleared, Waived** (open/closed flags per `trackingDefinitions`).

### Comments

| Field | Type | Description |
|-------|------|-------------|
| `comments` | LogComment[] | Comment thread (returned in `view=Full`) |
| `commentsCount` | string | RetrieveOnly — total comment count |

#### LogCommentContract

| Field | Type | R/W | Description |
|-------|------|-----|-------------|
| `id` | string | R/W | Unique comment ID |
| `comments` | string | R/W | Comment text |
| `forRole` | EntityReference | R/W | Role the comment is for |
| `addedDate` | string | RetrieveOnly | When added |
| `addedBy` | EntityReference | R/W | Who added |
| `reviewedDate` | string | RetrieveOnly | When reviewed |
| `reviewedBy` | EntityReference | RetrieveOnly | Who reviewed |
| `isExternal` | boolean | R/W | Whether shown externally |

### Definitions (returned in Detail/Full views)

| Field | Type | Description |
|-------|------|-------------|
| `definitions` | EnhancedConditionDefinitionContract | Valid options for category, priorTo, recipient, source, tracking |

Sub-objects: `categoryDefinitions[]`, `priorToDefinitions[]`, `recipientDefinitions[]`, `sourceDefinitions[]`, `trackingDefinitions[]` (each with `name`, and tracking adds `open` flag and `roles[]`).

### Source and automation

| Field | Type | R/W | Description |
|-------|------|-----|-------------|
| `sourceOfCondition` | string | **ReadOnly** | How condition was added |

Documented values: `User`, `Manual`, `ConditionList`, `AutomatedByUser`, `FHA`, `DUFindings`, `EarlyCheckFindings`, `LPAFindings`, `FHA Findings`, `LCLAFindings`, `Duplicate`, `InvestorDelivery` (S2S), `AutomatedByRule` (S2S), `PartnerConnect` (S2S). `Duplicate` set internally on `action=duplicate`.

### Beta fields (not production-ready)

| Field | Warning |
|-------|---------|
| `verifications` | **Beta — not ready for production use** |
| `borrowers` | **Beta — not ready for production use** |

---

## G. Settings APIs

Per [Loan Enhanced Conditions — Settings](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions):

### Enhanced Condition Types

**Base:** `/encompass/v3/settings/loan/conditions/types`

| API | Method | Purpose |
|-----|--------|---------|
| V3 Get All Enhanced Condition Types | `GET` | List all condition types |
| V3 Get an Enhanced Condition Type | `GET` | Get one type |
| V3 Manage Enhanced Condition Types | `PATCH` | Add, update, remove types |

### Enhanced Condition Sets

**Base:** `/encompass/v3/settings/loan/conditions/set`

| API | Method | Purpose |
|-----|--------|---------|
| V3 Get All Enhanced Condition Sets | `GET` | List all condition sets |
| V3 Get an Enhanced Condition Set | `GET` | Get one set |

### Enhanced Condition Templates

**Base:** `/encompass/v3/settings/loan/conditions/templates`

| API | Method | Purpose |
|-----|--------|---------|
| V3 Get All Enhanced Condition Templates | `GET` | List templates |
| V3 Get an Enhanced Condition Template | `GET` | Get one template |
| V3 Manage Enhanced Condition Templates | `PATCH` | Add, update, remove templates |

#### Template query parameters (documented)

| Parameter | Description |
|-----------|-------------|
| `activeOnly` | `true` = only active types |
| `context` | `Settings` (unfiltered) or `LoanConditions` (user-accessible) |
| `view` | `detail`, `full`, `summary` (default summary; no view → 204 No Content) |
| `conditionTypes` | Filter by type |
| `title` | Filter by template title |
| `start` / `limit` | Pagination (default limit 1000, max 10000; 6 MB response cap) |

Settings APIs define condition types, statuses, sources, recipients, Prior To values, and **which actions are permitted per template based on user role**.

---

## H. Automated Conditions Evaluator

```
POST /encompass/v3/calculators/automatedConditions?loanId={loanId}&userId={userId}
```

Evaluates Automated Enhanced Conditions Business Rules from Encompass Settings and returns condition templates applicable to the loan's current state. Request body: `LoanContract` (loan details).

---

## I. John Smith — Enhanced Condition operations

**Loan:** John Smith, $400K conventional, `useEnhancedConditionIndicator: true`

### Add via template match

```http
PATCH /encompass/v3/loans/{loanId}/conditions?action=Add&view=Detail
Authorization: Bearer <token>
Content-Type: application/json
```

> Illustrative payload based on documented contract.

```json
[
  {
    "conditionType": "underwriting",
    "title": "Income - Paystubs",
    "internalDescription": "Provide most recent two paystubs for John Smith",
    "externalDescription": "Please provide your two most recent paystubs",
    "source": "Borrowers",
    "category": "Income",
    "priorTo": "Approval",
    "recipient": "Investor",
    "requestedFrom": "Robert",
    "daysToReceive": 5,
    "application": {
      "entityId": "All",
      "entityType": "Application"
    },
    "tracking": [
      {
        "status": "Requested",
        "isChecked": true
      }
    ]
  }
]
```

### Update tracking to Received

```http
PATCH /encompass/v3/loans/{loanId}/conditions?action=Update&view=Detail
```

```json
[
  {
    "id": "{conditionId}",
    "tracking": [
      {
        "status": "Received",
        "isChecked": true
      }
    ],
    "documentReceiptDate": "2026-08-10"
  }
]
```

### Assign document

```json
[
  {
    "id": "{conditionId}",
    "assignedTo": [
      {
        "entityId": "{documentId}",
        "entityType": "Document"
      }
    ]
  }
]
```

### Remove

```http
PATCH /encompass/v3/loans/{loanId}/conditions?action=Remove
```

```json
[{ "id": "{conditionId}" }]
```

---

## J. Webhooks (Enhanced Condition settings)

Per [Enhanced Conditions webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions):

| Resource | Events |
|----------|--------|
| Enhanced Condition Template | Create, Update, Delete |
| Enhanced Condition Type | Create, Update, Delete |

> To enable Enhanced Conditions webhook events, submit a support ticket and subscribe via [Subscriptions API](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions).

Loan-level condition webhooks (`eventType: condition`) are documented under [Loan webhooks](./06-condition-lifecycle-and-comments.md#webhook-condition-subevents).

---

## K. Production concerns

| Concern | Detail |
|---------|--------|
| **Framework guard** | Never call Enhanced APIs when indicator is `false` |
| **Title immutability** | Cannot PATCH `title` at loan level — use correct template on Add |
| **Read-only status** | `status`, `statusDate`, `statusOpen` are RetrieveOnly — update via `tracking[]` |
| **Lock requirement** | Pass `lockId` when loan is exclusively locked |
| **Template pagination** | 6 MB response cap recalculates `limit` |
| **Beta fields** | Do not use `verifications` or `borrowers` in production |
| **Settings dependency** | Category/priorTo/recipient/source/tracking values are lender-specific — always read `definitions` |
| **Duplicate constraints** | `allowDuplicate` must be enabled on template |
| **S2S-only sourceOfCondition** | `InvestorDelivery`, `AutomatedByRule`, `PartnerConnect` are service-to-service only |

---

## L. Common mistakes

| Mistake | Fix |
|---------|-----|
| Setting `status` directly on PATCH | Use `tracking[]` with `isChecked: true` |
| Editing `title` after creation | Retrieve-Only at loan level — remove and re-add with correct template |
| Assuming tracking status names are universal | Read `definitions.trackingDefinitions` per loan/type |
| Using `view=Summary` when comments needed | Use `view=Full` |
| Omitting `isChecked` on tracking update | Required field; default is `false` (no entry created) |
| Assigning attachments instead of documents | `assignedTo` expects `entityType: Document` |
| Ignoring `lockId` on locked loans | Acquire lock first; pass `lockId` query param |
| Using beta `verifications`/`borrowers` | Not production-ready per OpenAPI warning |

---

## M. Cross-references

| Topic | File |
|-------|------|
| Standard Conditions | [04-conditions-standard.md](./04-conditions-standard.md) |
| Lifecycle, comments vs tracking | [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) |
| Loan indicator | [02-loan-domain.md](./02-loan-domain.md) |
| Application entity | [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md) |
| Domain overview | [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) |
