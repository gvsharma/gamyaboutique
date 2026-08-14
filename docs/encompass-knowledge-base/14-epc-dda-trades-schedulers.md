# 14 — EPC, DDA, Trades, and Schedulers

> **Official sources:** [Webhook Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) · [EPC](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect) · [DDA](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-dda) · [Trades](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades) · [Schedulers](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers)

This page summarizes **external-domain** webhook categories that sit beside core loan manufacturing. For ingestion patterns, signing, retries, and deduplication, see [13-webhooks-events.md](./13-webhooks-events.md).

---

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
| `partnerId` | EPC partner identifier |
| `productId` | EPC product identifier |
| `productListingName` | Partner product listing name |

`resourceRef` pattern: `/encompass/v3/loans/{loanId}/serviceOrders/{serviceOrderId}/history/{eventId}`

### Transaction resource

Available for **EPC partners only**. Subscription instructions: [Partner Connect webhooks](https://docs.partnerconnect.elliemae.com/partnerconnect/docs/webhooks) (Partner Connect portal — separate from Developer Connect lender docs).

### Bank integration use cases

- Auto-advance workflow when appraisal `Fulfilled`
- Alert ops on `Process Failure` / `System Failure`
- Correlate vendor SLA metrics by `partnerId` + `productId`

---

## Data & Document Automation (DDA)

> **Limited availability for DDA customers**

Source: [DDA webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-dda).

Lenders using **ICE Data & Documentation Automation** (formerly AIQ) with Encompass subscribe via the **DDA Platform Webhook API only** — not the standard lender `POST /webhook/v1/subscriptions` flow for these resources. Contact ICE MT CSM/RM for enrollment.

### DDA webhook resources

| Resource | Represents |
|----------|------------|
| **AnalyzerDocumentValidationResult** | Document validation status from AIQ Analyzers, including invalid reasons |
| **AnalyzerResult** | State of an Analyzer process (eligibility, document processing, checklist rules, data mapping, applicant association) |
| **DataSource** | Data source lifecycle state |
| **Document** | Document lifecycle state |
| **eFolder** | Loan eFolder lifecycle state |
| **ReceivedMailItem** | Received mail item lifecycle state |

### Relationship to Loan webhooks

Official Loan event documentation notes Smart Client updates may trigger loan webhooks when the instance is enabled for **DDA (formerly AIQ)** — DDA activity can indirectly surface through Loan resource events depending on instance configuration.

### Bank integration use cases

- Drive automated income/asset verification workflows from Analyzer results
- Route invalid documents back to borrower portals
- Sync mail-room ingestion status to processor work queues

---

## Trades

**What it is:** Correspondent lending trade management — bundling loans for sale/delivery to investors.

**Webhook resource:** `Trade`

Source: [Trades](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades).

### Trade events

| Event | Description | Support |
|-------|-------------|---------|
| `Create` | Trade created | API |
| `Publish` | Trade published | API |
| `Update` | Loans assigned to correspondent trade updated | API |
| `Loan Assignment Complete` | Loan assigned to trade | API |

### Not supported

The Webhook API does **not** support **Update Status** and **Void** actions for the Trade resource at this time.

### Bank integration use cases

- Notify capital markets when `Publish` occurs
- Update warehouse line exposure on `Loan Assignment Complete`
- Reconcile investor delivery pipelines on `Update`

---

## Schedulers (Timer service)

**What it is:** Time-based workflow automation — schedulers fire at calculated `completionTime` based on loan data and Encompass Scheduler Templates.

Source: [Schedulers](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers).

### Prerequisites (lender configuration)

| Requirement | Purpose |
|-------------|---------|
| Active **Scheduler Template** | Calculates `completionTime` from loan fields |
| Active **Workflow Rules** | Start, cancel, or act on scheduler completed events |
| Encompass Admin configuration | Templates/rules in Encompass Web or Desktop |

Loan-level scheduler events can be triggered from Encompass Desktop, Encompass Web, or API.

### Scheduler events

| Event | Description |
|-------|-------------|
| `Created` | Scheduler started; payload includes future `completionTime` |
| `Completed` | Fired at `completionTime` |
| `Changed` | Scheduler modified; `completionTime` may differ from Created event |
| `Cancelled` | Completed event will **not** fire |

**`meta.resourceType`:** `Timer` (enum), not "Scheduler".

### Key payload fields

| Field | Meaning |
|-------|---------|
| `name` / `description` | Scheduler template used |
| `completionTime` | When Completed event will fire |
| `status` | `active`, `cancelled`, `completed` |
| `associations` | Links to `loanguid` and workflow `rule` entities |
| `userId` / `createdBy` | User or `Automation` |

### Bank integration use cases

- Reg-Z waiting period expiration (`completionTime` driven)
- Auto-create workflow tasks when scheduler `Completed`
- Escalation if expected scheduler never fires (monitor Created without Completed)

### Further reading

Encompass Scheduler Best Practices Guide — Resource Center Article 000115625 (requires ICE Resource Center login per [Welcome docs](https://developer.icemortgagetechnology.com/developer-connect/docs/welcome)).

---

## Quick comparison

| Domain | Webhook resourceType | Primary trigger | Limited availability? |
|--------|---------------------|-----------------|----------------------|
| EPC | `ServiceOrder` | Partner service order via EPC | No (EPC orders only) |
| DDA | Multiple (Analyzer, Document, eFolder, …) | DDA platform events | **Yes** — DDA customers |
| Trades | `Trade` | Correspondent trade lifecycle | No |
| Schedulers | `Timer` | Time-based workflow rules | No (requires admin templates) |

---

## Cross-reference to core loan events

Many external-domain outcomes also change the loan file (documents in eFolder, conditions, milestones). Subscribe to **Loan** resource events (`document`, `condition`, `milestone`, `enhancedfieldchange`) in parallel with domain-specific subscriptions when downstream systems need loan-level correlation.
