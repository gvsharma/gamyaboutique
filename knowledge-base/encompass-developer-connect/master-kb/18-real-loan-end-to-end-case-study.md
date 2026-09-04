# 18 — John Smith end-to-end case study and master diagrams

**Related:** [01 Overview](./01-encompass-domain-overview.md) · [15 Architecture](./15-production-integration-architecture.md) · [11 Aggregation](./11-conversation-logs-notes-comments.md)

**Legend:** Steps 1–22 are an **illustrative** origination story. APIs/events listed are **documented families** to investigate at that step — not a guarantee ICE emits that event for every lender configuration.

Running case: John Smith; $500K purchase; $400K conventional 30-year; Mike LO; Sarah Processor; Robert UW; Lisa Closing; ABC Title; XYZ Appraisal.

---

## Step table

| # | Business step | Object changed | API involved (documented family) | Fields / payload (illustrative vs documented) | Possible webhook | Comments / logs | Actors | Downstream impact |
|---|----------------|----------------|----------------------------------|-----------------------------------------------|------------------|-----------------|--------|-------------------|
| 1 | Loan created | Loan | V3 Create Loan | `loanId` assigned (documented 32-digit id) | Loan `create`; EFC may fire (documented on create) | System/create provenance | Mike / system | Open projection row |
| 2 | Application data entered | Loan data / applications | V3 Update Loan `view=entity` | Names, income, property — **schema paths NOT copied here** | `update`, `change`, `fieldchange`, `enhancedfieldchange` | — | Mike | PII in EFC |
| 3 | LO assigned | Loan associate | V3 milestone PATCH / V1 associates | Role + user on this loan | `milestone` update; Loan `update` | — | Admin / Mike | LO queue |
| 4 | Processor assigned | Associate | Same | Sarah + Processor role | Same family | — | Admin | Processor pipeline |
| 5 | Processing milestone starts | Milestone | V3 GET/PATCH milestones | `title` sample “Processing” is **OOTB name — configurable** | `updateMilestones` / `finishMilestones` as applicable | Milestone comment **verify** | Sarah | SLA clock **if dates exist** |
| 6 | Processing tasks created | Workflow Task | `GET/POST` Workflow V1 tasks | status Not started; `workEntity` loan | Workflow Task `Create` | — | System / Sarah | Work queue |
| 7 | Documents requested | Document and/or condition | eFolder + conditions | Request is **config/workflow**, not one universal verb | `document` create; `condition` if UW conditions exist yet | Conversation log optional | Sarah | Borrower/portal or eFolder needed list |
| 8 | Documents uploaded | Attachment + document | V3 attachments (current) + documents | Files ≠ document records | `attachmentCreated`; `assignAttachmentsToDocument` | Document comment if quality issue | John via portal / Sarah | Evidence available |
| 9 | Conditions created | Enhanced or Standard condition | Check `useEnhancedConditionIndicator` then V3 conditions or Standard API | `id`, template title retrieve-only on loan | Loan `condition` **Enhanced**; Standard **verify** | — | Robert / rules (`sourceOfCondition`) | UW checklist |
| 10 | Conditions requested | Tracking / status | Tracking PATCH; status retrieve-only | ICE example status `"Requested"` **not an enum** | `condition` status change / tracking extra payload | Comment: “Please upload two stubs.” | Sarah / Robert | Borrower follow-up |
| 11 | UW reviews | Condition + maybe task | GET condition `view=Full`; task comments | tracking `isChecked`; comments text | `condition` comment/update; Task `Update` | “July stub missing YTD.” | Robert | Rework or clear |
| 12 | Condition re-requested | Tracking + comments | Same | **Illustrative** business cycle | More `condition` events — **no fixed count** | Re-request reason | Robert | Aging continues (`age` fields) |
| 13 | Additional evidence | Document/attachment | Same as 8 | New attachment ids | attachment/document/assignDocument | — | John | assignedTo grows |
| 14 | Condition satisfied | Tracking / `statusOpen` | GET after event | `statusOpen` retrieve-only rollup | status change | “Cleared — calc agrees.” | Robert | PriorTo gate may open |
| 15 | Resubmittal | Milestone | Milestones API | OOTB name **Resubmittal** — still configurable | `milestone` | History system log | Robert / Sarah | Not a straight line |
| 16 | Approval | Milestone | Milestones API | OOTB Approval | `finishMilestones` / update | — | Robert | Closing can start **per lender template** |
| 17 | Disclosure package generated | Document Order | `encompassdocs` generate — **async id** | auditId, doc set id | Document Order resource | — | Lisa | Do not mark disclosed yet |
| 18 | Disclosure delivered | Delivery + tracking + eFolder | delivery POST async; Tracking 2015 GET | deliveryOrderID; tracking dates | Document Delivery; `disclosureTracking` **Beta** | Tracking ≠ conversation | Lisa / system | Compliance projection |
| 19 | Closing | Docs signing / closing package | Closing docs flow; Loan Connect | Configurable | Delivery / document | — | Lisa, ABC Title | Executed docs in eFolder |
| 20 | Funding | Milestone / funding ops | Milestones; other funding APIs **verify** | — | `milestone` | Lock action logs are **system logs** (rate lock ≠ resource lock) | Lisa / funding | Secondary eligible later |
| 21 | Post-closing | Post-closing conditions/docs | Conditions type Post-Closing (ICE example type name) | Trailing docs | condition/document | — | Post-closer | Trailing pipeline |
| 22 | Completion | Milestone Completion (OOTB) | Milestones | Configurable name | `finishMilestones` | — | Ops | Archive / retain per policy |

**Denial/withdrawal:** not shown as a universal “Rejected” milestone. If John withdraws, look at folder `move` (trash = soft delete) and lender disposition fields — **verify**.

---

## Master domain diagram

```text
Customer
   -> Loan
        -> Loan data
             -> Applications (borrower / coborrower)
             -> Property, employment, income, assets, liabilities
             -> Custom fields
        -> People
             -> Users / personas / groups
             -> Roles
             -> Loan associates
             -> Business contacts (ABC Title, XYZ Appraisal)
        -> Milestones  (+ milestone history system log)
        -> Workflow tasks (+ subtasks + comments)
        -> Conditions (+ comments + tracking)
        -> Documents (eFolder)
             -> Attachments
        -> Document Order -> Delivery -> Disclosure Tracking
        -> Editable logs (Conversation Logs, AUS, ...)
        -> System logs (HTML email, lock action, ...)
        -> Field-change events (EFC)
        -> Webhooks

External / service:
  EPC | DDA (limited) | Trades | Schedulers | Organizations & Users
```

## Master integration diagram

```text
Encompass
  -> Webhooks (eventId, signed POST)
  -> API Gateway
  -> Event ingestion (validate, dedupe, persist raw)
  -> Queue (SQS)
  -> Processing (GET current resource)
  -> Event store (S3)
  -> Operational DB (Aurora / DynamoDB)
  -> Analytics
  -> Downstream banking systems
```

## What you should now be able to do

- Explain objects to a PM using John Smith without saying “endpoint.”
- Design loan + webhook integration that GETs after events.
- Read a loan JSON **using the schema**, not folklore.
- Read Enhanced condition JSON (`id`, tracking, comments, assignedTo).
- Read task JSON (`status` Not started / In progress / Completed).
- Trace document → condition (many-to-many).
- Trace task → assignee → role/user/group.
- Trace field change → EFC `fieldChangeEvents`.
- Retrieve history via log view + dedicated APIs.
- Retrieve conversation logs via **V1 GET**.
- Aggregate comments without a mythical all-comments API.
- Separate borrower communication tracking from mailboxes.
- Reason about UW rework and Resubmittal.
- Design idempotent processing and reconciliation.
- Spot configuration-dependent names (milestones, statuses).
- Avoid dangerous assumptions listed in each file’s section L.

**Source of truth remains the live ICE Developer Connect portal.** Re-verify on each Encompass/Developer Connect release.
