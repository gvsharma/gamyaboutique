# Events, Webhooks, and Integration Model

## Event-driven architecture

Encompass Developer Connect supports **webhooks** — real-time push notifications when subscribed events occur on platform resources.

Official guidance (SDK migration docs):

> Shift to Event-Driven Architecture by subscribing to webhook events.

Webhook categories documented:

- Loan
- Document Delivery
- Document Order
- Enhanced Conditions
- Orgs and Users
- Encompass Partner Connect (EPC)
- Schedulers
- Trades
- Workflow Tasks
- Data & Document Automation (DDA) — limited availability

---

## Core concepts

| Concept | Description |
|---------|-------------|
| **API request** | Synchronous call returning current state |
| **State change** | Mutation in Encompass (user or API) |
| **Webhook event** | Async notification that a state change occurred |
| **Current resource state** | Authoritative truth from GET API |
| **Historical log** | Point-in-time or append-only record |

### Webhook ≠ current truth

A webhook signals **that something happened**. It may include partial extra payload, but integrators must **fetch current resource state** for dashboard accuracy.

---

## Standard webhook payload

Every notification includes:

| Attribute | Description |
|-----------|-------------|
| `eventId` | Unique event ID — use for idempotency |
| `eventTime` | ISO 8601 timestamp |
| `eventType` | Event type (Create, Update, milestone, etc.) |
| `meta.userId` | User who generated event |
| `meta.resourceType` | Resource type (Loan, etc.) |
| `meta.resourceId` | Resource identifier (loan GUID) |
| `meta.instanceId` | Encompass environment ID |
| `meta.resourceRef` | URL to fetch full resource |
| `meta.payload` | Extra payload when supported |

Notifications are signed (base64 signature header) — verify via Signing Keys API.

---

## Integration pattern (recommended)

```
Encompass
   |
   | POST webhook
   v
Event Receiver (your HTTPS endpoint)
   |
   v
Queue (SQS, RabbitMQ, etc.)
   |
   v
Processor (worker)
   |
   | GET current resource (meta.resourceRef)
   v
Update Internal Database (dashboard)
```

### Why this pattern

| Challenge | Mitigation |
|-----------|------------|
| **Duplicates** | Dedupe on `eventId` |
| **Retries** | Idempotent processing; safe to retry GET |
| **Ordering** | Events may arrive out of order — use `eventTime` + reconcile |
| **Eventual consistency** | Webhook arrives before downstream systems sync — always GET |
| **Idempotency** | Store processed `eventId`; upsert by resource version |
| **Reconciliation** | Periodic batch GET for drift detection |

---

## Loan resource events (selected)

| eventType | Description | Support |
|-----------|-------------|---------|
| `create` | New loan started | API |
| `update` | Loan file updated | Smart Client, API |
| `submit` | Consumer Connect submit | Consumer Connect |
| `move` | Loan moved between folders (incl. trash soft delete) | Smart Client, API |
| `document` | Document subevents (create, update, assignAttachments) | API |
| `attachment` | Attachment created | API |
| `condition` | Enhanced condition subevents | API |
| `milestone` | updateMilestones, finishMilestones | API |
| `change` | Filtered attribute changes | Smart Client, API |
| `fieldchange` | Specified field changes | API |
| `enhancedfieldchange` | All field changes with previous/new values (EFC) | API |
| `lock` / `unlock` | Exclusive loan lock | Smart Client, API |
| `delete` | Permanent loan deletion | Smart Client, API |
| `disclosureTracking` | Enhanced disclosure log create/update | API (Beta Only) |
| `alertchange` | Compliance loan alerts | Smart Client, API (Limited) |

Smart Client may also trigger API-marked events when enhancedfieldchange, Task Based Workflow rules, or DDA enabled.

---

## EFC (Enhanced Field Change)

`enhancedfieldchange` webhook events include:

- `modifiedField`, `parentFieldId`
- `encompass.previousValue` / `encompass.newValue`
- `v3LoanModel.previousValue` / `v3LoanModel.newValue`

Key behaviors (official):

- Subscribing causes webhooks on **all** loan field change events
- Virtual fields require field IDs in **Encompass Reporting Database**
- Field does **not** have to be in Audit Trail Database
- See *EFC Webhook User and Setup Guide* before subscribing

Example payload excerpt:

```json
{
  "eventType": "enhancedfieldchange",
  "meta": {
    "resourceRef": "/encompass/v3/loans/{loanId}/enhancedFieldChange",
    "payload": {
      "event": {
        "fieldChangeEvents": [
          {
            "modifiedField": "36#2",
            "parentFieldId": "36",
            "encompass": {
              "previousValue": "",
              "newValue": "John"
            }
          }
        ]
      }
    }
  }
}
```

### fieldchange vs enhancedfieldchange

| Feature | fieldchange | enhancedfieldchange |
|---------|-------------|---------------------|
| Filter fields | Yes (subscription filters) | All changes when subscribed |
| Previous value | NOT in standard fieldchange payload | Yes |
| Cascading fields | Includes fields updated as result of subject field | Includes all changed fields |
| Payload size limit | May not deliver if loan payload > 250 KB (known issue, check release notes) | Same consideration |

---

## Condition webhook subevents

`eventType: condition` extra payload may include:

- `createConditions`
- `updateStatusTrackingInConditions`
- `assignDocumentsToConditions`
- `addCommentsToConditions`
- `documentStatusUpdates`

---

## Milestone webhook subevents

- `updateMilestones` — milestone updated (id, title)
- `finishMilestones` — milestone completed

Use to trigger task assignment automation (per SDK migration guide example).

---

## Workflow Task webhooks

Separate webhook category with Task, Subtask, Task Group, Task Comment events.

Task Comment Update fires when comment added to workflow task.

---

## EPC (Encompass Partner Connect)

Webhook category for partner service orders. EPC integrates third-party services into Encompass workflows.

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** in this knowledge base: full EPC domain object model — consult [EPC webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect) for event list.

---

## DDA (Data & Document Automation)

Formerly AIQ. Webhook category with **limited availability** for DDA customers.

Smart Client loan updates may trigger loan webhooks when DDA enabled.

---

## Schedulers

Webhook category for scheduler resource events — used for scheduled platform operations.

Consult [Schedulers webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers) for supported events.

---

## Trades

Secondary marketing trades have dedicated APIs and webhooks. Correspondent trade note changes trigger "Trade Updated" history events.

Endpoints: `/secondary/v1/trades/...`

---

## Subscription management

| API | Purpose |
|-----|---------|
| `POST /webhook/v1/subscriptions` | Create subscription |
| Resources API | List available resources and events |
| Signing Keys API | Manage signature verification keys |

Maintenance note (official): ICE deletes bad subscriptions (>30 days old, >1000 events/week, 5XX/timeouts).

---

## Lock/unlock events

Important (official):

> Webhook notifications are not guaranteed to be in real-time. There will be a delay... potential for an intervening lock event between notification and your application's attempt to gain a new lock.

Lock webhooks reduce polling but do **not** eliminate lock retry logic.

---

## John Smith dashboard integration example

| Event received | Processor action |
|----------------|------------------|
| `milestone` / updateMilestones "Processing" | GET milestones; show Sarah as active associate |
| `condition` / createConditions | GET conditions; add row to conditions dashboard |
| `document` / assignAttachmentsToDocument | GET documents; refresh paystub status |
| `enhancedfieldchange` field 1109 (Loan Amount) | Update loan summary card |
| `workflow task` Update | GET task pipeline for assignee |

---

## References

- [Webhooks Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
- [Loan Webhook Events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
- [Default Payload Attributes](https://developer.icemortgagetechnology.com/developer-connect/reference/default-payload-attributes)
- [Subscriptions API](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions)
- [SDK to API Migration Guide](https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide)
