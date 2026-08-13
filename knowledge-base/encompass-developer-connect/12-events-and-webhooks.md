# 12 — Events and Webhooks

**Share this file when:** designing the event intake path, subscriptions, or "real-time Encompass sync."

**Related:** [13 Enhanced Field Change](./13-enhanced-field-change.md) · [14 Architecture](./14-production-architecture.md) · [16 Timeline](./16-normalized-communications-timeline.md)

---

## Critical integration rule

```text
Webhook != necessarily current truth
```

A webhook notification says that something happened. It is not a guarantee of:

- latest resource state
- perfect ordering
- exactly-once delivery
- one business action per notification

Always design for **validate → persist → queue → fetch current state when required**.

## Webhook catalog (current resources to verify)

The current Developer Connect webhook catalog includes resources such as:

- Loan
- Document Delivery
- Document Order
- Enhanced Conditions
- Organizations & Users
- EPC
- Schedulers
- Trades
- Workflow Tasks
- DDA

Confirm the live catalog with the Resources API and ICE webhook docs. Resource lists change.

## Subscription model

A webhook subscription identifies:

- resource
- events
- callback endpoint
- signing key

ICE: when the specified event happens on the resource, a notification is POSTed as JSON to the callback URL.

A webhook notification includes event/resource information (including metadata such as resource references and event details). Confirm the current payload schema in ICE docs; do not hardcode unofficial field names.

Use:

- [Subscriptions API](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions) to create/manage subscriptions
- [Resources API](https://developer.icemortgagetechnology.com/developer-connect/reference/resources) to view available resources and events

Some resources (ICE documents this for Enhanced Conditions webhooks) may require a support ticket **and** a subscription before events flow.

## Loan resource events (examples from ICE; verify)

ICE loan webhook documentation includes events/subevents such as:

- loan create/update style events
- `attachment` / `attachmentCreated`
- `condition` subevents: create, update, assign, assignDocument, remove, comment, status change
- `milestone`: `updateMilestones`, `finishMilestones`
- `change` — specified attributes updated (filters on subscribe)
- `fieldchange` — specified field change (filters; payload can include other fields updated as a result)
- `enhancedfieldchange` — previous and new values (see [13](./13-enhanced-field-change.md))

Do not assume this list is complete or frozen. Some events are marked internal-use-only in ICE docs (for example certain reporting/milestoneupdate events). Do not subscribe to undocumented or internal-only events.

## Robust bank integration flow

```text
Receive webhook
    |
Validate signature
    |
Deduplicate using event ID
    |
Persist raw event
    |
Queue
    |
Process asynchronously
    |
Fetch current resource when required
    |
Update downstream state
    |
Record success/failure
```

### Why each step exists

| Step | Failure you avoid |
|------|-------------------|
| Validate signature | Forged callbacks |
| Deduplicate by event ID | Duplicate POSTs / retries |
| Persist raw event | Lost audit/replay evidence |
| Queue / async | Receiver timeouts; Encompass retries |
| Fetch current resource | Stale or partial notification payloads |
| Record success/failure | Silent drift; unreplayable errors |

Never assume event delivery is perfectly ordered or instantaneous (golden rule 7). Never assume one event equals one business action (golden rule 8).

## Official documentation

- [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
- [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
- [Enhanced Conditions webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions)
- [Subscriptions](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions)
- [Resources](https://developer.icemortgagetechnology.com/developer-connect/reference/resources)
