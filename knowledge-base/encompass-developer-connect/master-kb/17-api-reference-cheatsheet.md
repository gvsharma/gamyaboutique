# 17 — API reference cheatsheet

**Only endpoints and facts found on official ICE Developer Connect pages during this seed.** Confirm on the live portal before coding — paths and versions change.

Hosts **documented:** `https://api.elliemae.com` (prod), `https://concept.api.elliemae.com` (UAT).

Auth **documented:** `Authorization: Bearer {accessToken}`.

---

## Loan

| Version | Method | Path | Notes |
|---------|--------|------|-------|
| V3 | GET | `/encompass/v3/loans/{loanId}` | views `entity`, `log`, `full`; `id` on create/update |
| V3 | PATCH/POST | Create/Update Loan pages | Different contract from V1 |
| V3 | GET | Loan schema page | Contract for writes |
| V1/V3 | — | Resource lock APIs | Session-less default; exclusive / shared / NGSharedLock |

Indicator: Field `ENHANCEDCOND.X1` / `loan.useEnhancedConditionIndicator`.

## Enhanced Conditions (V3)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/encompass/v3/loans/{loanId}/conditions` | `conditionType`, `includeRemoved` |
| GET | `/encompass/v3/loans/{loanId}/conditions/{conditionId}` | view Summary / Detail / Full |
| PATCH | `/encompass/v3/loans/{loanId}/conditions` | Manage; `lockId`; lender configuration |
| PATCH | `/encompass/v3/loans/{loanId}/conditions/{conditionId}/comments` | action Add, Update, Delete |
| PATCH | `/encompass/v3/loans/{loanId}/conditions/{conditionId}/tracking` | action add, remove, delete |
| GET | Enhanced Condition Types / Sets / Templates settings pages | Configuration |
| POST/GET | Evaluate Automated Conditions | Rules evaluation |

## Standard Conditions

[Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions) — underwriting, post-closing, preliminary; `conditionId` on create (response header). **Use child pages for exact paths. Do not assume Enhanced V3 paths.**

## Workflow Tasks (V1)

| Method | Path |
|--------|------|
| GET | `/workflow/v1/tasks` |
| GET | `/workflow/v1/tasks/{id}/comments` |
| GET | `/workflow/v1/tasks/{taskId}/subtasks` |
| GET | `/workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments` |

Pagination: `start`/`limit` or `page`/`size`. Statuses documented: Not started, In progress, Completed.

## Milestones / associates

| Version | Method | Path |
|---------|--------|------|
| V3 | GET | `/encompass/v3/loans/{loanId}/milestones` |
| V3 | GET | `/encompass/v3/loans/{loanId}/milestones/{milestoneId}` |
| V3 | PATCH | `/encompass/v3/loans/{loanId}/milestones/{milestoneId}` |
| V1 | GET | `/encompass/v1/loans/{id}/associates/{logId}` |

## Documents / attachments

| Version | Method | Path |
|---------|--------|------|
| V3 | GET | `/encompass/v3/loans/{loanId}/documents` |

Attachment upload/download: **current V3 pages**; V1 attachments **sunsetting** (confirm changelog/deprecation).

## Conversation logs

| Version | Method | Path |
|---------|--------|------|
| V1 | GET | `/encompass/v1/loans/{loanId}/conversationLogs` |
| V3 | — | Create Conversation Log page |

## Document order / delivery

`/encompassdocs/v1/documentAudits/{opening\|closing}`  
`/encompassdocs/v1/documentOrders/{opening\|closing}`  
`.../{docSetId}/documents`  
`.../{docSetId}/delivery`  

Async ids documented. Details: Send Encompass Docs guide.

## Disclosure tracking

[Disclosure Tracking 2015](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015) and V3 list-logs page — **copy path from the live page**.

## Webhooks

Subscriptions + Resources APIs. Catalog: Loan, Document Delivery, Document Order, Enhanced Conditions, Organizations & Users, EPC, Schedulers, Trades, Workflow Tasks, DDA (limited).

Default body: `eventId`, `eventTime`, `eventType`, `meta.*`.

## Do not put on this cheatsheet

Invented “GET /comments/all”, invented status enums, invented rate limits, invented Notes resource.

Full link index: [../18-official-documentation.md](../18-official-documentation.md).
