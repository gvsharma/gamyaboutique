# 06 — Condition Lifecycle, Comments, and Tracking

> **Primary source:** [Loan webhook catalog — Condition](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) · [V3 Manage Enhanced Conditions OpenAPI](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1) · [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions)  
> **Related:** [05-conditions-enhanced.md](./05-conditions-enhanced.md) · [04-conditions-standard.md](./04-conditions-standard.md) · [01-encompass-domain-overview.md](./01-encompass-domain-overview.md)

---

## A. Purpose

This document walks through a complete condition lifecycle using the example **"Provide most recent two paystubs"** on John Smith's $400K conventional loan. It clarifies how conditions relate to documents, attachments, tasks, and milestones — and how comments differ from tracking status.

---

## B. Object relationship model

```
LOAN (John Smith, $400K conventional)
 │
 ├── MILESTONE "Processing" ─── role: Processor (Sarah)
 │        └── (pipeline workflow step — NOT a condition)
 │
 ├── WORKFLOW TASK "Follow up on paystubs" ─── assignee: Sarah
 │        └── (Task Service unit of work — NOT a condition)
 │
 └── CONDITION "Provide most recent two paystubs"
       ├── TRACKING: Requested → Received → Reviewed → Cleared
       ├── COMMENTS: internal notes between roles
       └── DOCUMENT "Paystubs"
             └── ATTACHMENT "paystub_aug.pdf"
```

| Object | What it is | API domain |
|--------|-----------|------------|
| **Condition** | eFolder entry tracking a loan requirement | V3 `/conditions` (Enhanced) or V1 `/conditions/{type}` (Standard) |
| **Document** | eFolder document container (title, statuses) | Document APIs; webhook `document` subevents |
| **Attachment** | File within the eFolder (PDF, image) | Attachment APIs; webhook `attachment` subevent `attachmentCreated` |
| **Workflow Task** | Assignable work item in Task Service | `workflow/v1/tasks` |
| **Milestone** | Pipeline workflow step with role | `/encompass/v3/loans/{loanId}/milestones` |

Per [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions):

> Multiple documents can be assigned to a condition … A document can be assigned to more than one condition.

**documentation does not establish** a direct API link between Workflow Tasks and Conditions — they are separate domains linked only by business process on the same loan.

---

## C. Worked example — "Provide most recent two paystubs"

**Loan:** John Smith, $400K conventional purchase  
**Framework:** Enhanced Conditions (`useEnhancedConditionIndicator: true`)  
**Underwriter:** Robert  
**Processor:** Sarah

### Stage 1 — Condition created

Robert adds the condition during underwriting review.

```http
PATCH /encompass/v3/loans/{loanId}/conditions?action=Add&view=Detail
```

> Illustrative payload based on documented contract.

```json
[
  {
    "conditionType": "underwriting",
    "title": "Income - Paystubs",
    "internalDescription": "Provide most recent two paystubs for John Smith",
    "externalDescription": "Please provide your two most recent consecutive paystubs",
    "source": "Borrowers",
    "category": "Income",
    "priorTo": "Approval",
    "requestedFrom": "John Smith",
    "daysToReceive": 5,
    "application": { "entityId": "All", "entityType": "Application" },
    "tracking": [{ "status": "Requested", "isChecked": true }]
  }
]
```

**Result:** `status: "Requested"`, `statusOpen: true`, `sourceOfCondition: "User"`

**Webhook:** `eventType: "condition"` with `createConditions[]` subevent payload.

### Stage 2 — Processor task created (parallel track)

Sarah gets a Workflow Task to follow up — this is **separate** from the condition itself.

```http
POST /workflow/v1/tasks
```

> Illustrative payload based on documented contract.

```json
{
  "name": "Follow up on paystubs for John Smith",
  "type": "document_collection",
  "workEntity": {
    "entityId": "{loanId}",
    "entityType": "urn:elli:encompass:loan"
  },
  "assignee": "sarah.processor"
}
```

### Stage 3 — Borrower provides documents

John uploads paystubs. In the eFolder:

1. **Attachment** `paystub_july.pdf` created → webhook `attachment` / `attachmentCreated`
2. **Document** "Paystubs" created or updated → webhook `document` / `createDocuments` or `updateDocuments`
3. Attachment assigned to document → webhook `document` / `assignAttachmentsToDocument`

### Stage 4 — Document assigned to condition

```http
PATCH /encompass/v3/loans/{loanId}/conditions?action=Update
```

```json
[
  {
    "id": "{conditionId}",
    "assignedTo": [
      { "entityId": "{documentId}", "entityType": "Document" }
    ],
    "documentReceiptDate": "2026-08-10"
  }
]
```

**Webhook:** `assignDocumentsToConditions[]` subevent.

### Stage 5 — Tracking updated to Received

```http
PATCH /encompass/v3/loans/{loanId}/conditions?action=Update
```

```json
[
  {
    "id": "{conditionId}",
    "tracking": [{ "status": "Received", "isChecked": true }]
  }
]
```

**Webhook:** `updateStatusTrackingInConditions[]` subevent with `status: ["Requested"]` (prior state shown in sample).

### Stage 6 — Underwriter reviews and comments

Robert adds an internal comment:

```json
[
  {
    "id": "{conditionId}",
    "comments": [
      {
        "comments": "Paystubs received — YTD figures match VOE",
        "isExternal": false
      }
    ]
  }
]
```

Retrieve with `view=Full` or `GET .../conditions/{conditionId}?view=Full`.

**Webhook:** `addCommentsToConditions[]` subevent.

### Stage 7 — Tracking: Reviewed → Cleared

```json
[
  {
    "id": "{conditionId}",
    "tracking": [
      { "status": "Reviewed", "isChecked": true },
      { "status": "Cleared", "isChecked": true }
    ]
  }
]
```

**Result:** `statusOpen: false` (Cleared is a closed tracking definition per live data sample).

### Stage 8 — Milestone progression (independent)

When all underwriting conditions are cleared, Robert completes the *Submittal* milestone. This is a **milestone** operation, not a condition operation.

**Webhook:** `eventType: "milestone"` with `updateMilestones[]` or `finishMilestones[]`.

---

## D. Comments vs tracking

| Dimension | Tracking (`tracking[]`) | Comments (`comments[]`) |
|-----------|------------------------|------------------------|
| **Purpose** | Status progression (Requested → Received → Cleared) | Free-text communication between roles |
| **Drives `status` field** | Yes — marking tracking entries updates RetrieveOnly `status`/`statusDate`/`statusOpen` | No |
| **Structured** | Yes — status names from `trackingDefinitions` | No — free text |
| **External visibility** | Via tracking definition `open` flag and print definitions | `isExternal` boolean on each comment |
| **Audit** | `user`, `date` per tracking entry (RetrieveOnly) | `addedBy`, `addedDate`, `reviewedBy`, `reviewedDate` |
| **View required** | `Detail` or `Full` | `Full` (for comment array) |
| **Webhook subevent** | `updateStatusTrackingInConditions` | `addCommentsToConditions` |
| **Update mechanism** | `tracking[].isChecked: true` to add, `false` to remove | Add comment objects in PATCH payload |

**Rule of thumb:** Tracking = workflow state machine. Comments = conversation log.

---

## E. Condition vs document vs attachment

| Layer | Analogy | Created by | Linked to condition via |
|-------|---------|------------|------------------------|
| **Attachment** | The actual file (PDF) | Upload/scan APIs | Assigned to a Document first |
| **Document** | eFolder folder/tab | Document APIs | `assignedTo[]` on condition (`entityType: Document`) |
| **Condition** | The requirement being tracked | Condition APIs | Root object |

### Document webhook subevents (Loan resource)

Per [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan):

| Subevent | Trigger |
|----------|---------|
| `createDocuments` | Loan document created |
| `updateDocuments` | Loan document updated |
| `assignAttachmentsToDocument` | Attachment assigned to document |
| `documentStatusUpdates` | Document status changed (e.g., `received`) |

### Attachment webhook subevent

| Subevent | Trigger |
|----------|---------|
| `attachmentCreated` | Attachment created |

### Condition webhook subevents

| Subevent | Documented trigger |
|----------|-------------------|
| `createConditions` | Enhanced condition created |
| `updateStatusTrackingInConditions` | Tracking status changed |
| `assignDocumentsToConditions` | Document assigned to condition |
| `addCommentsToConditions` | Comment added |
| `documentStatusUpdates` | Document status update related to condition context |

---

## F. Webhook — condition subevents (official)

Per [Loan webhook catalog](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan):

> **condition** — When loan Enhanced Conditions are created. Subevents: **create, update, assign, assignDocument, remove, comment, status change**

**Support:** API only.

### Documented sample payload structure

```json
{
  "eventType": "condition",
  "meta": {
    "userId": "admin",
    "resourceType": "Loan",
    "resourceId": "{loanId}",
    "resourceRef": "/encompass/v3/loans/{loanId}/condition",
    "payload": {
      "event": {
        "createConditions": [
          { "id": "{conditionId}", "title": "...", "type": "..." }
        ],
        "updateStatusTrackingInConditions": [
          { "id": "{conditionId}", "title": "...", "type": "...", "status": ["Requested"] }
        ],
        "assignDocumentsToConditions": [
          {
            "id": "{conditionId}",
            "documents": [{ "id": "{documentId}", "title": "..." }]
          }
        ],
        "addCommentsToConditions": [
          {
            "id": "{conditionId}",
            "comments": [{ "commentId": "...", "isExternal": false }]
          }
        ],
        "documentStatusUpdates": [
          {
            "id": "{conditionId}",
            "documents": [{ "id": "...", "title": "..." }]
          }
        ]
      }
    }
  }
}
```

### Mapping subevent names to payload keys

| Documented subevent name | Payload key in sample |
|--------------------------|----------------------|
| create | `createConditions` |
| status change | `updateStatusTrackingInConditions` |
| assignDocument | `assignDocumentsToConditions` |
| comment | `addCommentsToConditions` |
| update | documentation does not establish a distinct payload key in the sample |
| assign | documentation does not establish a distinct payload key in the sample |
| remove | documentation does not establish a distinct payload key in the sample |

> The official docs list seven subevent names but the sample payload shows five event arrays. **documentation does not establish** the exact payload key names for `update`, `assign`, and `remove` subevents — implement reconciliation via `GET .../conditions/{conditionId}`.

---

## G. When to GET condition after webhook

| Webhook subevent | GET needed? | Endpoint |
|------------------|-------------|----------|
| `createConditions` | Yes (for full detail) | `GET .../conditions/{conditionId}?view=Detail` |
| `updateStatusTrackingInConditions` | If final status required | `GET .../conditions/{conditionId}?view=Detail` |
| `assignDocumentsToConditions` | If attachment detail needed | `GET` document APIs separately |
| `addCommentsToConditions` | If comment text needed | `GET .../conditions/{conditionId}?view=Full` |
| Any condition event | For reconciliation | `GET .../conditions?conditionType=underwriting` |

**Idempotency:** Use `eventId` from webhook to deduplicate processing.

---

## H. Condition vs task vs milestone — decision guide

| Question | Answer object |
|----------|---------------|
| "Has the borrower satisfied this underwriting requirement?" | **Condition** (tracking → Cleared) |
| "Has Sarah completed her follow-up action?" | **Workflow Task** (status → completed) |
| "Has the loan moved past processing stage?" | **Milestone** (done indicator / next milestone) |
| "Where is the paystub PDF stored?" | **Attachment** inside **Document** in eFolder |
| "Is the paystub linked to the requirement?" | **Condition** `assignedTo[]` → Document |

On John Smith's loan, all three workflow dimensions advance independently but in business sequence:

```
Milestone: Processing (active)
  → Task: Sarah follows up
    → Condition: Paystubs requested
      → Document + Attachment: files received
        → Condition tracking: Cleared
          → Milestone: Processing finished
```

---

## I. Standard Conditions lifecycle note

For `useEnhancedConditionIndicator: false`, the same business lifecycle applies but:

- APIs are V1 per condition type (see [04-conditions-standard.md](./04-conditions-standard.md))
- Status enum is fixed: Added, Expected, Requested, Received, Rerequested, Fulfilled, Reviewed, Sent, Cleared, Waived, Expired, Rejected
- **documentation does not establish** condition webhook subevents for Standard Conditions

---

## J. Production concerns

| Concern | Detail |
|---------|--------|
| **Webhook ≠ full state** | Payload contains IDs and titles; GET for authoritative tracking/comments |
| **Multi-document conditions** | One condition can have multiple documents; one document can serve multiple conditions |
| **External comments** | `isExternal: true` exposes to TPO — handle PII carefully |
| **Tracking order** | Status progression should follow lender's `trackingDefinitions` order |
| **Concurrent updates** | Use loan lock (`lockId`) for PATCH operations |
| **Event ordering** | Webhooks not guaranteed in order — use `eventTime` and reconcile |
| **documentStatusUpdates** | Appears in both `document` and `condition` webhook payloads — deduplicate |
| **Chunked EFC alternative** | If subscribed to `enhancedfieldchange`, condition field changes may also appear there |

---

## K. Common mistakes

| Mistake | Fix |
|---------|-----|
| Confusing task completion with condition clearance | Check condition `statusOpen` and tracking, not task status |
| Assigning attachment directly to condition | Assign to Document (`entityType: Document`); attachments go on documents |
| Expecting comment text in webhook | Sample shows `commentId` only — GET with `view=Full` for text |
| Using `view=Detail` expecting comments | Comments require `view=Full` |
| Assuming milestone finish clears conditions | Milestones and conditions are independent — clear conditions explicitly |
| Processing `create` webhook without storing `conditionId` | Extract `id` from `createConditions[]` payload |
| Ignoring `isExternal` on comments | Internal comments may contain underwriting notes not for borrowers |
| Single webhook handler for document and condition events | Separate subevent arrays — route by key name |

---

## L. Lifecycle state diagram (Enhanced)

```
                    ┌─────────────┐
                    │   CREATED   │
                    │ (action=Add)│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
              ┌─────│  REQUESTED  │─────┐
              │     └──────┬──────┘     │
              │            │            │
         comment     document      re-request
         added       assigned      (tracking)
              │            │            │
              │     ┌──────▼──────┐     │
              │     │  RECEIVED   │     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────▼──────┐     │
              │     │  REVIEWED   │     │
              │     └──────┬──────┘     │
              │            │            │
              │     ┌──────▼──────┐     │
              │     │   CLEARED   │     │
              │     │ statusOpen: │     │
              │     │   false     │     │
              │     └─────────────┘     │
              │                         │
              └─────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   REMOVED   │
                    │(action=Remove)│
                    │ isRemoved:  │
                    │   true      │
                    └─────────────┘
```

Tracking status names are **lender-configurable** via Enhanced Conditions Settings. The diagram uses documented examples from live data samples.

---

## M. Cross-references

| Topic | File |
|-------|------|
| EnhancedConditionContract fields | [05-conditions-enhanced.md](./05-conditions-enhanced.md) |
| Standard Conditions | [04-conditions-standard.md](./04-conditions-standard.md) |
| Loan domain & EFC | [02-loan-domain.md](./02-loan-domain.md) |
| Domain overview | [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) |
| Loan webhooks (full catalog) | [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) |
