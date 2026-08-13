# 16 — Bank Product Engineering

> **Audience:** Bank engineers, product owners, and integration architects building on Encompass Developer Connect.  
> **Official sources:** [Welcome](https://developer.icemortgagetechnology.com/developer-connect/docs/welcome) · [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) · [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions) · [Workflow Task Service](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy) · [Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)

---

## What bank product engineers own

| Layer | Your responsibility |
|-------|---------------------|
| **Domain** | Map Encompass objects (loan, condition, task, disclosure) to bank products and policies |
| **Integration** | OAuth, locks, webhooks, idempotency, PII — see [15-production-integration-architecture.md](./15-production-integration-architecture.md) |
| **Operations** | SLAs, queues, escalation when Encompass or vendor events fail |
| **Compliance** | Disclosure timing, condition clearing, audit attribution (`userId`, `eventTime`) |

Encompass is the **system of record for loan manufacturing**; your bank systems (core, CRM, pricing, warehouse) are **consumers or peers** that must reconcile through APIs and events.

---

## Domain mental model (product view)

```
Borrower journey
    │
    ▼
 LOAN FILE ─── milestones (Qualification → Processing → UW → Closing → Funded)
    │
    ├── DATA (1003, income, assets, property, product)
    ├── CONDITIONS (standard vs enhanced — lender config)
    ├── TASKS (processor/underwriter work units)
    ├── DOCUMENTS (eFolder: document → attachment)
    ├── DISCLOSURES (document order → delivery → tracking)
    ├── PARTNER ORDERS (EPC: credit, appraisal, title)
    └── EVENTS (webhooks → your orchestration)
```

**Product decision:** Which milestones and condition types drive your bank's "loan status" customer-facing UI? Encompass milestone names are **lender-configurable** — do not hard-code without confirming instance setup.

---

## Enhanced conditions — product + engineering

Source: [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions).

| Concept | Product meaning | Engineering hook |
|---------|-----------------|------------------|
| `useEnhancedConditionIndicator` (ENHANCEDCOND.X1) | Loan uses enhanced vs standard conditions | Check before calling condition APIs |
| Condition type / category / priorTo / recipient | Business taxonomy | Filter `GET /encompass/v3/loans/{loanId}/conditions` |
| Tracking statuses | Requested → Received → Cleared pipeline | Loan `condition` webhook subevents |
| Comments (`isExternal`) | Borrower-visible vs internal | Task/condition comment APIs + webhooks |
| Age / `daysToReceive` | SLA measurement | Operational reporting |

### Condition aging (workload driver)

Enhanced conditions expose **age** and status dates in condition views (`Summary`, `Detail`, `Full`). Bank ops teams typically:

| Age bucket | Typical action |
|------------|----------------|
| 0–2 days | Normal queue |
| 3–5 days | Processor escalation |
| >5 days | Manager dashboard / borrower outreach |

**Webhook triggers:** Loan `condition` event with `updateStatusTrackingInConditions`, `addCommentsToConditions`, `assignDocumentsToConditions`.

**API reconciliation:** `GET /encompass/v3/loans/{loanId}/conditions?view=Detail` for authoritative status.

---

## Workflow tasks — workload model

Source: [Workflow Task Service overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy).

| Object | Product role |
|--------|--------------|
| **Task Template** | Admin-defined work pattern |
| **Task** | Assignable unit linked to loan (`workEntity`) |
| **Task Group** | Container for related tasks |
| **Subtask** | Steps within a task |
| **Task Comment** | Processor notes + disposition |

**Processor workload APIs:**

- `GET /workflow/v1/taskPipeline` — open tasks for user or user groups
- `GET /workflow/v1/tasks` — filtered task lists with pagination

**Webhook-driven refresh:** `Task`, `Subtask`, `TaskGroup`, `TaskComment` resource events — see [13-webhooks-events.md](./13-webhooks-events.md).

---

## Disclosure and document product flows

| Flow | Webhook resource | Product milestone |
|------|------------------|-------------------|
| Initial disclosures | `DocumentOrder` opening* events | LE sent / acknowledged |
| Closing disclosures | `DocumentOrder` closing* events | CD issued |
| eDelivery / eSign | `DocumentDelivery` package* events | Borrower completion |
| eFolder receipt | Loan `document` / `attachment` | Document indexed |

*Event names like `openingdeliverycompleted` — see [14-epc-dda-trades-schedulers.md](./14-epc-dda-trades-schedulers.md).

**Product SLA example (illustrative — set per bank policy):**

| Milestone | Target | Measurement |
|-----------|--------|-------------|
| LE delivery | 3 business days from app | `openingdeliverycompleted` webhook + field dates |
| CD delivery | 3 business days before closing | Scheduler `completionTime` + closing events |
| Condition clearing | Per `daysToReceive` on condition | Condition age API fields |

Official timing rules (TRID, etc.) are regulatory — Encompass provides **timestamps and events**; legal interpretation is bank compliance.

---

## SLA and operational metrics

| Metric | Source | Notes |
|--------|--------|-------|
| Webhook delivery lag | `eventTime` − ingestion timestamp | ICE does not guarantee real-time |
| API error rate | 401/409/5xx on PATCH | Lock conflicts = 409 |
| Disclosure step failure | `*failed` document order events | Alert on `openingdeliveryfailed`, etc. |
| Vendor order SLA | EPC `ServiceOrder` Placed → Fulfilled | Per `partnerId` |
| Scheduler adherence | Timer Created → Completed delta | Missed if Cancelled |
| Pipeline freshness | Pipeline API vs loan GET | RDB async refresh |

---

## Personas and API users (engineering setup)

| Encompass persona capability | Why it matters |
|------------------------------|----------------|
| Subscribe to Webhook | Required for webhook subscriptions |
| Enhanced Field Change | EFC subscriptions — PII exposure |
| API loan access | Scoped to organization/loan folders |
| Workflow task access | Task pipeline visibility |

Coordinate with Encompass admin for **least-privilege API users** per integration (disclosure bot vs condition sync vs capital markets).

---

## Common engineering pitfalls

| Pitfall | Correct approach |
|---------|------------------|
| Treating webhook payload as truth | `GET` resource after event |
| Ignoring 409 on desktop-open loans | Retry, shared lock, or queue until unlock |
| Single `enhancedfieldchange` subscription without chunk handling | Implement `chunkId` assembly |
| Using Pipeline API immediately after webhook | RDB may lag — use loan GET for critical fields |
| >25 subscriptions | Consolidate events or use broader `update` + filter |
| 4xx response to ICE webhook | 4xx is **not retried** — event lost if not enqueued |

---

## Interview questions (with answer anchors)

### Domain

1. **What is the difference between an eFolder document and an attachment?**  
   Document = tracking folder in eFolder; attachment = file(s) assigned to document ([eFolder docs](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1)).

2. **When does a loan use Enhanced vs Standard conditions?**  
   `loan.useEnhancedConditionIndicator` / field ENHANCEDCOND.X1 ([Enhanced Conditions reference](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions)).

3. **What triggers an opening disclosure webhook?**  
   `DocumentOrder` resource events when opening audit/order/delivery steps complete or fail ([Document Order webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order)).

### Technical

4. **Why must webhook handlers return 200 quickly?**  
   30s timeout; 5xx triggers retry; slow handlers cause duplicate delivery attempts ([Retry Logic](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-retry-logic)).

5. **How do you deduplicate EFC chunked events?**  
   Assemble by `chunkId` + `multipartIndicator`; `eventId` differs per chunk ([EFC Features](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes)).

6. **When is an explicit resource lock required?**  
   Multi-call update sequences; single calls get session-less lock ([Loan Locks BP](https://developer.icemortgagetechnology.com/developer-connect/docs/loan-locks-bp)).

7. **What HTTP status from your webhook endpoint stops ICE retries?**  
   Any 200–499 ([Retry Logic](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-retry-logic)).

8. **Difference between `change`, `fieldchange`, and `enhancedfieldchange`?**  
   `change` = filtered loan JSON paths (≤50); `fieldchange` = specific field IDs + cascades; `enhancedfieldchange` = all fields with prev/new, no filters ([Loan events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)).

### Product / operations

9. **How would you measure condition aging?**  
   Condition API `age`, status dates, tracking; webhooks for status changes; bank-defined buckets.

10. **EPC vs non-EPC service order — webhook difference?**  
    Service Order webhooks only for orders via Encompass Partner Connect ([EPC webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect)).

11. **What is the max webhook subscriptions per lender?**  
    25 ([Webhooks BP](https://developer.icemortgagetechnology.com/developer-connect/docs/webhooks-bp)).

12. **How do Scheduler webhooks relate to workflow rules?**  
    Scheduler Template sets `completionTime`; Workflow Rules create/cancel/act on timers ([Schedulers](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers)).

---

## Onboarding path for new bank engineers

| Week focus | Activities |
|------------|------------|
| 1 — Domain | Read 01–06 KB sections; open loan in Encompass UI; map milestones |
| 2 — APIs | UAT API key; create loan V3; GET conditions, documents, tasks |
| 3 — Events | Subscribe to Loan `update` + DocumentOrder in UAT; trace one disclosure |
| 4 — Production patterns | Locks, idempotency, PII review; design one integration slice |

---

## Related knowledge base sections

| Section | Topic |
|---------|-------|
| [13](./13-webhooks-events.md) | Event architecture |
| [15](./15-production-integration-architecture.md) | OAuth, locks, idempotency |
| [17](./17-api-reference-cheatsheet.md) | Endpoint quick reference |
| [18](./18-real-loan-end-to-end-case-study.md) | John Smith lifecycle |
