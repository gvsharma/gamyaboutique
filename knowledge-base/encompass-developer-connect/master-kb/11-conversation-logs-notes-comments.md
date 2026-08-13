# 11 — Conversation logs, notes, comments, and loan timeline aggregation

This file answers the bank requirement:

> For one particular loan, retrieve all relevant notes, comments, conversation logs, document comments, condition comments, task comments, milestone comments and system history.

**Related:** [05 Conditions](./05-conditions-enhanced.md) · [07 Tasks](./07-workflow-tasks.md) · [02 Loan logs](./02-loan-domain.md)

**Official:** [V1 Get All Conversation Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-conversation-logs) · [V3 Create Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/create-conversation-log) · [Loan Management logs](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) · [Manage Enhanced comments](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-comments) · [Task comments](https://developer.icemortgagetechnology.com/developer-connect/reference/get-comments-for-a-task) · [Subtask comments](https://developer.icemortgagetechnology.com/developer-connect/reference/get-comments-for-a-subtask) · [Get documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents)

---

## A. Business meaning

These are **not interchangeable**.

| Term | Meaning |
|------|---------|
| **Conversation Log** | Loan-related **communication tracking** (phone, email interaction, vendor call) recorded in Encompass — **not** a full Outlook/Gmail mailbox |
| **Comment** | Context attached to a **specific object** (condition, task, document, …) |
| **Note** | Do **not** assume a generic Notes resource equals Conversation Logs. **NOT ESTABLISHED** as a single official “Notes” API interchangeable with Conversation Logs |
| **HTML Email Log** | Documented example of a **system log** |
| **System Log** | Platform-generated; **cannot be edited by any user** |
| **Editable Log** | Can be created/updated via loan APIs / dedicated endpoints (ICE examples: Conversation Logs, AUS Tracking) |

## B. John Smith examples (illustrative comment/conversation text)

| Channel | Text |
|---------|------|
| Phone Conversation Log | “Spoke with John about $15K deposit.” |
| Email Conversation Log | “Requested updated bank statement.” |
| Vendor | “Called ABC Title for commitment status.” |
| Condition comment | “Need donor statement.” |
| Task comment | “Appraisal reviewed.” |
| Document comment | “Unreadable signature page.” |
| Milestone comment | “Processing complete; title pending.” |

## C. Domain model

```text
Loan
 +-- Conversation Logs          (editable log; V1 list API documented)
 +-- Other editable logs        (e.g. AUS Tracking)
 +-- System logs                (milestone history, HTML email, lock action)
 +-- Condition comments         (Enhanced: dedicated API; Standard: verify)
 +-- Condition tracking         (not comments)
 +-- Task / subtask comments    (Workflow V1)
 +-- Document comments          (included on V3 document list)
 +-- Milestone comments         (verify on milestone log contract)
```

**There is not a single “get all comments” API.** Documented fact by omission: ICE publishes **separate** resources. Do not invent an aggregator endpoint.

## D–F. Conversation Logs API

**Retrieve all for a loan (documented V1):**

```http
GET /encompass/v1/loans/{loanId}/conversationLogs
Authorization: Bearer {accessToken}
```

ICE description: retrieves a list of Conversation logs for a loan (including when an entry is added by an authorized team member — see full page text).

V3 create: [Create Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/create-conversation-log) (`PATCH` conversationlogs with add — confirm current method on page). **V1 list contract ≠ V3 create contract.** Map explicitly.

Official V1 sample includes `id`, `alerts[]` with `dueDate` and `role` — copy remaining properties from the live example on the date you verify. Pagination on this GET: **NOT ESTABLISHED** on the summary snippet; check the current page.

Included in Get Loan? ICE: Conversation Logs are **editable logs**, included in Get Loan with `view=log(s)|full` **if present**. Prefer the dedicated V1 GET when you need “all conversation logs” without pulling every other log type.

## G. Unified comments table

| Object | Comment meaning | Editable? | Event? | Typical author | Example (illustrative) |
|--------|-----------------|-----------|--------|----------------|------------------------|
| Enhanced Condition | Context on a requirement | **Add / Update / Delete documented** | Loan `condition` extra `addCommentsToConditions` | UW, processor | “Need YTD on stub.” |
| Condition tracking | **Not a comment** — status history | tracking add/remove/delete | `updateStatusTrackingInConditions` | UW | status complete |
| Standard Condition comments | Same business idea | **Verify Standard pages** | **Do not assume** same as Enhanced | — | — |
| Task | Work context / disposition text also has `resolutionComment` | Comments API exists; edit/delete **verify** write operations | Workflow Task Update; dedicated comment webhooks **verify** catalog | Assignee | “XYZ appraisal in.” |
| Subtask | Child work context | GET comments documented; writes **verify** | Subtask Update **verify** | Assignee | “W2 page 2 missing.” |
| Document | Quality/readability of files | On list payload; write **verify** | Loan `document` update | Processor | “Blurry DL.” |
| Milestone | Stage context | **Verify V3 log field** | `updateMilestones` may not include comment text | Processor | “Title pending.” |
| Conversation Log | Communication record | Editable log class | Loan `update` may fire; **dedicated conversation webhook NOT ESTABLISHED** | LO/processor | Phone call |
| System / HTML email / lock action | Platform history | **Not user-editable** | lock/unlock events for locks; email **NOT ESTABLISHED** | System | Lock acquired |
| Generic Note | — | **NOT ESTABLISHED** as distinct official resource | — | — | Do not implement from memory |

Copy-into bank event store? **Yes if audit policy requires**, with PII controls. Conversation logs and comments can contain SSNs, account numbers, medical info in free text.

Append-only? **No** for Enhanced condition comments (Delete documented). System logs are not user-editable (different from append-only). Others: verify.

## H. Aggregation matrix

Domain | API | Version | Endpoint | Returns | Pagination | Comments | History | Webhook | Notes
------ | --- | ------- | -------- | ------- | ---------- | -------- | ------- | ------- | -----
Conversation Logs | Conversation Log | **V1** | `GET /encompass/v1/loans/{loanId}/conversationLogs` | List of conversation logs | **Verify page** | Log has comment-like fields in V3 create contract (`LogCommentContract` nested in some docs) | Communication history | **No dedicated resource proven here** | Also in Get Loan `log`/`full` if present
Conversation Logs write | Conversation Log | **V3** | Create Conversation Log page | Created ids/entity | n/a | Yes | n/a | Loan update possible | Different contract from V1 GET
Enhanced condition comments | Enhanced Conditions | **V3** | `GET .../conditions/{id}?view=Full` and `PATCH .../comments` | `comments[]` LogCommentContract | Get-one; list filters `includeRemoved` | Yes (`addedDate`, `addedBy`) | Separate `tracking` | Loan `condition` / comment subevent | Not append-only
Enhanced condition tracking | Tracking Entries | **V3** | `PATCH .../tracking`; included on get | tracking entries | — | No | Yes | status change subevent | Not comments
Standard conditions | Loan Conditions | **Verify V1/current** | Loan Conditions child pages | Conditions + assigned docs | **Verify** | **Verify** | **Verify** | **Do not assume Enhanced events** | Separate from Enhanced
Task comments | Workflow Tasks | **V1** | `GET /workflow/v1/tasks/{id}/comments` | Task comments | **Verify** | Yes | Task status is separate | Task Create/Update/Delete | Not in Get Loan
Subtask comments | Workflow Tasks | **V1** | `GET /workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments` | Subtask comments | **Verify** | Yes | — | Subtask events **verify** | Fan-out per subtask
Documents | eFolder Documents | **V3** | `GET /encompass/v3/loans/{loanId}/documents` | Documents + comments + roles | `start`/`limit` | Yes | Document statuses in webhook sample | Loan `document` | `view` detail/full/summary
Milestone comments | Associates & Milestones | **Verify V3 log** | `GET /encompass/v3/loans/{loanId}/milestones` | Milestone logs | **Verify** | **Verify field** | Milestone history is **system log** | `milestone` update/finish | History ≠ comment
Editable logs (AUS etc.) | Loan Management | **V3** | Get Loan `view=log`/`full` + dedicated log APIs as published | Log collections | Get Loan not a paged list | Depends on log type | Yes | Loan `update` | Incremental dedicated endpoints
System logs | Loan Management | **V3** | Get Loan `view=log`/`full` | Milestone history, HTML email, lock action, etc. | — | n/a | Yes | `lock`/`unlock`; others **verify** | Cannot be edited by users
HTML email logs | System logs | **V3** | Included in log view if present | Email log entries | **Verify schema** | n/a | Yes | **NOT ESTABLISHED** dedicated event | Not a mailbox
Generic Notes | — | — | **NOT ESTABLISHED** | — | — | — | — | — | Do not invent
Disclosure tracking | Disclosure Tracking 2015 | **V3 list page exists** | Confirm path on official page | Compliance logs | **Verify** | Not “comments” | Yes | `disclosureTracking` **Beta** | Not conversation

Blank **Verify** cells are intentional. Filling them from memory would violate accuracy rules.

## I. Normalized Loan Timeline service

Downstream (not an Encompass resource):

```text
LoanTimelineEvent
  loanId, eventId, eventTime, eventType, resourceType, resourceId,
  actor, text, previousState, newState, source, rawPayload
```

Adapters: one per row in the matrix that you have **verified**. Sort by `eventTime` with stable tie-break. Dedupe on webhook `eventId` or a hash of source+id+time+text. Reconcile by re-GET. **Only map ICE event names that are documented.**

## J–K. Integration / production

Fan-out GETs after loan-level webhooks. Expect duplicates and gaps. PII in all free-text fields. Retention: bank policy; ICE retention **NOT ESTABLISHED** here.

Conversation Log ≠ enterprise email. HTML email log ≠ Gmail.

## L. Common mistakes

1. One API to rule them all.
2. Mixing V1 conversation GET with V3 bodies.
3. Treating tracking as comments.
4. Assuming comments are append-only.
5. Calling Conversation Logs “notes” in a legal audit export without mapping.

## M. Questions

1. Which sources are missing if you only call Get Loan `view=full`?
2. How do you prove a comment delete on an Enhanced condition?
3. Why is Outlook out of scope?
