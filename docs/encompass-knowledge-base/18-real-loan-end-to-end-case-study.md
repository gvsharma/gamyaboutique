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
