# 07 — Workflow Task Service

> **Official source:** [Workflow Task Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy) · [Task Instance Management APIs](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-tasks) · [Workflow Tasks Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks)

**API version:** `workflow/v1` (distinct from Encompass loan V1/V3 APIs)

**Base URL:** `https://api.elliemae.com` (UAT: `https://concept.api.elliemae.com`)

---

## Core mental model

A **workflow task** is an assignable unit of work managed by the Workflow Task Service. It supports templates, instances, subtasks, task groups, comments, associations to loans/conditions, and role-based assignment.

**Critical distinction:** A workflow task is **not** the same as a **milestone task** (`milestoneTasks` on the loan object). Milestone tasks are legacy checklist items tied to milestone configuration. Workflow tasks are a separate, richer framework introduced for task-based workflows in Encompass (web version).

| Concept | Workflow Task (`workflow/v1`) | Milestone Task (loan `milestoneTasks`) |
|---------|-------------------------------|----------------------------------------|
| API surface | `/workflow/v1/tasks`, `/workflow/v1/taskPipeline` | Returned on V3 Get Loan with `view=logs` or `view=full` |
| Assignee model | User, role URN, user group, external queue URN | Milestone checklist configuration |
| Comments | `/workflow/v1/tasks/{id}/comments` | Not the same API surface |
| Webhooks | Task, Subtask, TaskComment, TaskGroup resources | Loan `milestone` webhook subevents |

Do not conflate these when building integrations.

---

## API sets

Per the [Workflow Task Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy):

### 1. Task Configuration APIs

| Area | Purpose |
|------|---------|
| **Task Template APIs** | Configure task and sub-task templates (create, update, retrieve, delete) |
| **Task Settings APIs** | Global settings for tasks and sub-tasks |

Reference: [Task Configuration](https://developer.icemortgagetechnology.com/developer-connect/reference/task-configuration)

### 2. Task Instance Management APIs

| Area | Endpoint prefix | Purpose |
|------|-----------------|---------|
| **Task APIs** | `/workflow/v1/tasks` | Create, update, delete, retrieve tasks; add/view comments |
| **Sub-Task APIs** | `/workflow/v1/tasks/{taskId}/subtasks` | Manage subtasks and subtask comments |
| **Task Pipeline API** | `/workflow/v1/taskPipeline` | Tasks assigned to a user or user's user group(s) |

---

## Key entities

### Task (instance)

Primary resource tracking state, assignee, completion status, optional subtasks, associations, and custom attributes.

- **Subtasks** are not separately assignable; they inherit the parent task assignee.
- **`required`** (subtask): parent cannot complete until required children complete.
- **`autocomplete`** (task): task auto-completes when all required children complete.
- **`customAttributes`**: opaque name/value pairs; not indexed for search.
- **Associations**: 3-tuple of `entityType` (URN), `entityId`, `relationship` (e.g. link to an underwriting condition).
- **Authorizations**: control who can use a template to add instances (`CAN_CREATE` relationship).

**Required fields to create:** `name` and `type` (per overview).

### Task template vs instance

| Layer | What it is | How you use it |
|-------|------------|----------------|
| **Template** | Administrator-defined pattern (name, role, subtask structure) | Configure via Task Template APIs |
| **Instance** | Live work item on a loan | Create via `POST /workflow/v1/tasks` with `templateId` |

**Create from template:**

```http
POST /workflow/v1/tasks?view=entity&templateId={templateId}
```

When `templateId` is passed, the payload can be empty or override template attributes.

### Task group

Optional container grouping related tasks. Supports autocomplete, required flags, status, resolution.

### Subtask

Child work under a parent task. Category examples in webhook samples include `loansubtask`.

---

## Primary endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List tasks | GET | `/workflow/v1/tasks` |
| Get task | GET | `/workflow/v1/tasks/{id}` |
| Create task | POST | `/workflow/v1/tasks` |
| Update task | PUT/PATCH | `/workflow/v1/tasks/{id}` |
| Delete task | DELETE | `/workflow/v1/tasks/{id}` |
| Task comments (list) | GET | `/workflow/v1/tasks/{id}/comments` |
| Add task comment | POST | `/workflow/v1/tasks/{id}/comments` |
| Subtask comments | GET | `/workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments` |
| Task pipeline | GET | `/workflow/v1/taskPipeline` |

---

## Query parameters (Get All Tasks)

Documented filters include:

| Parameter | Purpose |
|-----------|---------|
| `loanId` | Filter by loan GUID |
| `assignee`, `assigneeEntityId`, `assigneeEntityType` | Filter by assignee |
| `associationEntityId`, `associationEntityType` | Filter by associated entity |
| `createdDate`, `fromCreatedDate`, `toCreatedDate` | Creation date filters (MM-DD-YYYY) |
| `completedDate`, `fromCompletedDate`, `toCompletedDate` | Completion date filters |
| `dueDate`, `fromDueDate`, `toDueDate` | Due date filters |
| `name`, `priority`, `resolution`, `status` | Task attributes |
| `metaData=true` | Include `taskTypeName` from metadata object |

**Task Pipeline** returns only **non-completed** tasks. Default sort: ascending by priority, then create date. Supports `sortBy` (e.g. `+rank,-priority`).

---

## Pagination

Both offset-based and page-based pagination are supported on **Get All Tasks** and **Get Task Pipeline**:

| Style | Parameters | Example |
|-------|------------|---------|
| Offset-based | `start`, `limit` | `GET /workflow/v1/tasks?start=0&limit=20` |
| Page-based | `page`, `size` | `GET /workflow/v1/tasks?page=0&size=20` |

Same pattern applies to `/workflow/v1/taskPipeline`.

---

## assignRole

Query parameter on **Create a Task**:

| Parameter | Default | Behavior |
|-----------|---------|----------|
| `assignRole=true` | `false` | If the task template has a role assignment and the loan's milestone or milestone-free logs have a user assigned to that role, the API assigns that user to the task |

**John Smith example (illustrative):**

Sarah (Processor) is the loan associate on the **Processing** milestone role. Mike creates a workflow task from template **"Verify income"** with `assignRole=true`. The API assigns Sarah automatically because she holds the processor role on John Smith's loan.

```http
POST /workflow/v1/tasks?templateId={verify-income-template-id}&assignRole=true&view=entity
Authorization: Bearer {token}
Content-Type: application/json

{
  "associations": [
    {
      "entityType": "urn:elli:encompass:loan",
      "entityId": "{john-smith-loan-guid}",
      "relationship": "appliesTo"
    }
  ]
}
```

Other create query parameters:

| Parameter | Default | Notes |
|-----------|---------|-------|
| `allowCreateForCompletedParent` | `true` | Allow create in completed task group |
| `noDuplicate` | `false` | When `true`, blocks duplicate instances for same template |
| `view=entity` | — | Response body matches GET of created resource |

---

## EntityType URNs and assignees

Examples from official documentation:

```json
{
  "entityType": "urn:elli:encompass:user",
  "entityId": "jsmith"
}
```

Well-known Encompass User URN enables access control: requester must be assignee or elevated persona (e.g. Administrator).

Custom lender URNs are valid for external queues:

```json
{
  "entityType": "urn:abc_lender:task:queue",
  "entityId": "my_task_queue"
}
```

Role URN example: `urn:ell:encompass:role` (as documented in overview).

---

## Common API behaviors

| Operation | Behavior |
|-----------|----------|
| POST | `Location` header contains GET route (e.g. `v1/workflow/tasks/{id}`) |
| PUT/PATCH with `view=entity` | Response matches GET body |
| PUT/PATCH/DELETE/GET | `instanceID` on request must correlate with entity `instanceID`; mismatch → HTTP 403 |
| DELETE with children | Fails with HTTP 409 unless `force=true` (deletes parent and children) |

---

## Webhooks — Workflow Tasks category

Subscribe via [Subscriptions API](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions). Resource category: [Workflow Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks).

| Resource | Events | Support |
|----------|--------|---------|
| **Task** | Create, Update, Delete | Smart Client, API |
| **Subtask** | Create, Update, Delete | Smart Client, API |
| **TaskGroup** | Create, Update, Delete | Smart Client, API |
| **TaskComment** | Update | Smart Client, API (added 24.2) |

**TaskComment Update** fires when a comment is added or when workflow task disposition is added/changed. Disposition updates generate a new comment table entry. Extra payload includes `commentText`, `entityId`, `entityType` (Task), `createdBy`, etc.

Sample `resourceRef` patterns:

- Task: `workflow/v1/tasks/{id}`
- Subtask: `workflow/v1/subtasks/{id}`
- TaskGroup: `workflow/v1/taskgroups/{id}`
- TaskComment: `workflow/v1/comments/{id}`

---

## John Smith loan — workflow task examples

**Illustrative scenarios** for John Smith's $400K purchase loan:

| Workflow task (template/instance) | Typical assignee | Trigger |
|-----------------------------------|------------------|---------|
| Verify income | Sarah (Processor) | `assignRole=true` after Processing milestone active |
| Order appraisal | Sarah or external queue | Manual or automated from template |
| Review credit | Robert (Underwriter) | Task group "Review Credit" after submittal |
| Order title | Lisa (Closing Coordinator) | Association to loan + role assignment |
| Clear prior-to-doc conditions | Sarah | Linked to condition via association URN |

**Task pipeline for Sarah:**

```http
GET /workflow/v1/taskPipeline?assignee=sarah&start=0&limit=50
```

Returns open tasks assigned to Sarah or her user groups, sorted by priority.

**Subtask example under "Verify income":**

Parent task assigned to Sarah; subtasks might include "Pull paystubs", "Verify W-2", "Calculate qualifying income". Subtasks share Sarah's assignment; required subtasks block parent completion unless `autocomplete` rules apply.

---

## Production integration concerns

1. **Version isolation** — Always call `workflow/v1` with workflow OAuth scopes; do not assume loan V3 endpoints manage workflow tasks.
2. **instanceId correlation** — Multi-instance lenders must pass correct instance context; 403 errors often indicate instance mismatch.
3. **Pagination at scale** — Use `loanId` filter when syncing tasks per loan; pipeline API for user work queues.
4. **Webhook + API reconciliation** — Webhook delivery is not guaranteed in real time; reconcile with Get All Tasks using `fromLastModifiedDate`.
5. **assignRole dependency** — Requires milestone/milestone-free associate already assigned; automate associate assignment first (see [08-milestones-and-associates.md](./08-milestones-and-associates.md)).
6. **Soft delete** — Task Instance Management APIs support soft delete (see release notes); deleted tasks may still appear in queries with appropriate filters.
7. **TaskComment webhook (24.2+)** — Plan ingestion for disposition-driven comment streams separately from loan-level conversation logs.
8. **Do not hardcode task template names** — Template names are lender-configured; store template IDs from Task Template APIs.

---

## Related files

| File | Topic |
|------|-------|
| [08-milestones-and-associates.md](./08-milestones-and-associates.md) | Milestones, associates, `assignRole` prerequisites |
| [11-conversation-logs-notes-comments.md](./11-conversation-logs-notes-comments.md) | Unified comment aggregation (task vs conversation vs condition) |
| [13-webhooks-events.md](./13-webhooks-events.md) | Webhook architecture (if present in KB) |
