# 13 — Webhooks and events

**Related:** [03 EFC](./03-loan-schema-and-fields.md) · [15 Architecture](./15-production-integration-architecture.md)

**Official:** [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) · [Default payload attributes](https://developer.icemortgagetechnology.com/developer-connect/reference/default-payload-attributes) · [Subscriptions](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions) · [Resources](https://developer.icemortgagetechnology.com/developer-connect/reference/resources) · [Loan events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)

---

## A. Business meaning

Webhooks **notify** your app that something happened. They are **not** the loan’s current truth. ICE: notifications are **not guaranteed real-time**; lock/unlock docs warn of delay and intervening locks.

## B. John Smith (illustrative volume — not a limit)

One purchase file can emit **workload-dependent** notifications: many EFC field changes, several condition transitions, document/attachment events, task create/update, milestone update/finish, disclosure delivery. **One business action can cause multiple events.** There is **no documented universal cap**. Do not invent “max 500 events per loan.”

## C. Subscription model (documented)

A subscription specifies:

- **resource**
- **events**
- **callback endpoint** (ICE POSTs JSON)
- **signing key**

Manage via Subscriptions API; discover via Resources API.

## Documented resource catalog (overview page)

| Resource | Notes |
|----------|--------|
| Loan | See event table below |
| Document Delivery | Extra payload on some package events |
| Document Order | Confirm events on category page |
| Enhanced Conditions | Templates/types; may need support ticket + subscribe |
| Organizations & Users | Identity |
| EPC | Partner Connect |
| Schedulers | Time-based |
| Trades | Secondary |
| Workflow Tasks | Task / subtask / task group Create-Update-Delete |
| DDA | **Limited availability for DDA customers**; DDA Platform Webhook API; contact CSM/RM |

## D–F. Default payload (documented)

Every notification includes:

| Attribute | Meaning |
|-----------|---------|
| `eventId` | Unique id; “ensures events are only digested once” |
| `eventTime` | ISO-8601 when the event occurred |
| `eventType` | Type; loan examples listed: Create, Update, Submit, Change, Move, Document, Milestone (overview table — **also see specific names on Loan page**) |
| `meta.userId` | User that generated the event |
| `meta.resourceType` | Resource type |
| `meta.resourceId` | e.g. loan GUID |
| `meta.instanceId` | Encompass environment id |
| `meta.resourceRef` | URL to fetch the full resource |

**Official sample (loan create-style):**

```json
{
  "eventId": "243e4b32-5032-4376-bd6a-a8207c068387",
  "eventTime": "2016-12-01T21:38:39.2696988Z",
  "eventType": "Create",
  "meta": {
    "userId": "jsmith",
    "resourceType": "Loan",
    "resourceId": "10d191c3-c97b-48a8-82d9-88c337ae9fd8",
    "instanceId": "be********",
    "resourceRef": "/encompass/v1/loans/10d191c3-c97b-48a8-82d9-88c337ae9fd8"
  }
}
```

Note `resourceRef` in this sample is **V1** even for events that also have V3 resources. Fetch using the version you have standardized on; do not assume Ref version == your integration version.

## Loan events (documented)

| Event | Description | Support notes |
|-------|-------------|---------------|
| `create` | New loan started | API; Smart Client may also if EFC / task workflow / DDA enabled (ICE caveat) |
| `update` | Loan file updated | Smart Client, API |
| `submit` | Submitted via Consumer Connect **Submit button only** | Consumer Connect |
| `move` | Folder change; extra payload previous/new folder; **soft delete if trash** | Smart Client, API |
| `document` | createDocuments, updateDocuments, assignAttachmentsToDocument | API |
| `attachment` | attachmentCreated | API |
| `condition` | Enhanced Conditions; subevents create, update, assign, assignDocument, remove, comment, status change | API |
| `reportingdbupdate` | **Internal Use Only** | n/a |
| `milestone` | updateMilestones, finishMilestones | API |
| `milestoneupdate` | **Internal Use Only** | n/a |
| `change` | Specified attributes; subscribe filters | Smart Client, API |
| `fieldchange` | Specified field + resultant fields; filters.attributes | API |
| `enhancedfieldchange` | Previous/new values; all field changes if subscribed; virtual fields need Reporting DB; read EFC guide | API |
| `delete` | Permanently deleted | Smart Client, API |
| `lock` / `unlock` | Exclusive lock/unlock; not real-time | Smart Client, API |
| `alertchange` | Compliance alerts open/cleared; alert must be enabled; **Limited Availability** | Smart Client, API |
| `disclosureTracking` | Enhanced disclosure tracking log create/update | **API (Beta Only)** |

## G. Field table — integration keys

| Field | Persist | Why |
|-------|---------|-----|
| eventId | Yes, unique | Idempotency |
| eventTime | Yes | Timeline sort (not guaranteed order) |
| eventType | Yes | Routing |
| resourceRef | Optional | Hint to GET |
| raw payload | If audit/replay requires | PII |

Signing: validate with subscription signing key. Exact header/algorithm: **confirm current webhook security page** (do not invent HMAC details).

Retries / duplicate POSTs: ICE emphasizes digesting once via eventId. Exact retry schedule: **NOT ESTABLISHED** on overview page reviewed. Design for duplicates anyway.

Chunking: EFC large payloads — see EFC guide; hard limits **NOT ESTABLISHED** here.

Ordering: not guaranteed. Delayed delivery: documented for locks; assume generally.

## H. Required processing lifecycle

```text
Receive webhook
  -> Validate signature
  -> Deduplicate eventId
  -> Persist raw event
  -> Queue
  -> Process async
  -> Fetch current resource if needed (meta.resourceRef / V3 GET)
  -> Update downstream
  -> Record success/failure
```

## I. Event volume

Workload-dependent. EFC on all field changes is the usual volume driver. Condition rework multiplies `condition` notifications. Do not size from a single loan anecdote as an SLA.

## J–K. Architecture / production

See [15](./15-production-integration-architecture.md). Idempotent, async, replayable, observable, PII-aware, duplicate/out-of-order tolerant.

## L. Common mistakes

1. Trusting payload as current state.
2. Subscribing to internal-only events.
3. Using beta `disclosureTracking` as sole compliance trigger.
4. Ignoring `submit`’s Consumer Connect-only trigger.
5. No signature validation.

## M. Questions

1. Why can `resourceRef` be V1 while you GET V3?
2. What happens if you process EFC without GET under out-of-order delivery?
3. How do you detect trash vs permanent delete?
