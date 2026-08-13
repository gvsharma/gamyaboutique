# Architect FAQ

## Purpose

Integration architecture decisions for enterprise Encompass consumers.

## Scope

Webhooks, scale, data ownership, reconciliation.

---

### System of record?

Encompass — **OFFICIAL_DOCUMENTATION** platform role. Dashboard is read-optimized mirror — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

### fieldchange vs enhancedfieldchange?

| | fieldchange | enhancedfieldchange |
|--|-------------|---------------------|
| Filters | Max 50 fields — **OFFICIAL** | None — **OFFICIAL** |
| Volume | Lower | Firehose |
| Payload | Filtered | prev/new all fields |

Hybrid: filtered WH + nightly auditTrail — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

### FIFO vs standard SQS?

Standard + idempotent upserts — **INTERNAL_ARCHITECTURE_RECOMMENDATION**. FIFO per loanId if ordering conflicts hurt.

### Where to store raw webhooks?

S3 + index table — **INTERNAL_ARCHITECTURE_RECOMMENDATION**. See [05-dashboard-architecture/system-architecture.md](../05-dashboard-architecture/system-architecture.md).

### How to build unified timeline without losing source?

Preserve `rawReference`, `encompassEventType`, S3 payload — **INTERNAL_ARCHITECTURE_RECOMMENDATION**. [03-loan-communications/unified-loan-timeline.md](../03-loan-communications/unified-loan-timeline.md).

### OpenSearch vs Postgres for timeline?

Postgres authoritative; OpenSearch for full-text — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

### Multi-subscription overlap?

Cannot overlap in same domain — **OFFICIAL_DOCUMENTATION**.

### EPC / DDA / Schedulers?

Webhook categories — **OFFICIAL_DOCUMENTATION**. DDA limited availability — **OFFICIAL_DOCUMENTATION**.

---

## Related documents

[integration-map.md](./integration-map.md) · [05-dashboard-architecture/reconciliation.md](../05-dashboard-architecture/reconciliation.md)

## Source references

[EFC Webhook Guide](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes) — Last verified 2026-08-13
