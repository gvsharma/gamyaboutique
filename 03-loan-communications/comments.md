# Comments — Deep Dive (All Object Types)

Comprehensive guide to **comments** across Encompass objects. Comments are **resource-scoped annotations** — there is no loan-level "all comments" API.

**Primary contract:** `LogCommentContract` (Enhanced Conditions, Conversation Log `commentList`, and related schemas).

---

## Summary table

| Object | Who writes | Who reads | Meaning | Editable? | Deletable? | Historical? | Generates event? | Belongs to resource? |
|--------|------------|-----------|---------|-----------|------------|-------------|-------------------|---------------------|
| **Loan** | — | — | Loan has no direct comment API | — | — | — | — | — |
| **Enhanced Condition** | Staff with condition access | Staff, TPO portals (if external) | Requirement clarification | Yes | Partial (`isRemoved` on condition) | `addedDate`, review fields | Yes — `condition` WH comment | **Yes** — part of condition |
| **Standard Condition** | Staff | Staff | Requirement clarification | Yes | **NOT ESTABLISHED** | Partial | **NOT ESTABLISHED** | **Yes** |
| **Workflow Task** | Assignee, admin | Task viewers | Work progress notes | Yes | With task (hard delete) | Partial — comment thread | Yes — Task Comment Update WH | **Yes** — part of task |
| **Workflow Subtask** | Same as task | Same as task | Sub-work notes | Yes | With subtask | Partial | **NOT ESTABLISHED** dedicated WH | **Yes** |
| **Milestone log** | Milestone-permitted user | Loan team | Stage completion notes | Yes (`comments` string) | Overwrites prior text | **No thread** — single field | Yes — `milestone` WH | **Yes** — overwrites |
| **eFolder Document** | Document-permitted roles | Role-scoped readers | QC / review notes | Yes | **NOT ESTABLISHED** per comment | Partial | Yes — `document` updateDocuments | **Yes** |
| **Conversation Log** | Staff | Staff (`showInLoanLog`) | Communication summary | Yes | **NOT ESTABLISHED** | `updatedDateUtc` | Partial — loan `update` | **Yes** — log entry body |
| **Conversation Log `commentList`** | Staff | Staff | Thread on a log entry | Yes | **NOT ESTABLISHED** | `addedDate` | Partial | **Yes** — nested in log |
| **Disclosure log** | Staff | Compliance | **NOT ESTABLISHED** as comment API | N/A | N/A | N/A | `disclosureTracking` WH | N/A |

---

## Loan

### Is there a loan-level comment?

**No.** The loan entity does not expose a `comments[]` collection via Developer Connect. Loan-level textual communication uses **Conversation Logs**.

Field-level descriptions exist in the loan schema (thousands of fields) — those are **data**, not comment threads.

---

## Enhanced Condition comments

### API

```
GET  /encompass/v3/loans/{loanId}/conditions/{conditionId}/comments
PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}/comments
```

Or bulk: `GET .../conditions?view=Full` includes `comments[]`.

### Who writes?

Users with eFolder/Enhanced Condition persona permissions — **LENDER CONFIGURABLE**.

### Who reads?

Internal staff; `isExternal` on LogCommentContract may control TPO/borrower portal visibility.

### What does it mean?

Clarifies what is needed to satisfy the condition — operational, not a phone log.

### LogCommentContract fields

| Field | Purpose |
|-------|---------|
| `comments` | Text |
| `addedBy` / `addedDate` | Author audit |
| `reviewedBy` / `reviewedDate` | Review workflow |
| `forRole` | Role-specific note |
| `isExternal` | External party visibility |

### Editable / deletable / historical

- **Editable:** Yes — PATCH comments endpoint
- **Deletable:** Condition soft-remove (`isRemoved`) hides condition; per-comment delete semantics: confirm OpenAPI on PATCH behavior
- **Historical:** Review timestamps preserved; prior text versions **NOT ESTABLISHED** as version history API

### Events

Loan webhook `condition` subevents include comment-related events (official: `addCommentsToConditions` in Enhanced Conditions webhook category).

### Resource relationship

Comment **belongs to the condition** — display in timeline with `resourceType=CONDITION`, `resourceId=conditionId`.

**John Smith example:** Robert adds "Need donor statement." on large-deposit condition.

---

## Standard Condition comments

### API

```
PATCH /encompass/v1/loans/{loanId}/conditions/{type}/{conditionId}/comments
```

Types: `underwriting`, `preliminary`, `postclosing`.

### Notes

Use only when `useEnhancedConditionIndicator = false`. Enhanced loans should use V3 Enhanced Condition comments API.

Dedicated GET for standard condition comments: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** — may require GET single condition.

---

## Workflow Task comments

### API

```
GET  /workflow/v1/tasks/{id}/comments
POST /workflow/v1/tasks/{id}/comments
```

### Who writes?

Task assignee, users with task access, administrators.

### Who reads?

Users with task visibility; linked via `workEntity` (loan) or `associations[]` (condition).

### What does it mean?

Progress notes on a work item — distinct from **resolutionComment** on task completion.

### Editable / deletable / historical

- **Editable:** Yes via POST (append) — update semantics per OpenAPI
- **Deletable:** Task hard delete removes task; comment retention **NOT ESTABLISHED**
- **Historical:** Task Comment Update webhook (24.2+) signals new comment with `commentText`, `createdBy`

### Events

| Webhook resource | Event |
|------------------|-------|
| Workflow Tasks | Task Comment Update |

### Resource relationship

Comment **belongs to task** — not a separate communication channel. Link to loan via task `workEntity` or association.

**John Smith example:** Sarah posts "Appraisal reviewed." on income review task.

---

## Workflow Subtask comments

### API

```
GET  /workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments
POST /workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments
```

### Behavior

Mirrors task comments. Subtasks **cannot** have separate assignees (official) — same owner as parent task.

### Webhooks

Dedicated subtask comment webhook: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** — poll or infer from Task Comment Update if bubbled.

---

## Milestone comments

### API

Single field on milestone log:

```
GET/PATCH /encompass/v3/loans/{loanId}/milestones/{milestoneId}
```

Field: `comments` (string) on `MilestonesLogV3attributes`.

### Who writes?

Users permitted to update milestone log (finish milestone, assign associate).

### Who reads?

Loan team viewing milestone state.

### What does it mean?

Free-text note attached to **current milestone state** — e.g., "Processing complete."

### Critical distinction

This is **not** a comment collection API. Each PATCH **overwrites** the `comments` string. Historical milestone transitions are in **Milestone History Log** (system log) — separate from `comments` field.

### Events

Loan webhook `milestone`: `updateMilestones`, `finishMilestones`.

**John Smith example:** Sarah sets `comments: "Processing complete."` when finishing Processing milestone.

See [milestone-comments.md](./milestone-comments.md).

---

## eFolder Document comments

### API

Comments returned in document list/detail:

```
GET /encompass/v3/loans/{loanId}/documents?view=detail|full
```

Updates via document PATCH endpoints (exact comment mutation shape per OpenAPI).

### Who writes?

Users with eFolder document access per role matrix — **LENDER CONFIGURABLE**.

### Who reads?

Roles listed in document `rolesWithAccess` (or equivalent in contract).

### What does it mean?

Document QC — illegible signature, missing page, etc.

### Events

Loan webhook `document`: `updateDocuments`, `documentStatusUpdates`.

**John Smith example:** Robert adds "Signature page unreadable." on note document.

See [document-comments.md](./document-comments.md).

---

## Conversation Log comments (two levels)

### Level 1: Primary `comments` string

The log entry body — the main communication text.

### Level 2: `commentList[]` (LogCommentContract)

Threaded discussion **on the log entry** — role-specific follow-ups, reviews.

### Who writes / reads?

Staff with conversation log persona access.

### What does it mean?

Loan-level communication record — phone calls, emails manually logged, vendor discussions.

### Alerts

Separate from comments — `alerts[]` with `dueDate` drives follow-up queue. Not a "comment" but often displayed adjacent in UI.

### Events

Dedicated conversation log webhook category: **NOT ESTABLISHED**. Changes may surface as loan `update`.

See [conversation-logs.md](./conversation-logs.md).

---

## Other documented comment-bearing objects

| Object | Notes |
|--------|-------|
| **AUS Tracking Log** | Editable log — may contain run comments; access via `view=logs` |
| **Trade Note** | Classified as **Note**, not Comment — see [notes.md](./notes.md) |
| **Borrower Contact Note** | CRM **Note** — not condition comment |

---

## Integration anti-patterns

1. **Single "comments" table without `resourceType`** — collisions across condition vs task vs document IDs
2. **Treating milestone `comments` as append-only thread** — it overwrites
3. **Merging conversation logs with condition comments in one stream without labels** — operators lose context
4. **Assuming webhook text is complete** — always GET parent resource for full comment thread

---

## References

- [comment-source-matrix.md](./comment-source-matrix.md)
- [comments-vs-notes-vs-conversations.md](./comments-vs-notes-vs-conversations.md)
- [02-apis/enhanced-condition-api.md](../02-apis/enhanced-condition-api.md)
- [02-apis/task-api.md](../02-apis/task-api.md)
