# Comment & Activity Source Matrix

Maps every timeline-relevant information type to its **official Encompass Developer Connect** source. Use this matrix when designing ingestion jobs and answering "where does this come from?"

**Legend**

| Column value | Meaning |
|--------------|---------|
| Yes / No | Verified from official documentation |
| Partial | Some aspects available; see Notes |
| Via webhook | No dedicated REST list; delivered as webhook + GET reconcile |
| **NOT ESTABLISHED** | Not confirmed in official docs reviewed |

---

## Master matrix

| Information Type | Encompass Object | API | API Version | Endpoint | Included in Loan GET? | Separate API? | Timestamp? | Actor? | Comment? | History? | Webhook? | Pagination? | Soft Delete? | Editable? | PII? | Notes |
|------------------|------------------|-----|-------------|----------|----------------------|---------------|------------|--------|----------|----------|----------|-------------|--------------|-----------|------|-------|
| **Loan created** | Loan | Loan Management | V3 | `POST /encompass/v3/loans` | No | Yes | Yes (`eventTime`) | Yes (`meta.userId`) | No | Yes (event) | Yes (`create`) | No | No | N/A | Partial (borrower in entity) | Official Loan webhook `create` |
| **Loan updated** | Loan | Loan Management | V3 | `GET/PATCH /encompass/v3/loans/{loanId}` | Partial (`view=entity`) | Yes | Yes | Yes | No | Via webhooks | Yes (`update`) | No | Trash via `move` | Yes (entity fields) | Partial | Broad catch-all; pair with specific subscriptions |
| **Loan moved / trashed** | Loan | Loan Management | V3 | Move APIs / PATCH folder | Partial | Yes | Yes | Yes | No | Yes | Yes (`move`) | No | Yes (trash) | Yes | Partial | Soft delete to trash folder |
| **Loan permanently deleted** | Loan | Loan Management | V3 | Delete loan | No | Yes | Yes | Yes | No | Yes | Yes (`delete`) | No | No | N/A | Partial | Permanent removal |
| **Loan field change** | Loan field | Field Change / Audit | V3 + Webhook V1 | Webhook `fieldchange` / `enhancedfieldchange`; `POST .../auditTrail` | No | Yes | Yes | Yes (`meta.userId`) | No | Yes (audit) | Yes | Audit: `start`/`limit` | No | No (immutable event) | Often | EFC includes previous/new values |
| **Loan attribute change (JSON path)** | Loan entity path | Webhook | V1 | Webhook `change` with filters | No | Via webhook | Yes | Yes | No | Yes | Yes (`change`) | No | No | No | Often | Max 50 filter attributes |
| **Consumer Connect submit** | Loan | Webhook | V1 | — | No | Via webhook | Yes | Borrower context | No | Yes | Yes (`submit`) | No | No | N/A | Partial | Borrower-initiated |
| **Milestone started** | Milestone log | Associates & Milestones | V3 | `GET/PATCH .../milestones/{milestoneId}` | No | Yes | Yes (`startDate`) | Yes (associate) | Optional (`comments`) | Partial (current state) | Yes (`milestone` → `updateMilestones`) | No | No | Yes | Partial | History in Milestone History Log |
| **Milestone finished** | Milestone log | Associates & Milestones | V3 | `PATCH .../milestones/{milestoneId}` `doneIndicator` | No | Yes | Partial | Yes | Optional | Yes (system log) | Yes (`finishMilestones`) | No | No | Yes | Partial | System log append-only |
| **Milestone associate assigned** | Milestone log / LoanAssociate | Associates & Milestones | V3 | `PATCH .../milestones/{milestoneId}` | No | Yes | Yes | Yes | No | Yes (system log) | Yes (`updateMilestones`) | No | No | Yes | Partial | `loanAssociate` object |
| **Milestone comment (current)** | Milestone log | Associates & Milestones | V3 | `PATCH .../milestones/{milestoneId}` `comments` | No | Yes | Partial | Yes | Yes (string field) | Overwrites current | Yes (`milestone`) | No | No | Yes | Possible | Single string — not comment thread API |
| **Milestone history (transitions)** | Milestone History Log | Loan Management | V3 | `GET .../loans/{loanId}?view=logs\|full` | Yes (`view=logs`) | Optional dedicated GET | Yes | Partial | No | Yes (append-only) | Via `milestone` + logs sync | No | No | **No** | Partial | System log — not user editable |
| **Task created** | Workflow Task | Workflow Task | V1 | `POST /workflow/v1/tasks` | No | Yes | Yes | Yes | No | Yes | Yes (Task Create) | Yes (`start`/`limit`) | Hard delete | Yes | Partial | Distinct from milestone tasks |
| **Task assigned** | Workflow Task | Workflow Task | V1 | `PATCH /workflow/v1/tasks/{id}` `assignee` | No | Yes | Partial | Yes | No | Yes | Yes (Task Update) | Yes | Hard delete | Yes | Partial | Subtasks share assignee |
| **Task updated / status** | Workflow Task | Workflow Task | V1 | `GET/PATCH /workflow/v1/tasks/{id}` | No | Yes | Yes (`completed`) | Yes | No | Yes | Yes (Task Update) | Yes | Hard delete | Yes | Partial | `status`, `resolution` |
| **Task completed** | Workflow Task | Workflow Task | V1 | `PATCH` status / `completed` | No | Yes | Yes (`completed`) | Yes | No | Yes | Yes (Task Update) | Yes | Hard delete | Yes | Partial | `resolution` + `resolutionComment` |
| **Task comment** | Task Comment | Workflow Task | V1 | `GET/POST .../tasks/{id}/comments` | No | Yes | Yes | Yes | Yes | Partial | Yes (Task Comment Update) | **NOT ESTABLISHED** | Hard delete (task) | Yes | Possible | Webhook 24.2+ with `commentText`, `createdBy` |
| **Subtask created/updated** | Subtask | Workflow Task | V1 | `.../tasks/{taskId}/subtasks[/{subTaskId}]` | No | Yes | Partial | Yes | No | Yes | Yes (Subtask Create/Update/Delete) | **NOT ESTABLISHED** | Hard delete | Yes | Partial | Same assignee as parent |
| **Subtask comment** | Subtask Comment | Workflow Task | V1 | `GET/POST .../subtasks/{subTaskId}/comments` | No | Yes | Yes | Yes | Yes | Partial | **NOT ESTABLISHED** (task comment WH only) | **NOT ESTABLISHED** | Hard delete | Yes | Possible | Mirror task comment pattern |
| **Condition created (Enhanced)** | Enhanced Condition | Enhanced Conditions | V3 | `PATCH .../conditions` action `add` | No | Yes | Yes (`statusDate`) | Partial | No | Yes | Yes (`condition` create) | No | Yes (`isRemoved`) | Yes | Partial | Check `useEnhancedConditionIndicator` |
| **Condition created (Standard)** | Standard Condition | Standard Conditions | V1 | `POST .../conditions/{type}` | No | Yes | Partial | Partial | No | Partial | **NOT ESTABLISHED** | No | **NOT ESTABLISHED** | Yes | Partial | Use Enhanced webhooks when EC enabled |
| **Condition status change** | Enhanced Condition | Enhanced Conditions | V3 | `PATCH .../conditions` / tracking | No | Yes | Yes (`statusDate`) | Partial | No | Yes (`tracking[]`) | Yes (`condition` status) | No | Yes (`isRemoved`) | Yes | Partial | Status values **LENDER CONFIGURABLE** |
| **Condition comment** | LogComment on Condition | Enhanced Conditions | V3 | `GET/PATCH .../conditions/{id}/comments` | No | Yes | Yes (`addedDate`) | Yes (`addedBy`) | Yes | Yes (review fields) | Yes (`condition` comment) | No | Yes (`isRemoved`) | Yes | Possible | `LogCommentContract` |
| **Condition tracking entry** | Tracking checkpoint | Enhanced Conditions | V3 | `GET/PATCH .../conditions/{id}/tracking` | No | Yes | Per entry | Yes | No | Yes | Yes (`updateStatusTrackingInConditions`) | No | Yes (`isRemoved`) | Yes | Partial | Checkbox/status audit trail |
| **Condition document assign** | Enhanced Condition | Enhanced Conditions | V3 | `PATCH .../conditions/{id}/documents` | No | Yes | Partial | Yes | No | Yes | Yes (`assignDocument`) | No | Yes | Yes | No | `assignedTo[]` document refs |
| **Standard condition comment** | Standard Condition | Standard Conditions | V1 | `PATCH .../conditions/{type}/{id}/comments` | No | Yes | Partial | Partial | Yes | Partial | **NOT ESTABLISHED** | No | **NOT ESTABLISHED** | Yes | Possible | Enhanced path preferred when enabled |
| **Document created** | eFolder Document | eFolder Document | V3 | `POST/PATCH .../documents` | No | Yes | Partial | Yes | No | Yes | Yes (`document` createDocuments) | No | Yes (`includeRemoved`) | Yes | Partial | Container — not file bytes |
| **Document uploaded (attachment)** | Attachment | eFolder Attachment | V3 | `POST .../attachments` | No | Yes | Partial | Yes | No | Yes | Yes (`attachment` create) | No | Partial | Yes | Often (file content) | File separate from document record |
| **Document status change** | eFolder Document | eFolder Document | V3 | `PATCH .../documents/{id}` | No | Yes | Partial | Yes | No | Yes | Yes (`documentStatusUpdates`) | No | Yes (`includeRemoved`) | Yes | No | Use `documentStatus` (26.1+) |
| **Document comment** | Document comment | eFolder Document | V3 | Embedded in `GET .../documents?view=detail\|full` | No | Yes | Per comment | Yes | Yes | Partial | Yes (`document` updateDocuments) | No | Yes (`includeRemoved`) | Yes | Possible | Exact comment contract per OpenAPI |
| **Document assigned to condition** | Condition ↔ Document | Enhanced Conditions | V3 | `PATCH .../conditions/{id}/documents` | No | Yes | Partial | Yes | No | Yes | Yes (`assignDocument`) | No | Yes | Yes | No | n:m relationship |
| **eFolder history** | eFolder audit | eFolder History | V3 | `GET .../histories/eFolder` | No | Yes | Yes | Partial | No | Yes | Partial (document WH) | **NOT ESTABLISHED** | Partial | **No** | Possible | Broader than inline comments |
| **Conversation log entry** | Conversation Log | Conversation Log | V3 create / V1 read | `PATCH .../conversationlogs`; `GET .../conversationLogs` | Yes (`view=logs`) | Yes | Yes (`dateUtc`, `updatedDateUtc`) | Yes (`user`, commentList) | Yes | Partial (updates) | Partial (loan `update`) | No | **NOT ESTABLISHED** | Yes | Often | Editable log |
| **Conversation log threaded comment** | LogComment in `commentList` | Conversation Log | V3 | Same as above | Yes (`view=logs`) | Yes | Yes (`addedDate`) | Yes (`addedBy`, `reviewedBy`) | Yes | Partial | Partial | No | **NOT ESTABLISHED** | Yes | Possible | `LogCommentContract` |
| **Conversation log alert** | Alert on Conversation Log | Conversation Log | V3 | Embedded in log `alerts[]` | Yes (`view=logs`) | Yes | Yes (`dueDate`) | Yes (`role`, `createdBy`) | No | Partial | Partial | No | No | Yes | Partial | Becomes alert when due expires |
| **AUS tracking log** | AUS Tracking Log | Loan Management | V3 | `view=logs` / dedicated endpoints | Yes (`view=logs`) | Partial | Yes | Partial | No | Yes | Partial | No | **NOT ESTABLISHED** | Yes | Partial | Editable log classification |
| **HTML email log** | HTML Email Log | Loan Management | V3 | `GET .../loans/{loanId}?view=logs\|full` | Yes (`view=logs`) | Optional | Yes | System | No | Yes (append-only) | **NOT ESTABLISHED** | No | No | **No** | Often | System log — disclosure emails |
| **Lock action log** | Lock Action Log | Loan Management | V3 | `view=logs` | Yes (`view=logs`) | Optional | Yes | Partial | No | Yes (append-only) | Yes (`lock`/`unlock`) | No | No | **No** | No | Exclusive loan lock audit |
| **Loan lock (exclusive)** | Resource Lock | Resource Lock | V3 | `/encompass/v3/resourceLocks` | No | Yes | Yes | Yes | No | Yes | Yes (`lock`/`unlock`) | **NOT ESTABLISHED** | No | Yes (lock/unlock) | No | Distinct from rate lock field |
| **Rate lock field change** | Loan field | Field Change | V3 + WH | `fieldchange` / EFC / auditTrail | No | Yes | Yes | Yes | No | Yes | Yes + `lock` WH | Audit pagination | No | No | Partial | Rate lock = field(s) — **LENDER CONFIGURABLE** field IDs |
| **Disclosure log created/updated** | Disclosure Tracking 2015 | Disclosure Tracking | V3 | `GET/POST/PATCH .../disclosureTracking2015Logs` | No | Yes | Yes | Partial | No | Yes | Yes (`disclosureTracking` Beta) | No | **NOT ESTABLISHED** | Yes | Often | TRID compliance |
| **Disclosure snapshot** | Disclosure snapshot | Disclosure Tracking | V3 | `GET .../disclosureTracking2015Logs/snapshots` | No | Yes | Yes | Partial | No | Yes | Partial | **NOT ESTABLISHED** | No | **No** | Often | Point-in-time disclosure state |
| **Document delivery event** | Document Delivery | Encompass Docs | V1 | `POST .../documentOrders/.../delivery` | No | Yes | Yes (async) | Yes | No | Yes | Yes (Doc Delivery WH category) | **NOT ESTABLISHED** | No | N/A | Often | Creates disclosure + eFolder on success |
| **Document order event** | Document Order | Encompass Docs | V1 | Document order APIs | No | Yes | Yes | Yes | No | Yes | Yes (Doc Order WH) | **NOT ESTABLISHED** | No | Partial | Package generation workflow |
| **Compliance alert change** | Loan alert | Webhook | V1 | — | No | Via webhook | Yes | Yes | No | Yes | Yes (`alertchange` Limited) | WH history paginated | No | Partial | Partial | Limited availability |
| **Trade note** | Trade Note | Secondary Trades | V1 | `/secondary/v1/trades/correspondent/{tradeId}/notes` | No | Yes | Yes (`createdTimeStamp`) | Yes | Yes (note body) | Yes (trade history) | Yes (Trade Updated) | **NOT ESTABLISHED** | **NOT ESTABLISHED** | Yes | Possible | Not loan-scoped unless loan on trade |
| **Borrower contact note** | Borrower Contact Note | Borrower Contacts | V1 | `POST .../borrowerContacts/{contactId}/notes` | No | Yes | Yes (`timestamp`) | Yes | Yes (`details`) | Partial | **NOT ESTABLISHED** | **NOT ESTABLISHED** | Partial | Yes | Often | CRM — link to loan via contact relationship |
| **Scheduler / timer fired** | Scheduler | Schedulers | V1 | Scheduler APIs | No | Yes | Yes | System | No | Yes | Yes (Schedulers WH) | **NOT ESTABLISHED** | No | Partial | Partial | TRID timers — see scheduler API |
| **EPC partner event** | EPC transaction | Partner Connect | V1 | EPC APIs | No | Yes | Yes | Partial | No | Yes | Yes (EPC WH) | **NOT ESTABLISHED** | No | Partial | Partial | Service orders through EPC |
| **Field audit (historical pull)** | Audit trail entry | Loan Management | V3 | `POST .../loans/{loanId}/auditTrail` | No | Yes | Yes | Yes | No | Yes | No (pull model) | Yes (`start`/`limit`) | No | **No** | Often | Requires Audit Trail DB — **LENDER CONFIGURABLE** |

---

## LogCommentContract — shared comment shape

Used across **Enhanced Condition comments**, **Conversation Log `commentList`**, and related contracts:

| Field | Timestamp? | Actor? | Notes |
|-------|------------|--------|-------|
| `id` | — | — | Comment identifier |
| `comments` | — | — | Text body |
| `forRole` | — | — | Role context — **LENDER CONFIGURABLE** |
| `addedBy` | — | Yes | Author |
| `addedDate` | Yes | — | Created |
| `reviewedBy` | — | Yes | Reviewer |
| `reviewedDate` | Yes | — | Review timestamp |
| `isExternal` | — | — | External visibility flag |

---

## Loan GET view quick reference

| `view` | Entity | Logs (editable + system) | Full resource trees |
|--------|--------|--------------------------|---------------------|
| `entity` | Yes | No | No |
| `logs` | No | Yes | No |
| `full` | Yes | Yes | Yes |

**Do not assume** `view=full` replaces condition/document/task APIs — those collections have dedicated endpoints with richer filters and `view` levels.

---

## Webhook coverage gaps (plan polling)

| Activity | Webhook | Fallback poll |
|----------|---------|---------------|
| Conversation log CRUD | Loan `update` (imprecise) | `GET conversationLogs` or `view=logs` |
| Smart Client field edits | `fieldchange` / EFC if subscribed | `auditTrail` |
| Standard condition (non-EC loan) | **NOT ESTABLISHED** | `GET .../conditions/{type}` |
| Subtask comment | **NOT ESTABLISHED** | `GET .../subtasks/.../comments` |

---

## References

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [02-apis/API-INDEX.md](../02-apis/API-INDEX.md)
- [01-domain/comments-notes-logs.md](../01-domain/comments-notes-logs.md)
