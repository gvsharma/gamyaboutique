# 06 — Condition lifecycle, comments, tracking, documents

**Related:** [05 Enhanced](./05-conditions-enhanced.md) · [09 Documents](./09-documents-efolder-attachments.md) · [11 Comments model](./11-conversation-logs-notes-comments.md)

---

## A. Business meaning

Four objects, four jobs:

| Object | Job |
|--------|-----|
| Condition | Requirement |
| Document | Evidence record in eFolder |
| Attachment | Electronic file |
| Task | Work a person/system performs |
| Milestone | Major lifecycle stage |

Never collapse them.

## B. John Smith walk-through (illustrative business lifecycle)

Condition: **“Provide most recent two paystubs.”**

```text
Created
   |
Requested
   |
Borrower uploads documents
   |
Received
   |
Reviewed
   |
+-- Accepted / Satisfied
|
+-- Re-requested
       |
       Additional document requested
       |
       Reviewed again
       |
       Satisfied
```

**These status names are illustrative.** ICE documents `status` as a retrieve-only **name of the current status type**, with example `"Requested"`. Actual names live in **lender Enhanced Condition definitions**. Do not hardcode this graph.

Actors: Robert creates/reviews; Sarah requests/follows up; John uploads; system may add via `sourceOfCondition` AutomatedByRule / DUFindings / etc.

## C. Domain model

```text
Condition
   |
   +-- comments[]          narrative context (can be Add/Update/Delete on Enhanced)
   +-- tracking[]          status progression (add/remove/delete entries)
   +-- assigned documents
           |
           v
       Document
           |
           v
       Attachment(s)
```

**Many-to-many (documented for Conditions API):** one condition, many documents; one document, many conditions.

```text
Condition "Paystubs" ----> Document A (Paystubs)
Condition "Paystubs" ----> Document B (VOE)
Document B ---------------> Condition "Employment"
```

## D–F. APIs

Comments (Enhanced, documented):

```http
PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}/comments?action=Add&lockId={lockId}
```

Tracking (Enhanced, documented):

```http
PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}/tracking?action=add&lockId={lockId}
```

Get with comments:

```http
GET /encompass/v3/loans/{loanId}/conditions/{conditionId}?view=Full
```

**Illustrative comment body based on LogCommentContract:**

```json
{
  "comments": "July stub missing year-to-date. Re-request August and YTD.",
  "isExternal": false
}
```

## G. Comments vs tracking

| | Comments | Tracking |
|--|----------|----------|
| Meaning | Why / context | Status progression |
| Enhanced API | Add / **Update** / **Delete** | add / remove / delete |
| Example (illustrative) | “Borrower provided gift letter. Need donor account statement.” | Status marked complete with `user` + `date` |
| Events | Loan `condition` extra payload includes `addCommentsToConditions` (official sample) | `updateStatusTrackingInConditions` (official sample) |

**Do not store tracking as comments.** **Do not treat comments as the audit of status.**

### Realistic comment examples (illustrative text only)

| Author | Comment |
|--------|---------|
| John / borrower-facing note via ops | “Bonus on July stub is one-time.” |
| Sarah | “Uploaded both stubs; August is password-protected.” |
| Robert | “Re-request: need YTD and employer name matching 1003.” |
| Reviewer | “Income calc agrees; OK to clear.” |
| Missing evidence | “Second stub is a screenshot; need original PDF.” |

Whether borrowers can author comments directly: **NOT ESTABLISHED** as a universal API actor. `isExternal` indicates whether a comment **can be shown externally**.

## H. Lifecycle vs events

One condition can generate **many** webhook notifications: create, comment, assignDocument, status/tracking, update, remove. Rework (re-request) adds more. **Do not claim a fixed number of condition events.**

Official Loan `condition` subevents: create, update, assign, assignDocument, remove, comment, status change.

## I. What can be repeated / removed

- **Duplicate condition:** documented `action=duplicate` with template `allowDuplicate`; does not copy tracking, comments, assignedTo.
- **Re-request:** a **business** pattern implemented via configured statuses/tracking + comments — not a separate ICE verb found in the pages cited.
- **Remove:** `isRemoved`; list with `includeRemoved=true`.
- **Hard delete vs remove:** tracking `action` includes **remove** and **delete** — confirm semantic difference on the current tracking page; do not assume they are identical.

## J. Integration

Normalize:

```text
LoanTimelineEvent { loanId, eventId, eventTime, eventType, resourceType=condition,
  resourceId, actor, text, previousState, newState, source, rawPayload }
```

`eventType` values in **your** store may be `CONDITION_COMMENTED` — that is a **bank vocabulary**. Map from ICE `eventType=condition` + extra payload keys. Do not subscribe to invented ICE event names.

## K. Production

- After comment webhook, GET Full if you need text (`addCommentsToConditions` sample includes `commentId` / `isExternal`, not full text).
- PII in comment bodies.
- Authorization: persona/role plus `delegatedTrackingStatuses`.
- Concurrent tracking updates: loan lock.

## L. Common mistakes

1. Modeling condition as boolean `cleared`.
2. Using document status as condition status.
3. Assuming comments are append-only (Enhanced Delete is documented).
4. Hardcoding Satisfied/Requested as the only statuses.

## M. Questions

1. Why can one PDF satisfy two conditions?
2. What is lost on duplicate?
3. How do you reconstruct lifecycle if you only stored comments?
