# Tasks (Workflow Tasks)

## Critical distinction: three "task" concepts

Encompass has **three separate task concepts**. Conflating them causes integration bugs.

| Concept | System | Purpose |
|---------|--------|---------|
| **Workflow Task** | Workflow Task Service (`/workflow/v1/...`) | Assignable unit of work; robust framework with templates, subtasks, pipeline |
| **Milestone Task** | Encompass native (loan schema `MilestoneTaskContract`) | Tasks tied to Encompass milestones |
| **Condition / document work** | eFolder / Conditions | Requirements and evidence — not tasks |

Official documentation:

> A workflow task is different from the milestone task that exists in Encompass. Workflow tasks provide a much more robust framework for managing tasks.

---

## Workflow Task definition

The Workflow Task Service provides:

> the core concept of the Task, which represents an assignable unit of work in a workflow, as well as the APIs for creating, assigning, and completing workflow tasks.

A Task tracks:

- Assignee (user, role, group, or external URN)
- Status, priority, due date
- Completion state
- Optional subtasks
- Associations to external entities (loans, conditions)
- Comments

---

## Task Template vs Task Instance

| Concept | Description |
|---------|-------------|
| **Task Template** | Admin-configured blueprint (Task Configuration APIs) |
| **Task Instance** | Runtime task created from template or ad hoc (Task Instance Management APIs) |

Creating from template:

```
POST /workflow/v1/tasks?view=entity&templateId={templateId}
```

When `templateId` is passed, payload can be empty or override template attributes.

Template configuration includes authorizations — which roles/groups can create instances from the template.

---

## Subtasks

- A Task may contain 1+ **Subtasks**
- Subtasks are **not separately assignable** — implicitly assigned to parent task assignee
- Subtasks have their own status, comments, and `required` flag

### Required subtasks

Subtask `required: true` means the parent Task **cannot** be marked complete until all required subtasks are complete.

### Autocomplete

Task `autocomplete: true` means the Task auto-completes when all required subtasks complete.

---

## Task attributes (key fields)

| Attribute | Description |
|-----------|-------------|
| `name`, `type` | Required minimal fields to create |
| `status` | e.g., `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `priority` | Numeric priority for pipeline sorting |
| `rank` | Additional sort key |
| `due` / `dueDate` | Due date |
| `started` | UTC datetime task started |
| `completed` | UTC datetime task completed |
| `duration` / `durationFormat` | Expected duration (Minute/Hour/Day) |
| `assignee` | Primary assignee entity reference |
| `workEntity` | Entity the work applies to (often the loan) |
| `templateId` | Source template if created from template |
| `taskGroupId` | Parent task group |
| `resolution` / `resolutionComment` | Completion disposition |
| `tags` | Searchable tags |
| `customAttributes` | Opaque name/value pairs (not indexed for search) |
| `associations` | Links to external entities |
| `metadata` | Includes `taskTypeName` when queried with `metaData=true` |

---

## Assignee model

Assignees use entity references with URNs for external types:

```json
{ "entityType": "urn:elli:encompass:user", "entityId": "jsmith" }
```

Well-known Encompass URNs:

| Entity | URN |
|--------|-----|
| User | `urn:elli:encompass:user` |
| Role | `urn:elli:encompass:role` |

When assignee is an Encompass User URN, the system enforces access — only the assignee or elevated persona (e.g., Administrator) can retrieve/modify the task.

Query parameter `assignRole=true` on create indicates role-based assignment (**see API docs for usage**).

---

## Associations — linking tasks to conditions

Associations are a 3-tuple:

```json
{
  "entityType": "urn:elli:encompass:loan:underwritingcondition",
  "entityId": "{condition-guid}",
  "relationship": "appliesTo"
}
```

Associations are **opaque to the Task Service** — no validation beyond URN format. Your dashboard uses associations to connect:

- Task: "Review borrower income" (work for staff)
- Condition: "Provide latest paystubs" (requirement from borrower)

These are **different objects** linked via association in your UI/integration layer.

---

## Task Pipeline

```
GET /workflow/v1/taskPipeline
```

Returns workflow tasks assigned to the calling user or their user groups where tasks are **not completed**.

Default sort: ascending by Priority, then Create Date.

Supports offset pagination (`start`, `limit`) and page pagination (`page`, `size`).

---

## Task comments

Task APIs support adding/viewing **task comments**. Webhook events exist for Task Comment resource (Update event when comment added).

Distinct from condition comments, document comments, milestone comments.

---

## Disposition / completion

On completion, tasks may record:

- `resolution` — disposition code/value
- `resolutionComment` — free text (e.g., "Appraisal reviewed — value supported")

Example task comment: "Appraisal reviewed."

---

## Task vs Condition — side by side

| Dimension | Task: "Review borrower income" | Condition: "Provide latest paystubs" |
|-----------|-------------------------------|----------------------------------------|
| Object type | Workflow Task instance | Enhanced/Standard Condition |
| Nature | Work assignment | Requirement |
| Assignee | Processor/UW (staff) | Borrower/third party (`requestedFrom`) |
| Evidence | None — it's work to perform | Documents/attachments prove satisfaction |
| API | `/workflow/v1/tasks` | `/encompass/v3/loans/{loanId}/conditions` |
| Completion | Task status → COMPLETED | Condition tracking/status satisfied |

---

## John Smith example

| When | Task | Related condition |
|------|------|-------------------|
| Processing | Sarah: "Verify employment history" | — |
| Processing | Sarah: "Review borrower income" | "Provide most recent two paystubs" |
| Underwriting | Robert: "Review appraisal" | — |
| Closing | Lisa: "Confirm closing disclosure signed" | Prior To = Docs |

Sarah completes the income review **task** after paystub **condition** documents are received and reviewed.

---

## Webhook events (Workflow Tasks category)

| Resource | Events |
|----------|--------|
| Task | Create, Update, Delete |
| Subtask | Create, Update, Delete |
| Task Group | Create, Update, Delete |
| Task Comment | Update |

See [events.md](./events.md).

---

## API sets

| API set | Endpoints | Purpose |
|---------|-----------|---------|
| Task Configuration | `/workflow/v1/settings/...`, templates | Admin templates and settings |
| Task Instance Management | `/workflow/v1/tasks`, subtasks | Runtime CRUD |
| Task Pipeline | `/workflow/v1/taskPipeline` | User work queue |

---

## References

- [Workflow Task Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy)
- [Get All Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks)
- [Create a Task](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-task)
- [Get Task Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/get-task-pipeline)
- [Workflow Tasks Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks)
