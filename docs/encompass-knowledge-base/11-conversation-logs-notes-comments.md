# 11 — Conversation Logs, Notes, Comments (Unified Model)

> **Official source:** [Loan Management — Loan Views](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) · [V1 Get All Conversation Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-conversation-logs) · [V3 Get Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1) · [V3 Get All Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-conditions) · [Get Comments for a Task](https://developer.icemortgagetechnology.com/developer-connect/reference/get-comments-for-a-task)

---

## Critical integration requirement

**There is no single API that returns every note, comment, and log for a loan.**

Encompass stores commentary and logs across **multiple domains** with different APIs, pagination rules, and webhook channels. A complete loan communication view requires **deliberate aggregation** from the sources in the matrix below.

---

## Loan view parameter (V3 Get Loan)

From [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management):

| View | Returns |
|------|---------|
| `entity` | Loan content **excluding** log entries |
| `log` | **Only** log entries |
| `full` | Loan content **plus** all logs (largest payload) |
| `id` | IDs only (create/update APIs) |

**Log categories:**

| Category | Editable? | Examples |
|----------|-----------|----------|
| **Editable logs** | Yes (via dedicated endpoints incrementally) | AUS Tracking Logs, **Conversation Logs** |
| **System logs** | No | **Milestone History Log**, **HTML Email logs**, Lock Action Logs |

```http
GET /encompass/v3/loans/{loanId}?view=log
```

Returns (among others): `conversationLogs`, `milestoneHistoryLogs`, `emailTriggerLogs`, and other log arrays per V3 loan schema.

> **Note on HTML Email logs:** [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) documents "HTML Email logs" as system logs included with `view=logs|full`. The V3 loan schema also includes `emailTriggerLogs`. Verify which properties your instance returns for email-related history.

---

## Aggregation matrix

| Domain | API | Version | Endpoint | Returns | Pagination | Comments | History | Webhook | Notes |
|--------|-----|---------|----------|---------|------------|----------|---------|---------|-------|
| **Conversation log** | Conversation Log | V1 | `GET /encompass/v1/loans/{loanId}/conversationLogs` | List of conversation entries (comments, alerts, contact metadata) | **Not documented** on list endpoint | `comments` string per entry | N/A (each entry is a log row) | No dedicated Conversation Log webhook | Editable log; also in V3 `view=log\|full` |
| **Conversation log (single)** | Conversation Log | V1 | `GET /encompass/v1/loans/{loanId}/conversationLogs/{logId}` | One conversation log | — | Same | — | — | |
| **Conversation log (create)** | Conversation Log | V3 | `PATCH /encompass/v3/loans/{loanId}?action=add` (conversationLogs entity) | Created log | — | — | — | — | Requires lockId if locked |
| **Milestone history** | Loan Management | V3 | `GET /encompass/v3/loans/{loanId}?view=log\|full` | `milestoneHistoryLogs` array | — | **documentation does not establish** comment shape in history log | System audit of milestone changes | Loan `milestone` (`updateMilestones`, `finishMilestones`) | System log; not editable |
| **HTML email logs** | Loan Management | V3 | `GET /encompass/v3/loans/{loanId}?view=log\|full` | System log category "HTML Email logs" | — | Email content/history | System | — | See `emailTriggerLogs` in schema |
| **Milestone comments** | Milestones | V1 | `GET /encompass/v1/loans/{id}/milestones` | `comments` on milestone log | — | Milestone-grouped comments string | Current milestone state | Loan `milestone` | Not a threaded comment API |
| **Workflow task comments** | Workflow Task | workflow/v1 | `GET /workflow/v1/tasks/{id}/comments` | Task comment thread | **Not documented** | `commentText` per comment | — | **TaskComment** Update | Per task; query tasks by `loanId` first |
| **Workflow subtask comments** | Workflow Task | workflow/v1 | `GET /workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments` | Subtask comments | **Not documented** | `commentText` | — | TaskComment (entityType Task) | |
| **Enhanced condition comments** | Enhanced Conditions | V3 | `GET /encompass/v3/loans/{loanId}/conditions?view=Full` | Comments embedded in condition | — | Condition comment objects | — | Loan `condition` / `addCommentsToConditions` | `view=Full` includes comments |
| **Condition comments (dedicated)** | Enhanced Conditions | V3 | `GET /encompass/v3/loans/{loanId}/conditions/{conditionId}/comments` | Comments for one condition | — | Thread per condition | — | `addCommentsToConditions` in condition webhook | |
| **Condition comments (manage)** | Enhanced Conditions | V3 | `PATCH .../conditions/{conditionId}/comments?action=add\|update\|remove` | IDs when `view=id` | — | — | — | — | |
| **Disclosure tracking email** | Disclosure Tracking | V3 | `GET .../disclosureTracking2015Logs/{disclosureLogId}/emailMessage` | Email messaging for disclosure log | — | Disclosure-related email body/metadata | Per disclosure event | `disclosureTracking` (Beta Only) | Not general loan commentary |
| **Legacy milestone tasks** | Loan Management | V3 | `GET /encompass/v3/loans/{loanId}?view=log\|full` | `milestoneTasks` | — | **documentation does not establish** | Checklist items | — | Legacy; not workflow tasks |

---

## Unified comment comparison table

| Object | Storage model | API access | Comment field(s) | Threaded? | Internal vs external | Webhook signal |
|--------|---------------|------------|------------------|-----------|---------------------|----------------|
| **Conversation log** | Editable log entry | V1 list/get; V3 loan `view=log` | `comments` (string, may include timestamp/user prefix in samples) | One string per log entry | `showInLoanLog` flag | — |
| **Milestone log** | Milestone schedule | V1 `GET /milestones` | `comments` (grouped by milestone) | Single string per milestone | — | `updateMilestones` / `finishMilestones` |
| **Milestone history** | System log | V3 `view=log` | Schema: `milestoneHistoryLogs` | — | System | `milestone` webhook |
| **Workflow task** | Workflow service | `GET /workflow/v1/tasks/{id}/comments` | `commentText` | Yes (multiple comments) | — | TaskComment `update` |
| **Workflow subtask** | Workflow service | `GET .../subtasks/{id}/comments` | `commentText` | Yes | — | TaskComment |
| **Enhanced condition** | Condition entity | `GET /conditions?view=Full` or `/comments` | Structured comment objects | Yes | `isExternal` in webhook samples | `addCommentsToConditions` |
| **HTML email log** | System log | V3 `view=log` | Email-related (system) | — | System | — |
| **Disclosure email** | Disclosure log child | `GET .../emailMessage` | Email message payload | Per disclosure | Compliance | `disclosureTracking` (beta) |

---

## How to retrieve ALL commentary for one loan

### Recommended aggregation flow

```text
1. Conversation logs
   GET /encompass/v1/loans/{loanId}/conversationLogs
   OR GET /encompass/v3/loans/{loanId}?view=log → conversationLogs

2. Milestone history + email system logs
   GET /encompass/v3/loans/{loanId}?view=log
   → milestoneHistoryLogs, emailTriggerLogs (and other system logs)

3. Milestone comments (current schedule)
   GET /encompass/v1/loans/{loanId}/milestones
   → comments per milestone log

4. Workflow task comments
   GET /workflow/v1/tasks?loanId={loanId}  (paginate start/limit or page/size)
   FOR EACH task → GET /workflow/v1/tasks/{taskId}/comments
   FOR EACH subtask → GET .../subtasks/{subTaskId}/comments

5. Enhanced condition comments
   GET /encompass/v3/loans/{loanId}/conditions?view=Full
   OR per condition GET .../conditions/{conditionId}/comments

6. Disclosure emails (if needed for compliance UI)
   GET /encompass/v3/loans/{loanId}/disclosureTracking2015Logs
   FOR EACH log → GET .../emailMessage

7. Normalize → store in unified timeline with domain tag
```

### Webhook-driven incremental sync

| Webhook | Incremental update |
|---------|-------------------|
| Loan `milestone` | Milestone comments/history refresh |
| Loan `condition` / `addCommentsToConditions` | Condition comment IDs → GET comments API |
| TaskComment `update` | GET task comments for `entityId` |
| `disclosureTracking` (beta) | Disclosure log + optional emailMessage GET |

---

## Conversation log contract (V1)

From [V1 Get All Conversation Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-conversation-logs):

| Field | Description |
|-------|-------------|
| `id` | Unique log identifier |
| `comments` | Comments associated with the conversation |
| `createdDate`, `updatedDate` | Timestamps |
| `contactMethod` | `phone` or `email` |
| `showInLoanLog` | Display in Loan Log |
| `name`, `company`, `phone`, `email` | Contact metadata |
| `alerts` | Follow-up alerts with `dueDate`, `role`, `user` |
| `user` | Creating user entityRef |

**Illustrative live sample** shows `comments` formatted with timestamp and user prefix.

---

## John Smith — unified timeline (illustrative)

| Timestamp | Domain | Author | Content |
|-----------|--------|--------|---------|
| 2026-01-05 | Conversation log | Mike | Called John re rate lock options |
| 2026-01-08 | Condition comment | Sarah | "Paystub dates don't cover full 30 days" (internal) |
| 2026-01-09 | Workflow task comment | Sarah | "Ordered VOE from employer" on Verify income task |
| 2026-01-10 | Milestone | System | `finishMilestones`: Processing → Submittal |
| 2026-01-10 | Milestone comment | Sarah | "File submitted to UW" on Submittal milestone |
| 2026-01-12 | Condition comment | Robert | "Approve with conditions" (internal) |
| 2026-01-15 | Disclosure email | System | LE delivery email in disclosureTracking2015Logs |

Downstream UI merges these into one **chronological feed** with `sourceType` discriminator—Encompass does not provide this view natively via one API.

---

## Production integration concerns

1. **N+1 queries** — Task and condition comments require list + per-entity GET; batch and cache task IDs from webhooks.
2. **Pagination** — Workflow tasks support `start/limit` and `page/size`; conversation log list has no documented pagination—monitor payload size.
3. **view=full cost** — Avoid `view=full` in polling loops; use `view=log` for log-only sync.
4. **24.2 log behavior** — Log entities only returned with `view=logs|full` (not default/`entity`); update ETL jobs accordingly.
5. **Duplicate semantics** — Same human message may appear in conversation log and condition comment; dedupe by business rules not by text equality.
6. **External flags** — Condition comments expose `isExternal` in webhooks; respect for TPO/borrower visibility.
7. **Permissions** — V3 Get Loan omits fields user cannot access; partial comment visibility per persona.
8. **No conversation webhook** — Conversation logs require polling or loan `update`/`change` webhooks (noisy) unless using field-level subscriptions.

---

## Related files

| File | Topic |
|------|-------|
| [07-workflow-tasks.md](./07-workflow-tasks.md) | Task comments API |
| [08-milestones-and-associates.md](./08-milestones-and-associates.md) | Milestone comments vs history |
| [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) | Condition comment lifecycle |
