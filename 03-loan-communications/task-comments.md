# Task & Subtask Comments

Workflow **Task** comments and **disposition** metadata — distinct from Encompass milestone tasks.

**API base:** `/workflow/v1/` — separate from Loan Management API.

---

## Task comments API

| Operation | Method | Path |
|-----------|--------|------|
| List / add comments | GET, POST | `/workflow/v1/tasks/{id}/comments` |
| Subtask comments | GET, POST | `/workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments` |

---

## Who writes / reads

| | |
|--|--|
| **Writes** | Task assignee, users with task access, administrators |
| **Reads** | Users authorized on task; link to loan via `workEntity` or `associations[]` |

Association URN example (official):

```
entityType: urn:elli:encompass:loan:underwritingcondition
entityId: {conditionGuid}
relationship: appliesTo
```

---

## What task comments mean

Operational notes on a **work item** — progress updates, review findings, coordination between processor and underwriter.

**Not the same as:**

| Object | Difference |
|--------|------------|
| Condition comment | About requirement satisfaction |
| Conversation log | Loan-level communication with contact info |
| Milestone comment | Single string on stage — not task thread |
| `resolutionComment` | One-time completion note — not threaded |

---

## Task disposition (completion metadata)

On task update/completion:

| Field | Meaning |
|-------|---------|
| `status` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` — template-driven |
| `completed` | Completion timestamp (read) |
| `resolution` | Disposition code — **LENDER CONFIGURABLE** |
| `resolutionComment` | Free-text outcome |

Timeline: emit **NORMALIZED INTERNAL EVENT TYPE** `TASK_COMPLETED` plus optional disposition fields in `description` or structured `metadata`.

---

## Editable / deletable / historical

| Property | Task comments | Task entity |
|----------|---------------|-------------|
| **Editable** | Yes (append via POST) | Yes (PATCH) |
| **Deletable** | **NOT ESTABLISHED** per comment | Task DELETE (409 if subtasks unless `force=true`) |
| **Historical** | Partial — webhook on new comment | Status transitions via Update webhook |
| **Immutable** | No | No |

Task delete is **hard delete** — not soft delete.

---

## Webhooks (official)

[Workflow Tasks webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks)

| Resource | Events |
|----------|--------|
| Task | Create, Update, Delete |
| Subtask | Create, Update, Delete |
| Task Comment | **Update** (24.2+) |

### Task Comment Update payload (official)

Extra payload includes (per release notes / webhook reference):

- `commentText`
- `createdBy`
- Task reference

Use for near-real-time comment ingestion; **always GET** task for full thread reconciliation.

Subtask comment dedicated webhook: **NOT ESTABLISHED** — poll subtask comments endpoint.

---

## Subtask comments

Subtasks:

- Share parent task assignee (cannot assign separately — official)
- Have own comment endpoints
- Roll up to parent task completion when `autocomplete=true`

Each subtask comment → timeline row with `resourceType=SUBTASK`, `resourceId=subTaskId`, parent task ID in `metadata.parentTaskId`.

---

## Linking tasks to loan timeline

Resolve loan ID from:

1. `workEntity` when entity type is loan
2. `associations[]` where `entityType` references loan or condition (then condition → loan)

Task list filter (official):

```
GET /workflow/v1/tasks?associationEntityId={loanGuid}&associationEntityType=...
```

Or **Task Pipeline** for user work queues:

```
GET /workflow/v1/taskPipeline?page=0&size=20
```

---

## Timeline event types (internal)

| Event type | Official Encompass equivalent |
|------------|------------------------------|
| `TASK_CREATED` | Workflow Task **Create** |
| `TASK_ASSIGNED` | Workflow Task **Update** (assignee change) — **NORMALIZED INTERNAL** |
| `TASK_UPDATED` | Workflow Task **Update** |
| `TASK_COMPLETED` | Workflow Task **Update** (status completed) — **NORMALIZED INTERNAL** |
| `TASK_COMMENTED` | Task Comment **Update** — **NORMALIZED INTERNAL** |
| `SUBTASK_CREATED` | Subtask **Create** — **NORMALIZED INTERNAL** |

Official webhook event names are `Create`, `Update`, `Delete` on Workflow Tasks resource — not `TASK_CREATED`.

---

## John Smith example

Sarah creates task "Review borrower income" associated to paystub condition:

1. `TASK_CREATED` — POST `/workflow/v1/tasks`
2. `TASK_ASSIGNED` — assignee Sarah
3. `TASK_COMMENTED` — "Waiting on VOE from employer."
4. `TASK_COMPLETED` — `resolutionComment`: "Appraisal reviewed."

---

## Production considerations

1. **Instance ID** — validate on PUT/PATCH/DELETE/GET (official requirement)
2. **Pagination** — `start`/`limit` or `page`/`size` on task list
3. **Do not confuse** with milestone workflow tasks in Encompass UI terminology
4. **Dedupe** comment webhook + poll results on task ID + comment hash

---

## References

- [02-apis/task-api.md](../02-apis/task-api.md)
- [01-domain/tasks.md](../01-domain/tasks.md)
- [comments.md](./comments.md)
