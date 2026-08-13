# MASTER — Encompass Developer Connect Knowledge Base

> **Primary source of truth:** [ICE Encompass Developer Connect](https://developer.icemortgagetechnology.com/developer-connect/docs/welcome)  
> **Production API:** `https://api.elliemae.com` · **UAT:** `https://concept.api.elliemae.com`  
> **Generated from:** `/workspace/docs/encompass-knowledge-base/` (sections 01–18)

Individual files remain the canonical editable sources. This document concatenates them for single-file download.

---

## Table of contents

| # | Section | Anchor |
|---|---------|--------|
| 01 | Encompass Domain Overview | [#01-encompass-domain-overview](#01-encompass-domain-overview) |
| 02 | Loan Domain | [#02-loan-domain](#02-loan-domain) |
| 03 | Loan Schema and Fields | [#03-loan-schema-and-fields](#03-loan-schema-and-fields) |
| 04 | Conditions (Standard) | [#04-conditions-standard](#04-conditions-standard) |
| 05 | Conditions (Enhanced) | [#05-conditions-enhanced](#05-conditions-enhanced) |
| 06 | Condition Lifecycle and Comments | [#06-condition-lifecycle-and-comments](#06-condition-lifecycle-and-comments) |
| 07 | Workflow Tasks | [#07-workflow-tasks](#07-workflow-tasks) |
| 08 | Milestones and Associates | [#08-milestones-and-associates](#08-milestones-and-associates) |
| 09 | Documents, eFolder, Attachments | [#09-documents-efolder-attachments](#09-documents-efolder-attachments) |
| 10 | Document Orders, Delivery, Disclosures | [#10-document-orders-delivery-disclosures](#10-document-orders-delivery-disclosures) |
| 11 | Conversation Logs, Notes, Comments | [#11-conversation-logs-notes-comments](#11-conversation-logs-notes-comments) |
| 12 | Organizations, Users, Roles | [#12-organizations-users-roles](#12-organizations-users-roles) |
| 13 | Webhooks & Events **(full)** | [#13-webhooks-events](#13-webhooks-events) |
| 14 | EPC, DDA, Trades, Schedulers | [#14-epc-dda-trades-schedulers](#14-epc-dda-trades-schedulers) |
| 15 | Production Integration Architecture | [#15-production-integration-architecture](#15-production-integration-architecture) |
| 16 | Bank Product Engineering | [#16-bank-product-engineering](#16-bank-product-engineering) |
| 17 | API Reference Cheatsheet | [#17-api-reference-cheatsheet](#17-api-reference-cheatsheet) |
| 18 | John Smith Case Study **(full)** | [#18-real-loan-end-to-end-case-study](#18-real-loan-end-to-end-case-study) |

---

## Running example loan

| Attribute | Value |
|-----------|-------|
| Borrower | John Smith · Purchase · $500k / $400k loan · Conventional 30-year |
| Roles | LO Mike · Processor Sarah · UW Robert · Closing Lisa · Title ABC · Appraisal XYZ |

---

<a id="01-encompass-domain-overview"></a>

## 01 — Encompass Domain Overview (summary)

**Full file:** [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) *(planned — see README index)*

Encompass is a **loan manufacturing platform** centered on the **Loan** file. Official mental model from [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management):

| Core object | Role |
|-------------|------|
| **Loan** | System of record for origination data, workflow state, logs |
| **eFolder document** | Tracking folder for a required document type |
| **Attachment** | File(s) stored against a document |
| **Condition** | Underwriting or prior-to-funding requirement (standard or enhanced) |
| **Milestone** | Pipeline stage completion markers |
| **Workflow Task** | Assignable work unit (`workflow/v1`) |
| **Document Order** | Async disclosure generation (opening/closing/forms) |
| **Service Order** | EPC third-party service |

**Integration principle:** APIs read/write loan state; webhooks signal changes — reconcile via `resourceRef` ([Webhook Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)).

**Master architecture:**

```
Customer → LOAN → DATA | WORKFLOW | PEOPLE | DOCUMENTS | DISCLOSURES | LOGS | EVENTS
External: EPC | DDA | Trades | Schedulers | Orgs/Users
Encompass ──webhooks──► Gateway ──► SQS ──► Event Store ──► Operational DB ──► Banking systems
```

---

<a id="02-loan-domain"></a>

## 02 — Loan Domain (summary)

**Full file:** [02-loan-domain.md](./02-loan-domain.md) *(planned)*

- **V3** loan APIs: `POST/GET/PATCH/DELETE /encompass/v3/loans/{loanId}` — [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- **Views:** `entity` | `log` | `full` | `id` (create/update only)
- **loanId:** 32-char GUID, immutable for life of loan
- **Field Reader/Writer:** `POST .../fieldReader`, `POST .../fieldWriter`
- **Enhanced Field Change webhook:** replaces SDK polling for field sync — [SDK Migration Guide](https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide)

---

<a id="03-loan-schema-and-fields"></a>

## 03 — Loan Schema and Fields (summary)

**Full file:** [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md) *(planned)*

V3 schema classifies entities per [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management):

1. **Fixed collections** — pre-populated, fixed size (contacts, custom fields)
2. **Variable collections** — add/remove/reorder (VoEs, VoDs, VoLs)
3. **Editable logs** — conversation, AUS tracking (user-editable)
4. **System logs** — milestone history, lock logs (read-only)

Schema contract: [V3 Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1). Field IDs in webhooks use Encompass notation (e.g. `36#2` for borrower pair index).

---

<a id="04-conditions-standard"></a>

## 04 — Conditions (Standard) (summary)

**Full file:** [04-conditions-standard.md](./04-conditions-standard.md) *(planned)*

Standard conditions apply when `loan.useEnhancedConditionIndicator` is false (field ENHANCEDCOND.X1). Separate APIs from enhanced conditions. Loan-level condition webhook events on **Loan** resource apply to **enhanced** conditions when indicator is true.

---

<a id="05-conditions-enhanced"></a>

## 05 — Conditions (Enhanced) (summary — critical section)

**Full file:** [05-conditions-enhanced.md](./05-conditions-enhanced.md) *(planned — expanded summary below)*

Source: [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions).

### When enhanced conditions apply

| Indicator | Field / JSON path | Meaning |
|-----------|-------------------|---------|
| Enhanced | `useEnhancedConditionIndicator` = true / ENHANCEDCOND.X1 | Use V3 enhanced condition APIs |
| Standard | false | Standard condition APIs |

### API surface (V3)

| Operation | Endpoint |
|-----------|----------|
| List | `GET /encompass/v3/loans/{loanId}/conditions` |
| Get | `GET /encompass/v3/loans/{loanId}/conditions/{conditionId}` |
| Create | `POST /encompass/v3/loans/{loanId}/conditions` |
| Update | `PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}` |
| Delete | `DELETE /encompass/v3/loans/{loanId}/conditions/{conditionId}` |

**Views:** `Summary` | `Detail` | `Full` (comments in Full).

### Key concepts

| Concept | Product meaning |
|---------|-----------------|
| `conditionType` | Lender-defined taxonomy |
| `priorTo` | Funding, Docs, Closing, etc. (lender config) |
| `tracking` | Status checkbox history with user/date |
| `comments` | Internal vs external (`isExternal`) |
| `age` / `daysToReceive` | SLA measurement |
| Automated Conditions Evaluator | Returns applicable templates from business rules |

### Webhooks

- **Loan** `condition` event: `createConditions`, `updateStatusTrackingInConditions`, `assignDocumentsToConditions`, `addCommentsToConditions`, etc. — [Loan events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
- **Admin** Enhanced Condition Template/Type: Create/Update/Delete — [Enhanced Conditions webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions)

---

<a id="06-condition-lifecycle-and-comments"></a>

## 06 — Condition Lifecycle and Comments (summary)

**Full file:** [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) *(planned)*

Lifecycle: created → requested → received → cleared (tracking statuses lender-configurable). Comments attach to conditions with role targeting (`forRole`). Webhook `addCommentsToConditions` includes `commentId` and `isExternal`. Reconcile with `GET .../conditions?view=Full`.

---

<a id="07-workflow-tasks"></a>

## 07 — Workflow Tasks (summary)

**Full file:** [07-workflow-tasks.md](./07-workflow-tasks.md) *(planned)*

[Workflow Task Service](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy): Task Templates (config) + Task Instances (`workflow/v1`).

| API | Purpose |
|-----|---------|
| `POST /workflow/v1/tasks` | Create task (optional `templateId`) |
| `GET /workflow/v1/taskPipeline` | Open tasks for user/groups |
| Subtasks | `/workflow/v1/tasks/{taskId}/subtasks` |

Webhooks: Task, Subtask, TaskGroup, TaskComment — [Workflow Tasks webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks).

---

<a id="08-milestones-and-associates"></a>

## 08 — Milestones and Associates (summary)

**Full file:** [08-milestones-and-associates.md](./08-milestones-and-associates.md) *(planned)*

Milestones: `milestoneLogs` on loan; webhook `milestone` with `updateMilestones` / `finishMilestones`. Filter subscription example: `/milestoneLogs/*/doneIndicator` for change events. Associates/contacts: file contacts and loan team roles — updated via loan PATCH.

---

<a id="09-documents-efolder-attachments"></a>

## 09 — Documents, eFolder, Attachments (summary)

**Full file:** [09-documents-efolder-attachments.md](./09-documents-efolder-attachments.md) *(planned)*

[Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1): Document = folder; Attachment = file. V3 recommended; V1/V3 interoperable. Webhooks on Loan: `document`, `attachment` events.

---

<a id="10-document-orders-delivery-disclosures"></a>

## 10 — Document Orders, Delivery, Disclosures (summary)

**Full file:** [10-document-orders-delivery-disclosures.md](./10-document-orders-delivery-disclosures.md) *(planned)*

Async workflows — [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages):

| Resource | Events |
|----------|--------|
| DocumentOrder | opening*/closing*/forms* audit/order/delivery steps |
| DocumentDelivery | packageCreated/Updated, fulfillment* (limited availability) |

Poll alternative: Get Order Status API; webhooks preferred.

---

<a id="11-conversation-logs-notes-comments"></a>

## 11 — Conversation Logs, Notes, Comments (summary — critical section)

**Full file:** [11-conversation-logs-notes-comments.md](./11-conversation-logs-notes-comments.md) *(planned — expanded summary below)*

Source: [Loan Management — About Loan Views](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management).

### Log categories in loan file

| Category | Type in V3 schema | Editable? | API access |
|----------|-------------------|-----------|------------|
| Conversation logs | Editable log | Yes | `view=log` or `view=full` |
| Milestone history | System log | No | `view=log` |
| Lock action logs | System log | No | `view=log` |
| HTML email logs | System log | No | `view=log` |

### Comments vs logs — aggregation matrix

| Source object | API path pattern | Webhook signal | External visibility |
|---------------|------------------|----------------|---------------------|
| Condition comment | `GET .../conditions?view=Full` | Loan `condition` · `addCommentsToConditions` | `isExternal` flag |
| Task comment | `workflow/v1/comments/{id}` | TaskComment `update` | Task comment text |
| Conversation log | Loan `view=log` | Loan `update` / EFC on log fields | Lender UI config |
| Milestone comment | Lender-specific | Milestone-related loan updates | Varies |

### Integration guidance

1. Do not assume one API returns all comment types — use domain APIs.
2. Preserve `userId` from webhooks for audit attribution.
3. `view=full` is largest payload — use targeted GETs.
4. Task comments (24.2+): disposition changes create new comment records — webhook `modifiedAttributes` with `priorValue: null`.

---

<a id="12-organizations-users-roles"></a>

## 12 — Organizations, Users, Roles (summary)

**Full file:** [12-organizations-users-roles.md](./12-organizations-users-roles.md) *(planned)*

Webhooks: InternalUsers, ExternalUsers, External Organizations, userGroups — [Orgs and Users](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users). APIs: `/encompass/v3/users`, `/encompass/v3/externalUsers`, `/encompass/v3/groups`. Persona settings gate API and webhook capabilities (e.g. Enhanced Field Change).

---

<a id="13-webhooks-events"></a>

## 13 — Webhooks & Events (full text)
# 13 — Webhooks & Events

> **Official sources:** [Webhook Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) · [Subscriptions](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions) · [Signing Keys](https://developer.icemortgagetechnology.com/developer-connect/reference/signing-keys) · [Retry Logic](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-retry-logic) · [Webhooks Best Practices](https://developer.icemortgagetechnology.com/developer-connect/docs/webhooks-bp) · [EFC Features and Usage Notes](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes)

---

## Core principle: webhook ≠ current truth

A webhook notification is an **asynchronous signal that something changed** — not a guaranteed, complete, or ordered snapshot of the loan file.

| What webhooks provide | What they do **not** guarantee |
|----------------------|--------------------------------|
| Near-real-time notification of a resource event | Strict chronological delivery order |
| `resourceRef` URL to fetch the authoritative resource | That payload fields match current Encompass state at processing time |
| `eventId` for deduplication | Delivery if your endpoint fails (events may be discarded after retries) |
| Optional `extraPayload` for some events | That Smart Client updates trigger every subscribed event (varies by event and instance config) |

**Bank integration rule:** Treat every webhook as a **trigger to reconcile** — use `resourceRef` and domain APIs to read current state before acting on downstream systems (core banking, investor delivery, compliance queues).

---

## Notification envelope (all resources)

Every webhook POST shares a common envelope documented on the [Webhook Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook):

| Attribute | Description |
|-----------|-------------|
| `eventId` | Unique identifier for **this delivery**. Use for deduplication. |
| `eventTime` | ISO 8601 timestamp when the event occurred. |
| `eventType` | Event name (e.g. `create`, `update`, `enhancedfieldchange`, `packagecreated`). |
| `meta.userId` | User who generated the event (or `Automation` for workflow-driven events). |
| `meta.resourceType` | Resource category (e.g. `Loan`, `DocumentOrder`, `Timer`). |
| `meta.resourceId` | GUID of the affected resource. |
| `meta.instanceId` | Encompass instance identifier. |
| `meta.resourceRef` | API path to fetch the resource (use for reconciliation). |
| `meta.payload` | Extra payload when `extraPayload` is supported for the event (varies by resource). |

**Illustrative — minimal loan create notification (from official docs):**

```json
{
  "eventId": "365d773d-138a-4277-84f1-a848a79c6d79",
  "eventTime": "2025-02-03T20:58:11.599Z",
  "eventType": "create",
  "meta": {
    "userId": "admin",
    "resourceType": "Loan",
    "resourceId": "91693e3d-0a59-45d5-a5cf-e3c9b5917edd",
    "instanceId": "debe11231313",
    "resourceRef": "/encompass/v3/loans/91693e3d-0a59-45d5-a5cf-e3c9b5917edd"
  }
}
```

---

## Supported webhook resource catalog

Official catalog: [Webhook Overview — Supported Resources and Events](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook).

| Resource category | Reference page | Notes |
|-------------------|----------------|-------|
| **Loan** | [Loan events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) | Largest event surface; includes EFC, milestones, documents, conditions |
| **Document Delivery** | [Document Delivery](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery) | eDelivery packages; 24.2+ |
| **Document Order** | [Document Order](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order) | Opening/closing/forms disclosure workflows |
| **Enhanced Conditions** | [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions) | Template and type admin events; loan-level condition events on Loan resource |
| **Orgs and Users** | [Orgs and Users](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users) | Internal/external users, orgs, user groups |
| **EPC (Partner Connect)** | [EPC](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect) | Service orders via Encompass Partner Connect only |
| **Schedulers** | [Schedulers](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers) | Timer-based workflow automation |
| **Trades** | [Trades](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades) | Correspondent trade lifecycle |
| **Workflow Tasks** | [Workflow Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks) | Tasks, subtasks, task groups, task comments |
| **DDA** | [DDA](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-dda) | **Limited availability** — DDA customers only |

---

## Loan resource — complete event model

Source: [Loan Resource Events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan).

| Event | Description | Typical support |
|-------|-------------|-----------------|
| `create` | New loan started | API |
| `update` | Loan file updated | Smart Client, API |
| `submit` | Consumer Connect submit button clicked | Consumer Connect only |
| `move` | Loan moved between folders (trash = soft delete) | Smart Client, API |
| `delete` | Loan permanently deleted | Smart Client, API |
| `document` | Subevents: `createDocuments`, `updateDocuments`, `assignAttachmentsToDocument` | API |
| `attachment` | Subevent: `attachmentCreated` | API |
| `condition` | Enhanced condition subevents: create, update, assign, assignDocument, remove, comment, status change | API |
| `milestone` | Subevents: `updateMilestones`, `finishMilestones` | API |
| `change` | Filtered loan attribute changes (max 50 filter attributes per subscription) | Smart Client, API |
| `fieldchange` | Specified field changes; cascaded fields included in payload | API |
| `enhancedfieldchange` | All field changes with previous/new values; may chunk | API (feature flag required) |
| `lock` / `unlock` | Exclusive lock acquired/released | Smart Client, API |
| `alertchange` | Compliance alert opened/cleared | Smart Client, API — **Limited Availability** |
| `disclosureTracking` | Enhanced Disclosure Tracking log created/updated | API — **Beta Only** |
| `reportingdbupdate` | Internal use only | N/A |
| `milestoneupdate` | Internal use only | N/A |

**Smart Client caveat:** Events marked "API only" may still fire from Smart Client when the instance has enhanced field change enabled, Task Based Workflow with loan rules, or DDA (formerly AIQ) — see official Support column notes.

### Loan lock/unlock webhook caveat

Source: [Subscribing to Loan Lock and Unlock Events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan#subscribing-to-loan-lock-and-unlock-events).

- Notifications are **not real-time**; delay between lock event and webhook delivery is possible.
- An intervening lock may occur between notification emission and your lock attempt.
- Lock/unlock webhooks **reduce polling** but do **not eliminate** retry logic for API updates.

---

## Document Delivery events

Source: [Document Delivery](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery). Added in Encompass 24.2.

| Event | Description |
|-------|-------------|
| `packageCreated` | Package created in eDelivery (all packages, regardless of fulfillment flag) |
| `packageUpdated` | eDelivery package updated |
| `fulfillmentCreated` | Package ready for fulfillment — **limited availability** |
| `fulfillmentUpdated` | Fulfillment changes — **limited availability** |

`meta.resourceType`: `DocumentDelivery`. `resourceRef` pattern: `/delivery/v3/loans/{loanId}/packages/{packageId}`.

---

## Document Order events

Source: [Document Order](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order).

| Event | Workflow step |
|-------|---------------|
| `openingauditcompleted` / `openingauditfailed` | Opening disclosure audit |
| `openingordercompleted` / `openingorderfailed` | Opening document order |
| `openingdeliverycompleted` / `openingdeliveryfailed` | Opening delivery |
| `openingappenddocumentssucceeded` / `openingappenddocumentsfailed` | Opening append |
| `openingaddtoefoldersucceeded` / `openingaddtoefolderfailed` | Opening eFolder add |
| `closingauditcompleted` / `closingauditfailed` | Closing audit |
| `closingordercompleted` / `closingorderfailed` | Closing order |
| `closingdeliverycompleted` / `closingdeliveryfailed` | Closing delivery |
| `closingappenddocumentssucceeded` / `closingappenddocumentsfailed` | Closing append |
| `closingaddtoefoldersucceeded` / `closingaddtoefolderfailed` | Closing eFolder add |
| `formscompleted` / `formsfailed` | On-demand forms |
| `formsdeliverycompleted` / `formsdeliveryfailed` | Form delivery |
| `closingpackagecompleted` / `closingpackagefailed` | **Not supported — soon deprecated** |

---

## Enhanced Conditions (admin resource) events

Source: [Enhanced Conditions webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions).

Loan-level enhanced condition activity is also emitted on the **Loan** resource under `eventType: condition` with subevents in `meta.payload.event`.

| Admin resource | Events |
|----------------|--------|
| Enhanced Condition Template | Create, Update, Delete |
| Enhanced Condition Type | Create, Update, Delete |

Enablement requires a support ticket plus subscription via [Subscriptions API](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions).

---

## Orgs and Users events

Source: [Orgs and Users](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users).

| Resource | Events | Support |
|----------|--------|---------|
| External Organizations | Create, Update | Smart Client |
| External Users | Create, Update, Delete | Smart Client, API |
| Internal Users | Create, Update, Delete | Smart Client, API |
| User Groups | Create, Update, Delete | Smart Client |

`userGroups` notifications use an extended envelope (`payloadVersion`, `correlationId`, `type` URN) — see official samples.

---

## EPC (Encompass Partner Connect) events

Source: [EPC](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect).

**Service Order** (EPC orders only — not services ordered outside EPC):

| Event | Description |
|-------|-------------|
| `Placed` | Order delivered to third-party provider |
| `Acknowledged` | Provider acknowledged |
| `Fulfilled` | Order completed and response ingested |
| `System Failure` | API failure preparing order |
| `Process Failure` | Business rule / authorization failure |

Extra payload includes `partnerId`, `productId`, `productListingName`.

**Transaction** resource: available for **EPC partners only** — see [Partner Connect webhooks](https://docs.partnerconnect.elliemae.com/partnerconnect/docs/webhooks).

---

## Scheduler (Timer) events

Source: [Schedulers](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers).

| Event | Description |
|-------|-------------|
| `Created` | Scheduler started; payload includes `completionTime` |
| `Completed` | Fired at `completionTime` |
| `Changed` | Scheduler modified; `completionTime` may change |
| `Cancelled` | Completed event will not fire |

`meta.resourceType`: `Timer` (not "Scheduler"). Requires active Scheduler Template and companion Workflow Rules in Encompass Admin.

---

## Trades events

Source: [Trades](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades).

| Event | Description |
|-------|-------------|
| `Create` | Trade created |
| `Publish` | Trade published |
| `Update` | Loans on correspondent trade updated |
| `Loan Assignment Complete` | Loan assigned to trade |

**Not supported:** Update Status and Void actions for Trade resource.

---

## Workflow Tasks events

Source: [Workflow Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks).

| Resource | Events |
|----------|--------|
| Task | Create, Update, Delete |
| Subtask | Create, Update, Delete |
| Task Group | Create, Update, Delete |
| Task Comment | Update (comment added or disposition changed) — 24.2+ |

Task APIs use `workflow/v1` paths in `resourceRef` (e.g. `workflow/v1/comments/{id}`).

---

## DDA events (limited availability)

Source: [DDA](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-dda).

> Lenders using ICE DDA with Encompass subscribe via the **DDA Platform Webhook API only**. Limited availability — contact ICE MT CSM/RM.

| Resource | Purpose |
|----------|---------|
| AnalyzerDocumentValidationResult | Document validation status from AIQ Analyzers |
| AnalyzerResult | Analyzer process state (eligibility, mapping, etc.) |
| DataSource | Data source lifecycle |
| Document | Document lifecycle |
| eFolder | Loan eFolder state |
| ReceivedMailItem | Mail item state |

---

## Subscription flow

### Prerequisites

1. OAuth access token with persona rights including **Subscribe to Webhook** ([Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication)).
2. For `enhancedfieldchange`: **Enhanced Field Change** persona + instance feature flag ([EFC How to Enable](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-how-to-enable)).
3. HTTPS callback URL under a single base domain ([Subscriptions API](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions)).

### Step-by-step

| Step | Action | API / detail |
|------|--------|--------------|
| 1 | Discover resources | `GET /webhook/v1/resources` — [Resources API](https://developer.icemortgagetechnology.com/developer-connect/reference/resources) |
| 2 | List events for a resource | `GET /webhook/v1/resources/{id}/events` |
| 3 | Choose events and filters | Loan `change`/`fieldchange`: up to **50** `filters.attributes`; `enhancedfieldchange` cannot filter |
| 4 | Set signing key | Custom (32–64 chars, complexity rules) or platform-generated default |
| 5 | Choose delivery policy | `deliveryPolicy.backoff`: `linear` (default) or `exponential` |
| 6 | Create subscription | `POST /webhook/v1/subscriptions` |
| 7 | Capture subscription ID | From `Location` header — maps to `Elli-SubscriptionId` on notifications |
| 8 | Implement signature validation | HMAC-SHA256 of raw body with signing key → compare to `Elli-Signature` |
| 9 | Return HTTP 200–499 quickly | Triggers no retry; 5xx/timeout/connection errors trigger retry policy |

**Illustrative — create Loan subscription:**

```json
{
  "resource": "Loan",
  "events": ["create", "update", "milestone", "condition"],
  "endpoint": "https://api.yourbank.com/encompass/webhooks/loan",
  "signingkey": "YourComplexSigningKey!2024",
  "deliveryPolicy": { "backoff": "exponential" }
}
```

### Subscription limits and hygiene

Source: [Webhooks Best Practices](https://developer.icemortgagetechnology.com/developer-connect/docs/webhooks-bp), [Subscriptions](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions).

| Rule | Detail |
|------|--------|
| Max subscriptions per lender | **25** |
| Bad subscription cleanup | ICE auto-deletes endpoints with 5xx/timeouts: >30 days old, >1,000 events/week |
| Filter subscriptions | Separate subscriptions per filter field when workflows differ; cache subscription ID → workflow mapping |
| `change` + filters | Max 50 attributes; invalid attributes are **ignored** (not validated) |
| Unique endpoint constraint | Resource event + endpoint combination must be unique when using different endpoints |
| Wildcard events | Cannot subscribe to `*` for all event types |

---

## Signing keys and notification integrity

Source: [Signing Keys](https://developer.icemortgagetechnology.com/developer-connect/reference/signing-keys).

| Header | Purpose |
|--------|---------|
| `Elli-Environment` | Always `prod` |
| `Elli-Signature` | Base64 HMAC-SHA256 of **raw request body** using signing key (UTF-8 encoded) |
| `Elli-SubscriptionId` | Maps to subscription signing key |

Validation algorithm (official C# sample pattern):

1. `keyByte = UTF8.GetBytes(signingKey)`
2. `hash = HMACSHA256(keyByte, UTF8.GetBytes(rawBody))`
3. `expected = Base64(hash)`
4. Compare to `Elli-Signature` header (constant-time compare in production)

Forgotten signing key: retrieve via [Get a Subscription API](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-subscription). Previously called "Webhook secret".

**Custom Authorization:** ICE supports optional custom auth before posting — [Custom Authorization](https://developer.icemortgagetechnology.com/developer-connect/reference/custom-authorization).

---

## eventId deduplication

Each webhook delivery has a unique `eventId`. Official documentation states this **ensures events are only digested once** when consumers implement idempotent processing.

| Scenario | Dedup strategy |
|----------|----------------|
| Normal delivery | Store `eventId`; skip if seen |
| Retry of same event | Same `eventId` on redelivery — dedup prevents double processing |
| EFC multi-chunk | **Different `eventId` per chunk** — dedup on `eventId` alone is insufficient; use `chunkId` + `multipartIndicator` |
| Multiple events one transaction | May share `meta.payload.correlationId` — use for correlation, not dedup |

**Recommended store:** `(instanceId, eventId)` unique index with TTL aligned to retention policy.

---

## Retry logic and acknowledgment

Source: [Retry Logic](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-retry-logic).

### Failed delivery (triggers retry)

- HTTP status **outside** 200–499
- Request **timeout** (30 seconds) — next retry starts at interval after timeout (e.g. 20s interval + 15s timeout = 35s to next attempt)
- Connection errors (timeout, unreachable, bad SSL)

### Successful acknowledgment (no retry)

HTTP status **200–499** — including 4xx. Design handlers to return 2xx after durable enqueue, not after full downstream processing.

### Linear (default)

- **3 attempts**, **20 seconds** between attempts
- After 3 failures: notification **discarded**

### Exponential

- Retries for **8 hours** with increasing intervals (15 attempts documented)
- Set via `"deliveryPolicy": {"backoff": "exponential"}` on create/update subscription

| Retry # | Interval since original event |
|---------|-------------------------------|
| 1 | 30s |
| 2 | 60s |
| 3 | 2m |
| … | … |
| 15 | 8h |

---

## Event ordering

**Documentation does not guarantee chronological delivery order.**

Causes:

- Retries with backoff can deliver a later event before an earlier failed event succeeds
- Multiple subscriptions and parallel workers
- EFC chunks with distinct `eventId` values

**Mitigation:**

- Use `eventTime` and resource versioning for ordering decisions
- Apply **last-write-wins** only when business rules permit
- For loan updates, prefer field-level merge using EFC `previousValue`/`newValue` when available
- Use `correlationId` to group related changes within one Encompass transaction

---

## Enhanced Field Change (EFC) — chunked payloads

Source: [EFC Features and Usage Notes](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes).

When a payload is excessively large, ICE splits it into chunks:

| Mechanism | Detail |
|-----------|--------|
| Separate POSTs | One webhook per chunk |
| `multipartIndicator` | Format `n/x` (e.g. `1/4`, `2/4`) — chunk index / total |
| `chunkId` | Shared UUID across all chunks of one field-change event |
| `eventId` | **Unique per chunk** — not shared across chunks |

**Chunk assembly pattern:**

1. Receive chunk; validate signature
2. Key buffer: `(instanceId, resourceId, chunkId)`
3. Store chunk by `multipartIndicator` index
4. When all `x` chunks received, merge `fieldChangeEvents` arrays
5. Process merged event once; mark `chunkId` processed

**Loan create EFC:** Initial payload is significantly larger than subsequent updates (all loan data included).

**PII in EFC:** Payload includes loan-level data including PII (SSN, names, etc.) — see PII section below.

**Virtual fields:** Trigger EFC only when loan file version is created from an update (folder moves without loan save do not trigger).

---

## PII and access controls

Source: [Access Controls to Enhanced Field Webhook Data](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-access-controls-to-data).

| Control | Detail |
|---------|--------|
| Persona: Subscribe to Webhook | Required for any webhook subscription |
| Persona: Enhanced Field Change | Required for `enhancedfieldchange` subscriptions |
| EFC payload content | Loan-level data including **PII** |
| Official guidance | Limit Enhanced Field Change persona to users/partners with true business need |

**Bank practices (beyond ICE docs):**

- Encrypt webhook payload at rest in your event store
- Redact or tokenize PII in analytics pipelines
- Scope object-store and log retention to regulatory requirements
- Never forward raw EFC payloads to unsecured channels

---

## Nine-step webhook processing flow (bank pattern)

Recommended ingestion pipeline for Java/Spring Boot on AWS:

| Step | Responsibility | Failure mode |
|------|----------------|--------------|
| **1. Receive** | API Gateway / ALB terminates TLS, forwards to ingestion service | 5xx → ICE retries |
| **2. Authenticate** | Validate `Elli-Signature` using subscription signing key from secure store | 401 → ICE retries (wastes quota — fix fast) |
| **3. Acknowledge** | Return HTTP 200 after durable write to queue (SQS), not after business processing | Slow handler → timeout → retries |
| **4. Persist raw** | Store immutable raw body + headers in event store (S3 + DynamoDB index) | — |
| **5. Dedup** | Check `(instanceId, eventId)`; for EFC chunks use `chunkId` assembly | Duplicate → skip |
| **6. Parse & route** | Map `resourceType` + `eventType` to handler topic (SNS/SQS fan-out) | — |
| **7. Reconcile** | `GET` `resourceRef` (or domain-specific API) for current truth | API lock/conflict → retry with lock strategy |
| **8. Apply idempotent** | Update operational DB / emit domain events with business idempotency keys | — |
| **9. Audit** | Log correlationId, userId, eventTime, handler outcome | — |

---

## Reference architecture — Java/Spring Boot + AWS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ICE Encompass Platform                               │
│  Loan │ DocumentOrder │ DocumentDelivery │ Workflow │ EPC │ Timer │ ...    │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                  │ HTTPS POST (JSON + Elli-Signature)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AWS API Gateway / ALB                                                       │
│  - TLS termination                                                           │
│  - WAF rate limits                                                           │
│  - Optional: IP allowlist (ICE egress — confirm with ICE for your tenant)    │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Spring Boot Webhook Ingestion Service (ECS/Fargate or Lambda)               │
│  1. HMAC-SHA256 validate Elli-Signature                                      │
│  2. Dedup check (DynamoDB: instanceId + eventId)                             │
│  3. EFC chunk buffer (DynamoDB/ElastiCache: chunkId → partial payload)         │
│  4. Publish to SQS (partition key: loanId or resourceId)                     │
│  5. Return 200 immediately                                                     │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SQS (per-domain queues)                                                     │
│  loan-events │ doc-order-events │ workflow-events │ org-events               │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Spring Boot Workers                                                         │
│  - OAuth token cache (client_credentials or password grant)                  │
│  - GET resourceRef → reconcile current state                               │
│  - Resource lock when multi-step PATCH required                                │
│  - Idempotent upsert to operational PostgreSQL / Aurora                        │
│  - Emit to downstream SNS → core banking / data lake                           │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Event Store (S3 raw + DynamoDB metadata) │ Operational DB │ Analytics (MSK)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Spring Boot handler sketch (illustrative)

```java
@PostMapping("/webhooks/encompass")
public ResponseEntity<Void> receive(
    @RequestHeader("Elli-Signature") String signature,
    @RequestHeader("Elli-SubscriptionId") String subscriptionId,
    @RequestBody byte[] rawBody) {
  String signingKey = subscriptionKeyStore.get(subscriptionId);
  if (!signatureValidator.matches(signingKey, rawBody, signature)) {
    return ResponseEntity.status(401).build();
  }
  sqsPublisher.send(rawBody, headers);
  return ResponseEntity.ok().build();
}
```

---

## Webhook management APIs

| Operation | Endpoint | Reference |
|-----------|----------|-----------|
| List resources | `GET /webhook/v1/resources` | [Resources](https://developer.icemortgagetechnology.com/developer-connect/reference/resources) |
| Resource events | `GET /webhook/v1/resources/{id}/events` | [Resources](https://developer.icemortgagetechnology.com/developer-connect/reference/resources) |
| Create subscription | `POST /webhook/v1/subscriptions` | [Create a Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-subscription) |
| Update subscription | `PATCH /webhook/v1/subscriptions/{id}` | [Update Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/update-subscription) |
| Get subscription | `GET /webhook/v1/subscriptions/{id}` | [Get a Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-subscription) |
| List subscriptions | `GET /webhook/v1/subscriptions` | [Subscriptions](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions) |
| Event history | `GET /webhook/v1/events` | [Webhook Events](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) |
| Get event | `GET /webhook/v1/events/{id}` | [Webhook Events](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) |

**Base URL:** `https://api.elliemae.com` (prod) · `https://concept.api.elliemae.com` (UAT)

---

## Teaching summary

| Concept | Remember |
|---------|----------|
| Truth | Webhook = change signal; API `GET` = current truth |
| Dedup | `eventId` per delivery; EFC needs `chunkId` assembly |
| Ack | 200–499 = success; 5xx/timeout = retry then discard |
| Order | Not guaranteed; use `eventTime` + reconciliation |
| EFC | High volume, PII, chunking; requires feature flag + persona |
| Ops | ≤25 subscriptions; remove unused; monitor ICE auto-deletion rules |

---

<a id="14-epc-dda-trades-schedulers"></a>

## 14 — EPC, DDA, Trades, Schedulers (summary)

See full file: [14-epc-dda-trades-schedulers.md](./14-epc-dda-trades-schedulers.md)

## Encompass Partner Connect (EPC)

**What it is:** ICE's marketplace for ordering third-party mortgage services (credit, appraisal, title, etc.) from within Encompass.

**Webhook resource:** `ServiceOrder` (and `Transaction` for EPC partners only).

**Critical constraint:** Service Order events fire **only** when the service is ordered through Encompass Partner Connect — not for orders placed outside EPC.

### Service Order events

| Event | When it fires |
|-------|---------------|
| `Placed` | Order delivered to third-party provider |
| `Acknowledged` | Provider acknowledged the order |
| `Fulfilled` | Order completed; response ingested into Encompass |
| `System Failure` | API/system exception while preparing order |
| `Process Failure` | Business rule, authorization, or access exception |

**Extra payload (all Service Order events):**

| Field | Description |
|-------|-------------|

<a id="15-production-integration-architecture"></a>
## 15 — Production Integration Architecture (summary)
See full file: [15-production-integration-architecture.md](./15-production-integration-architecture.md) — OAuth, V1/V3, locks, idempotency, PII, bank patterns.

<a id="16-bank-product-engineering"></a>
## 16 — Bank Product Engineering (summary)
See full file: [16-bank-product-engineering.md](./16-bank-product-engineering.md) — SLAs, condition aging, workloads, interview questions.

<a id="17-api-reference-cheatsheet"></a>
## 17 — API Reference Cheatsheet (summary)
See full file: [17-api-reference-cheatsheet.md](./17-api-reference-cheatsheet.md) — documented endpoints with version tags by domain.

---

<a id="18-real-loan-end-to-end-case-study"></a>
## 18 — John Smith Case Study (full text)

# 18 — Real Loan End-to-End Case Study: John Smith

> **Running example** from [README](./README.md).  
> **Official anchors:** [Loan events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) · [Document Order](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order) · [Document Delivery](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery) · [EPC](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect) · [Workflow Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks) · [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions)

| Attribute | Value |
|-----------|-------|
| Borrower | John Smith |
| Purpose | Purchase |
| Property value | $500,000 |
| Loan amount | $400,000 |
| Program | Conventional 30-year fixed |
| Loan Officer | Mike |
| Processor | Sarah |
| Underwriter | Robert |
| Closing Coordinator | Lisa |
| Title | ABC Title |
| Appraisal | XYZ Appraisal |

**Illustrative loan GUID:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890` — replace with actual `loanId` from create response.

**Legend:** Steps cite **documented** APIs and webhook events. Narrative timing and some field values are **illustrative** for teaching.

---

## Lifecycle overview (22 steps)

| Step | Phase | Primary object |
|------|-------|----------------|
| 1–2 | Origination | Loan, Milestone |
| 3–4 | Application | Loan data, EPC ServiceOrder |
| 5–7 | Verification | Conditions, eFolder, EPC |
| 8–11 | Initial disclosure | DocumentOrder, DocumentDelivery |
| 12–15 | Processing / UW prep | Milestone, Conditions |
| 16–18 | Underwriting | Workflow Task, Milestone |
| 19–20 | Closing disclosure | DocumentOrder |
| 21–22 | Funding / post-close | Milestone, Trade (if correspondent) |

---

### Step 1 — Loan file created

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `Loan` (new file) |
| **Actor** | Mike (Loan Officer) |
| **API** | `POST /encompass/v3/loans` (**V3**) — [Create Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/create-loan-1) |
| **Fields (illustrative)** | Borrower name, loan purpose purchase, template set from lender config |
| **Webhook** | `eventType: create` · `resourceType: Loan` · Support: API |
| **resourceRef** | `/encompass/v3/loans/{loanId}` |
| **Comments** | None yet |
| **Downstream** | Bank CRM receives create event → creates shadow loan record; pipeline sync job indexes `loanId` |

**Illustrative webhook envelope:**

```json
{
  "eventId": "step-01-event-id",
  "eventTime": "2026-08-01T09:00:00.000Z",
  "eventType": "create",
  "meta": {
    "userId": "mike",
    "resourceType": "Loan",
    "resourceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "instanceId": "BE11105680",
    "resourceRef": "/encompass/v3/loans/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

If EFC enabled: large `enhancedfieldchange` with all initial loan fields (may chunk — see [13-webhooks-events.md](./13-webhooks-events.md)).

---

### Step 2 — Milestone "Started" logged

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Loan `milestoneLogs` / Milestone |
| **Actor** | Mike or Automation (workflow rule) |
| **API** | `PATCH /encompass/v3/loans/{loanId}` (milestone fields) or milestone via loan update |
| **Webhook** | `eventType: milestone` · subevent `updateMilestones` · title `"Started"` |
| **Comments** | — |
| **Downstream** | Origination dashboard shows loan in Started; SLA clock begins |

---

### Step 3 — Application data captured (1003)

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Loan `applications[0]` borrower/coborrower, property, loan terms |
| **Actor** | Mike |
| **API** | `PATCH /encompass/v3/loans/{loanId}` · `view=entity` — [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| **Fields (documented EFC examples)** | Field `36#2` borrower first name → `"John"`; `37#2` last name → `"Smith"`; loan amount fields per schema |
| **Webhook** | `update` and/or `enhancedfieldchange` with `fieldChangeEvents` |
| **Comments** | Conversation log entry (if added) — editable log via loan `view=log` |
| **Downstream** | Pricing engine eligibility check; DTI calc in bank analytics |

---

### Step 4 — Credit report ordered (EPC)

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `ServiceOrder` (EPC) |
| **Actor** | Mike |
| **API** | EPC order via Encompass Partner Connect UI/API (order must be via EPC for webhook) |
| **Webhook** | `eventType: placed` · `resourceType: ServiceOrder` · extra: `partnerId`, `productId`, `productListingName` |
| **Comments** | — |
| **Downstream** | Vendor SLA timer; credit auth audit stored |

---

### Step 5 — Credit fulfilled; income condition auto-created

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `ServiceOrder` → fulfilled; Loan `conditions` |
| **Actor** | EPC vendor (fulfill) · Automation (condition template) |
| **API** | Response ingested by Encompass; condition may appear via `GET /encompass/v3/loans/{loanId}/conditions` |
| **Webhook** | EPC: `fulfilled` · Loan: `condition` with `createConditions` subevent |
| **Fields** | Condition title e.g. income documentation (lender template name) |
| **Comments** | — |
| **Downstream** | Processor queue adds "Income - W2" work item; fraud service notified |

**Illustrative condition webhook fragment** (from official sample pattern):

```json
"createConditions": [{
  "id": "cond-income-guid",
  "title": "Income - W2 and paystubs",
  "type": "Underwriting"
}]
```

---

### Step 6 — Appraisal ordered (EPC)

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `ServiceOrder` — XYZ Appraisal product |
| **Actor** | Sarah (Processor) |
| **Webhook** | `placed` on ServiceOrder |
| **Downstream** | AMC integration tracks order id; milestone task optional |

---

### Step 7 — Appraisal received in eFolder

| Dimension | Detail |
|-----------|--------|
| **Object changed** | eFolder `document` + `attachment` |
| **Actor** | XYZ Appraisal (fulfillment) · Sarah |
| **API** | Attachment create/assign via V3 eFolder APIs — [Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1) |
| **Webhook** | Loan `attachment` · `attachmentCreated`; Loan `document` · `assignAttachmentsToDocument`, `documentStatusUpdates` (status `received`) |
| **Comments** | — |
| **Downstream** | AUS re-run trigger; property value fields updated in loan |

---

### Step 8 — Processor assigned; associates updated

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Loan associates / file contacts |
| **Actor** | Mike assigns Sarah |
| **API** | `PATCH /encompass/v3/loans/{loanId}` (contacts/associates entities) |
| **Webhook** | `update` or `enhancedfieldchange` on associate fields |
| **Downstream** | Sarah appears in bank workload UI; `userId` on future events = `sarah` |

---

### Step 9 — Opening disclosure audit completed

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `DocumentOrder` (opening workflow) |
| **Actor** | Sarah |
| **API** | Opening disclosure order flow — [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages) |
| **Webhook** | `eventType: openingauditcompleted` · `resourceType: DocumentOrder` |
| **payload** | Includes `loanId` in extra payload — [Extra Payload DocumentOrder](https://developer.icemortgagetechnology.com/developer-connect/reference/extra-payload-attributes-documentorder) |
| **Downstream** | Compliance queue: audit passed → proceed to order |

---

### Step 10 — Opening document order completed

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `DocumentOrder` |
| **Actor** | System (async doc gen) |
| **Webhook** | `openingordercompleted` |
| **Downstream** | LE package ready for delivery channel selection |

---

### Step 11 — Opening delivery completed (eDelivery)

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `DocumentDelivery` package + `DocumentOrder` delivery |
| **Actor** | John Smith (borrower eSign) |
| **Webhook** | `openingdeliverycompleted` (DocumentOrder); `packageupdated` (DocumentDelivery) with recipient `taskStatuses`, `consent` |
| **API** | Package ref: `/delivery/v3/loans/{loanId}/packages/{packageId}` |
| **Comments** | Borrower may add conversation log after viewing disclosures |
| **Downstream** | TRID clock fields updated; marketing automation "disclosures signed" |

---

### Step 12 — Milestone "Qualification" completed

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Milestone log — Qualification `doneIndicator` |
| **Actor** | Sarah |
| **Webhook** | `milestone` · `updateMilestones` or `finishMilestones` · title `"Qualification"` |
| **Downstream** | Bank loan status → "Processing"; investor eligibility rules evaluated |

---

### Step 13 — Underwriting conditions created

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Enhanced `conditions` |
| **Actor** | Robert (Underwriter) |
| **API** | `POST /encompass/v3/loans/{loanId}/conditions` — [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions) |
| **Webhook** | Loan `condition` · `createConditions` |
| **Fields (illustrative)** | `priorTo: "Funding"`, `status: "Requested"`, `assignedTo: Sarah` |
| **Downstream** | Condition aging SLA starts (`age`, `daysToReceive` on GET) |

---

### Step 14 — Document assigned to condition

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Condition ↔ eFolder document link |
| **Actor** | Sarah |
| **API** | `PATCH` condition or assign document API per enhanced conditions set |
| **Webhook** | `assignDocumentsToConditions` in Loan `condition` event |
| **Downstream** | UW queue shows linked appraisal PDF |

---

### Step 15 — Condition status → Received

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Condition tracking |
| **Actor** | Sarah |
| **Webhook** | `updateStatusTrackingInConditions` · status `["Received"]` |
| **API** | `GET .../conditions?view=Detail` for tracking array |
| **Downstream** | UW notified; condition age paused toward cleared |

---

### Step 16 — Workflow task created for UW review

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `Task` |
| **Actor** | Automation or Robert |
| **API** | `POST /workflow/v1/tasks?templateId={id}` — [Create a Task](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-task) |
| **Webhook** | `resourceType: Task` · `eventType: create` |
| **workEntity** | `urn:elli:encompass:loan` · `entityId` = loan GUID |
| **Downstream** | Robert's task pipeline (`GET /workflow/v1/taskPipeline`) |

---

### Step 17 — Task comment added

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `TaskComment` |
| **Actor** | Sarah |
| **Webhook** | `resourceType: TaskComment` · `eventType: update` · `commentText` in `modifiedAttributes` (24.2+) |
| **resourceRef** | `workflow/v1/comments/{commentId}` |
| **Downstream** | UW sees "Updated income docs in eFolder" without opening Encompass |

---

### Step 18 — Milestone Submittal / UW milestone

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Milestone — e.g. "Submittal" or lender UW milestone name |
| **Actor** | Sarah |
| **Webhook** | `milestone` · `finishMilestones` |
| **Downstream** | Bank status → "In underwriting"; core system hold code cleared |

---

### Step 19 — Closing disclosure order completed

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `DocumentOrder` closing workflow |
| **Actor** | Lisa (Closing Coordinator) |
| **Webhook** | `closingordercompleted` |
| **API** | Closing order via encompassdocs — [Document Order webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order) |
| **Downstream** | Closing calendar sync; CD issued to borrower channel |

---

### Step 20 — Closing delivery completed

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `DocumentOrder` + `DocumentDelivery` |
| **Actor** | John Smith (eSign CD) |
| **Webhook** | `closingdeliverycompleted`; `packageupdated` with `ESign` task completed |
| **Scheduler (optional)** | Reg-Z waiting timer may have fired earlier — `Timer` `completed` if configured |
| **Downstream** | Clear to close in title company portal; wire instructions workflow |

---

### Step 21 — Funding milestone / loan funded

| Dimension | Detail |
|-----------|--------|
| **Object changed** | Milestone "Funding" or "Completion"; funding fields |
| **Actor** | Lisa / funder |
| **API** | `PATCH /encompass/v3/loans/{loanId}` — funding date, investor fields (lender config) |
| **Webhook** | `milestone` finish + `enhancedfieldchange` on funding fields |
| **Downstream** | **Core banking** books loan; boarding to servicing system |

---

### Step 22 — Post-closing (trade assignment / eFolder / logs)

| Dimension | Detail |
|-----------|--------|
| **Object changed** | `Trade` (if correspondent) OR post-close eFolder documents OR conversation logs |
| **Actor** | Capital markets / post-close team |
| **API** | Trade assignment APIs; `PATCH` loan post-close fields |
| **Webhook (correspondent)** | `Loan Assignment Complete` on Trade resource — [Trades](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades) |
| **Webhook (documents)** | Loan `document` · closing docs to eFolder (`closingaddtoefoldersucceeded` on DocumentOrder) |
| **Comments** | Post-close conversation log — loan `view=log` |
| **Downstream** | Investor delivery file; HMDA LAR extract; retention archive |

---

## Event correlation matrix (John Smith loan)

| Step | eventType / resource | resourceType |
|------|----------------------|--------------|
| 1 | `create` | Loan |
| 2, 12, 18, 21 | `milestone` | Loan |
| 3, 8, 21 | `update` / `enhancedfieldchange` | Loan |
| 4, 6 | `placed` | ServiceOrder |
| 5 | `fulfilled` + `condition` | ServiceOrder + Loan |
| 7 | `attachment`, `document` | Loan |
| 9–11 | `opening*` | DocumentOrder / DocumentDelivery |
| 13–15 | `condition` | Loan |
| 16 | `create` | Task |
| 17 | `update` | TaskComment |
| 19–20 | `closing*` | DocumentOrder / DocumentDelivery |
| 22 | `Loan Assignment Complete` | Trade |

---

## API call sequence (integration blueprint)

```
POST /oauth2/v1/token
POST /encompass/v3/loans                          → Step 1
PATCH /encompass/v3/loans/{id}                    → Steps 3, 8, 21
POST EPC order (via Partner Connect)              → Steps 4, 6
GET /encompass/v3/loans/{id}/conditions           → Steps 5, 13–15
POST /workflow/v1/tasks                           → Step 16
Document order APIs (encompassdocs/v1)            → Steps 9–11, 19–20
GET /workflow/v1/taskPipeline                     → Step 17 (UW view)
```

All webhook steps: validate `Elli-Signature` → enqueue → reconcile via `resourceRef` ([13-webhooks-events.md](./13-webhooks-events.md)).

---

## Teaching points

1. **One borrower journey** touches Loan, EPC, DocumentOrder, DocumentDelivery, Conditions, Tasks — plan **multiple subscriptions** (≤25 limit).
2. **Sarah vs Robert vs Lisa** appear as `meta.userId` — preserve for audit.
3. **Failed steps** (`openingauditfailed`, `closingdeliveryfailed`, EPC `Process Failure`) need compensating workflows — subscribe to failure events explicitly.
4. **Post-close** may never fire webhooks if activity is manual field updates only — periodic reconciliation still required.

---

## What this case study does not establish

- Exact milestone names (lender-configurable)
- Specific field IDs for loan amount on your instance (use [V3 Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1))
- Whether John Smith loan uses enhanced conditions (`useEnhancedConditionIndicator`)
- Calendar dates for TRID — bank compliance interprets regulatory timing
