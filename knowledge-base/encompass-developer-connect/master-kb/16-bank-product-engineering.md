# 16 — Bank product engineering

**Related:** [15 Architecture](./15-production-integration-architecture.md) · [18 Case study](./18-real-loan-end-to-end-case-study.md) · [01 Overview](./01-encompass-domain-overview.md)

---

Teach Encompass as a **mortgage product**, not an endpoint list.

## Domain knowledge (origination)

| Stage | What “good” looks like | Encompass objects you will actually touch |
|-------|------------------------|-------------------------------------------|
| Origination | Complete, accurate 1003 | Loan entity, applications, borrower, property |
| Processing | Docs in, third parties ordered | Tasks, eFolder, contacts, EPC (if licensed) |
| Underwriting | Credit decision with evidence | Conditions, tracking, documents, AUS logs |
| Conditions | Requirements cleared with files | Enhanced/Standard conditions, assigned docs |
| Disclosures | TRID dates defensible | Document Order/Delivery, Disclosure Tracking 2015 |
| Closing | Package executed | Closing docs flow, Loan Connect, eFolder |
| Funding | Money out, milestone finished | Funding milestone, lock action logs as applicable |
| Post-closing | Trailing docs | Post-closing conditions, shipping |
| Secondary | Sold/pooled | Trades (separate domain) |

John Smith’s file is one path through this table. Rework (Resubmittal, re-requested conditions) is normal, not an error.

## Technical knowledge (checklist)

| Topic | What you must actually know | Official starting point |
|-------|-----------------------------|-------------------------|
| APIs | Resource per object; V1 vs V3 | Developer Connect reference |
| OAuth | Bearer token; grant types per app type; scope `lp` in documented ROPC/client_credentials notes | [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) |
| API keys | Super admin Account → API Key (fundamentals) | [API fundamentals](https://developer.icemortgagetechnology.com/developer-connect/docs/api-fundamentals) |
| Loan locks | Session-less vs multi-call; exclusive vs shared/NGShared | [Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1) |
| V1/V3 | Different loan contracts | [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Schema / field IDs / JSON paths | Export schema; do not memorize | [Get Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1) |
| REST | Method + path as published | Per resource |
| Pagination | Tasks `start/limit` or `page/size`; documents `start/limit` | Those pages |
| Filtering | e.g. conditions `conditionType`, `includeRemoved` | Those pages |
| Concurrency | Locks + webhook delay | Lock + webhook pages |
| Webhooks | Catalog + eventId | [Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) |
| Idempotency | Dedupe eventId | Default payload attrs |
| Retries | Yours + theirs; not real-time | Lock webhook warning |
| Audit | Raw events + system logs | Architecture |
| PII | Loan + EFC + comments + files | Treat as sensitive |
| Retention | **Bank policy**; ICE default retention **NOT ESTABLISHED** here | Legal |
| Access control | Personas, permissions omit fields | Get Loan notes |

## Product knowledge (KPIs you can defend)

| KPI | How it might be derived | Danger |
|-----|-------------------------|--------|
| SLA / bottleneck | Milestone expected vs actual **if those fields exist**; else timestamps you verified | Hardcoding ICE default names |
| Condition aging | Documented `age`, `ageStartDate`, `ageClosedDate` on Enhanced | Using comments as aging |
| Processor / UW workload | Task pipeline by assignee/group; associate role | Double-counting group + user |
| Document turnaround | Document status timestamps **if documented**; attachmentCreated times | Invented statuses |
| Borrower experience | Delivery/portal events + conversation logs | Treating Encompass as Gmail |
| Disclosure compliance | Tracking 2015 APIs, not delivery webhook alone | Beta event as SoR |
| Exceptions | Re-request tracking + Resubmittal milestone | “Rejected milestone” |

**Do not publish an SLA as universal.** Expected days and condition `daysToReceive` are configuration/template-driven where they exist.

## Denial, withdrawal, cancellation

**Documented:** `move` to trash (soft delete), `delete` (permanent), milestones including Cond. Approval, Resubmittal, Approval. **Not documented as a universal milestone:** “Rejected.”

What can stop a loan: lender folder/status/disposition fields, conditions outstanding, lock/investor rules — **verify schema + admin config**.

What can move backward: business rework (conditions, resubmittal). Milestone **history** is a system log.

Borrower communication automatic vs not: **configuration/workflow-dependent** (Consumer Connect, tasks, conversation logs). Do not claim Encompass always emails John when Robert re-requests.

## What you should never hardcode

Lender milestone names, condition statuses, role names, document statuses, EFC field lists, event volume caps, “one user one role,” V1 JSON on V3, `view=full` as default.

## Interview questions (senior)

1. How do you know this loan is Enhanced vs Standard?
2. Why is webhook insufficient for TRID dates?
3. How do you explain Resubmittal to a PM using John Smith?
4. What PII is in EFC vs eFolder vs comments?
5. How does SoD differ from Encompass multi-role capability?
6. What is your reconciliation job when a worker was down for six hours?
