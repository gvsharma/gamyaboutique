# Developer FAQ

## Purpose

Quick answers for engineers building on Developer Connect.

## Scope

API usage, common pitfalls. Classifications inline.

---

### Is there one API for all comments on a loan?

**NOT_ESTABLISHED.** Comments are per-resource — [master-comment-matrix.md](./master-comment-matrix.md). Aggregate via timeline service — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

### Is there `GET /loans/{id}/notes`?

**NOT_ESTABLISHED.** Use Conversation Logs for loan-file communication — **OFFICIAL_DOCUMENTATION**.

### Enhanced or Standard conditions?

Read `useEnhancedConditionIndicator` on loan — **OFFICIAL_DOCUMENTATION**. Branch APIs — never both.

### V1 or V3 for documents?

V3 — **OFFICIAL_DOCUMENTATION**. V1 attachment sunset **VERSION_DEPENDENT** 26.3.

### Which document status field?

`documentStatus` — **VERSION_DEPENDENT** 26.1+. Not deprecated `status`.

### How to get milestone history?

Milestone History Log via `GET loan?view=logs` — **OFFICIAL_DOCUMENTATION**. Not milestone GET alone.

### Webhook payload enough?

No — GET `meta.resourceRef` — **OFFICIAL_DOCUMENTATION**.

### Dedupe key?

Webhook `eventId` — **OFFICIAL_DOCUMENTATION**.

### Task vs milestone task?

Workflow Task = `/workflow/v1/tasks` — **OFFICIAL_DOCUMENTATION**. Different from milestone UI tasks.

### Conversation log webhooks?

Dedicated category — **NOT_ESTABLISHED**. Use loan `update` + poll — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

---

## Related documents

[developer-faq.md](./developer-faq.md) · [troubleshooting.md](./troubleshooting.md) · [02-apis/api-production-guidelines.md](../02-apis/api-production-guidelines.md)

## Source references

[03-loan-communications/README.md](../03-loan-communications/README.md) (20 Q&A) — Last verified 2026-08-13
