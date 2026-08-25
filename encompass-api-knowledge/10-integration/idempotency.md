# Idempotency

Webhooks: use `eventId` so events are “only digested once.”

Create loan: new GUID each successful create — not idempotent by key unless you store your correlation.

Batch update: invalid GUIDs skipped.

**INTERNAL ARCHITECTURE RECOMMENDATION:** store eventId with TTL ≥ 7 days; webhook receiver 200 only after durable write.
