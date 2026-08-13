# Troubleshooting

## Purpose

Symptom → cause → fix for integration and dashboard sync issues.

## Scope

Production support runbook index.

---

## Webhooks not arriving

| Check | Action |
|-------|--------|
| Subscription enabled | GET `/webhook/v1/subscriptions` — **OFFICIAL_DOCUMENTATION** |
| Endpoint HTTPS + 200 | ICE deletes bad endpoints — **OFFICIAL_DOCUMENTATION** |
| Signature failures | CloudWatch `webhook.signature.invalid` — **INTERNAL_ARCHITECTURE_RECOMMENDATION** |
| WAF blocking | Allow ICE egress if IP allowlist — **INTERNAL_ARCHITECTURE_RECOMMENDATION** |

## Duplicate timeline rows

| Cause | Fix |
|-------|-----|
| Missing eventId dedupe | UNIQUE on encompass_event_id — **INTERNAL_ARCHITECTURE_RECOMMENDATION** |
| Poll + webhook double ingest | Unified idempotency_key — **INTERNAL_ARCHITECTURE_RECOMMENDATION** |

## Stale dashboard data

| Cause | Fix |
|-------|-----|
| Smart Client edit, no WH | Enable poll `view=logs` — **INTERNAL_ARCHITECTURE_RECOMMENDATION** |
| Missed WH | Replay from `/webhook/v1/events` — **OFFICIAL_DOCUMENTATION** |
| EFC skipped (large payload) | auditTrail backfill — **VERSION_DEPENDENT** |

## Empty conditions/documents in mirror

| Cause | Fix |
|-------|-----|
| Wrong API family (std vs EC) | Check indicator — **OFFICIAL_DOCUMENTATION** |
| 403 persona | Fix integration user persona — **OFFICIAL_DOCUMENTATION** |

## Field changes missing

| Cause | Fix |
|-------|-----|
| Not subscribed | Add fieldchange/EFC — **OFFICIAL_DOCUMENTATION** |
| Virtual field not in Reporting DB | EFC guide — **OFFICIAL_DOCUMENTATION** |
| Filter silently ignored | Max 50 attrs — **OFFICIAL_DOCUMENTATION** |

## OpenSearch drift

Reindex from Postgres — **INTERNAL_ARCHITECTURE_RECOMMENDATION**. See [05-dashboard-architecture/search.md](../05-dashboard-architecture/search.md).

## DLQ messages

Inspect payload in S3 → fix mapper/permissions → replay — **INTERNAL_ARCHITECTURE_RECOMMENDATION**. [05-dashboard-architecture/failure-handling.md](../05-dashboard-architecture/failure-handling.md).

---

## Related documents

[error-map.md](./error-map.md) · [production-gotchas.md](./production-gotchas.md)

## Source references

[02-apis/webhook-api.md](../02-apis/webhook-api.md) — Last verified 2026-08-13
