# 13 — Enhanced Field Change (EFC)

**Share this file when:** designing field-level sync, audit of value changes, or PII-sensitive event handling.

**Related:** [03 Loans](./03-loans.md) · [12 Webhooks](./12-events-and-webhooks.md) · [14 Architecture](./14-production-architecture.md)

---

## What EFC is

Enhanced Field Change events can report loan-level field changes including **previous and new values**.

ICE loan webhook documentation describes `enhancedfieldchange` as firing when a loan is created or a change occurs on a loan, with payload including:

- previous value of the field (before the change)
- new value of the field (after the change)

Related but different:

- `change` — specified attributes updated
- `fieldchange` — specified field change; ICE notes the notification can include the subject field plus other fields updated as a result; the subject field does not need to be in the Audit Trail Database

Confirm filter attributes (`filters.attributes` on subscribe) and payload shape in current ICE docs:

- [Create a Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-subscription)
- [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)

## Important concerns

- multiple field changes per event
- custom fields
- PII
- large payloads
- chunking
- event IDs
- idempotency
- delayed delivery
- reconciliation

**Do not assume a fixed maximum number of field changes for a loan.**

## Design implications

1. **Idempotency** — process by event ID; applying the same EFC twice must not corrupt downstream state.
2. **Not current truth** — previous/new values in the payload can be overtaken by later changes. Fetch the loan (appropriate `view`) when you need current values.
3. **PII** — field-change payloads may contain borrower data. Encrypt at rest, restrict logs, and minimize what is stored in analytics.
4. **Custom fields** — lender-defined fields will appear. Do not hardcode a closed field list unless the bank explicitly scopes the subscription filters.
5. **Chunking / large payloads** — plan for oversized notifications; confirm current ICE behavior for large EFC payloads rather than inventing limits.
6. **Reconciliation** — delayed or duplicated events require a periodic loan snapshot or query-based repair path.

## Processing pattern

```text
EFC notification
    |
Validate signature + event ID
    |
Store raw payload (if audit/replay requires it)
    |
Parse field changes (previous/new)
    |
Apply idempotently to downstream projection
    |
If projection is security-critical or PII-sensitive:
    fetch current loan entity
    |
Reconcile
```

Never assume one event equals one business action. A single user save can produce many field changes, possibly across more than one notification.

## Official documentation

- [Loan webhooks (fieldchange / enhancedfieldchange)](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
- [Create a Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-subscription)
- [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
