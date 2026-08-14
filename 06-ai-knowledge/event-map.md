# Event Map

## Purpose

**Webhooks and normalized timeline events** for integration and incident response.

## Scope

Event catalog. Full matrix → [master-event-matrix.md](./master-event-matrix.md).

## Key concepts

| Layer | Description | Classification |
|-------|-------------|----------------|
| Webhook notification | Async signal with eventId, eventTime, meta.resourceRef | **OFFICIAL_DOCUMENTATION** |
| GET reconciliation | Authoritative current state | **OFFICIAL_DOCUMENTATION** |
| Normalized timeline event | Dashboard `eventType` e.g. CONDITION_COMMENTED | **INTERNAL_ARCHITECTURE_RECOMMENDATION** |

## Webhook resource categories (OFFICIAL)

Loan · Document Delivery · Document Order · Enhanced Conditions · Orgs/Users · EPC · Schedulers · Trades · Workflow Tasks · DDA (limited)

Source: [01-domain/events.md](../01-domain/events.md)

## Loan eventType values (OFFICIAL)

`create`, `update`, `delete`, `move`, `submit`, `document`, `attachment`, `condition`, `milestone`, `change`, `fieldchange`, `enhancedfieldchange`, `lock`, `unlock`, `disclosureTracking` (Beta), `alertchange` (Limited)

## Definitions

- **EFC:** `enhancedfieldchange` — all fields, prev/new values — **OFFICIAL_DOCUMENTATION**
- **fieldchange:** max 50 filtered field IDs — **OFFICIAL_DOCUMENTATION**

## Relationships

Timeline taxonomy: [03-loan-communications/timeline-data-model.md](../03-loan-communications/timeline-data-model.md)

Ingestion: [05-dashboard-architecture/event-ingestion.md](../05-dashboard-architecture/event-ingestion.md) — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

## API references

- Subscriptions: `POST /webhook/v1/subscriptions` — **OFFICIAL_DOCUMENTATION**
- Event history: `GET /webhook/v1/events` — **OFFICIAL_DOCUMENTATION**

## Examples

Condition comment webhook subevent: `addCommentsToConditions` — **OFFICIAL_DOCUMENTATION** (Enhanced Conditions category)

## Production notes

- Dedupe on eventId — **OFFICIAL_DOCUMENTATION** + **INTERNAL_ARCHITECTURE_RECOMMENDATION**
- Webhooks not guaranteed real-time for lock — **OFFICIAL_DOCUMENTATION**
- Payload >250KB may skip fieldchange — **VERSION_DEPENDENT** release note

## Common mistakes

- Using webhook payload as sole truth without GET — **OFFICIAL_DOCUMENTATION** anti-pattern

## FAQ

See [architect-faq.md](./architect-faq.md).

## Related documents

- [integration-map.md](./integration-map.md) · [03-loan-communications/field-changes.md](../03-loan-communications/field-changes.md)

## Source references

- [Webhooks Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) — Last verified 2026-08-13
- [Loan Webhook Events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) — Last verified 2026-08-13
