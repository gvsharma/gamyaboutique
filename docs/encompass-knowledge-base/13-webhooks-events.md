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
