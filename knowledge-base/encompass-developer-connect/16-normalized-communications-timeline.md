# 16 — Normalized Communications and Timeline Model

**Share this file when:** the requirement is "retrieve all loan notes, comments, and communications."

**Related:** [11 Conversation logs vs comments](./11-conversation-logs-comments-notes.md) · [12 Webhooks](./12-events-and-webhooks.md) · [15 Illustrative timeline](./15-loan-timeline.md)

---

## There is not one universal endpoint

There is not necessarily one universal "get every comment" endpoint.

A bank integration may need to aggregate:

```text
Loan
 |
 +-- Conversation Logs
 |
 +-- Condition Comments
 |
 +-- Condition Tracking
 |
 +-- Task Comments
 |
 +-- Subtask Comments
 |
 +-- Document Comments
 |
 +-- Milestone Comments
 |
 +-- System Logs
 |
 +-- Other loan logs
```

Each source has its own API (or appears under loan `view=log` / `full`). Confirm current endpoints per object. Do not mix V1 and V3 bodies without mapping.

## Normalized timeline model

Build a downstream model such as:

```text
LoanTimelineEvent
-----------------
loanId
eventId
eventTime
eventType
resourceType
resourceId
actor
text
previousState
newState
source
rawPayload
```

This is an **integration projection**, not an Encompass resource. Field names above are the bank's model. Map from official ICE payloads; do not pretend Encompass returns this object.

### Suggested field usage

| Field | Use |
|-------|-----|
| `loanId` | Encompass loan identifier |
| `eventId` | Webhook event id or a deterministic hash of source + resource + time + type (document the choice) |
| `eventTime` | Best available timestamp from the source object |
| `eventType` | Normalized type (only after confirming source semantics) |
| `resourceType` | `loan`, `condition`, `task`, `document`, `milestone`, `conversationLog`, … |
| `resourceId` | Source object id |
| `actor` | User/associate if present; otherwise system |
| `text` | Comment body or communication text |
| `previousState` / `newState` | Tracking or EFC previous/new when available |
| `source` | API or webhook resource name |
| `rawPayload` | Optional; retain when audit/replay requires it |

## Normalized event types (candidates)

Then normalize events such as:

```text
FIELD_CHANGED
MILESTONE_UPDATED
MILESTONE_FINISHED
TASK_CREATED
TASK_COMPLETED
TASK_COMMENTED
CONDITION_CREATED
CONDITION_UPDATED
CONDITION_COMMENTED
CONDITION_TRACKING_CHANGED
DOCUMENT_ADDED
DOCUMENT_COMMENTED
CONVERSATION_LOG_CREATED
DISCLOSURE_DELIVERED
```

**Only use event names when confirmed by official documentation** for the webhook/API you are consuming.

The list above is a **downstream vocabulary**. Map ICE's actual event/subevent names into it explicitly. If ICE does not emit a given event, do not invent a subscription for it — derive the timeline row from a resource GET if the business still needs the row.

## Implementation outline

1. Define source adapters (conversation logs, conditions, tasks, documents, milestones, disclosure tracking, webhooks).
2. Map each source to `LoanTimelineEvent`.
3. Deduplicate on `eventId`.
4. Sort by `eventTime` with a stable tie-break (`source`, `resourceId`).
5. Do not assume webhook order equals timeline order.
6. Reconcile by re-fetching sources periodically.

## Official documentation

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/create-conversation-log)
- [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)
- [Workflow Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks)
- [Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents)
- [Disclosure Tracking](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015)
- [Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
