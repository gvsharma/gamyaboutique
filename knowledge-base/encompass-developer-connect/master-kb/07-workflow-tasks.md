# 07 — Workflow Tasks

**Related:** [08 Milestones](./08-milestones-and-associates.md) · [12 People](./12-organizations-users-roles.md) · [11 Comments](./11-conversation-logs-notes-comments.md)

**Official:** [Get All Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks) · [Get Comments for a Task](https://developer.icemortgagetechnology.com/developer-connect/reference/get-comments-for-a-task) · [Get All Subtasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-subtasks) · [Get Comments for a Subtask](https://developer.icemortgagetechnology.com/developer-connect/reference/get-comments-for-a-subtask) · [Workflow Tasks webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks)

---

## A. Business meaning

A **Workflow Task** is an **assignable unit of work**. It is **not** a milestone and **not** a condition.

ICE: Workflow Task Instance Management APIs manage **task instances**, **sub-tasks**, **comments**, and a **pipeline** of tasks assigned to a user or the user’s **user group(s)**.

**Important distinction:** Workflow Tasks are not the same as **legacy / milestone tasks** (`MilestoneTask` appears as an entity type in ICE’s EntityReference list). Do not use the Task Service contract for milestone-task logs.

## B. John Smith examples (illustrative titles)

Template names are lender-configured. Teaching titles only:

- Verify income
- Review assets
- Order appraisal (XYZ)
- Review appraisal
- Review title (ABC)
- Prepare closing package

Sarah may own “Order appraisal.” Robert may own “Review income.” Lisa may own “Prepare closing package.”

## C. Domain model

```text
Task Template (configuration)
        |
        v
Task Instance  ---- workEntity --> Loan (urn:elli:encompass:loan in webhook sample)
        |
        +-- assignee (user / group — confirm entity types in current contract)
        +-- status (documented: Not started | In progress | Completed)
        +-- priority, rank, due, tags, customAttributes
        +-- associations (e.g. condition — only if contract/association type documents it)
        +-- comments
        +-- subtasks
              +-- required flag
              +-- autocomplete on parent
              +-- comments
```

ICE documents `required`: entity must be complete to mark parent complete. `autocomplete`: parent marked complete if all **required** sub-entities are completed.

**Subtask independent assignment:** the seed claimed subtasks are not independently assignable. Official `taskResponse` includes `assignee` on the same schema used for entities. **Whether subtasks can have a different assignee than the parent is NOT ESTABLISHED here** — verify on Sub-Task create/update pages. Do not hardcode either way.

## D. APIs (V1 Workflow)

| Operation | Endpoint |
|-----------|----------|
| List tasks | `GET /workflow/v1/tasks` |
| Task comments | `GET /workflow/v1/tasks/{id}/comments` |
| Subtasks | `GET /workflow/v1/tasks/{taskId}/subtasks` |
| Subtask comments | `GET /workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments` |

Pagination **documented** on list: offset `start`/`limit` **or** page `page`/`size`. `metaData=true` to retrieve `taskTypeName` from metadata.

Pipeline: ICE describes a Task Pipeline API for work assigned to a user or user group(s). Confirm current path on the portal (do not invent `/pipeline` if the page uses query filters on `GET /workflow/v1/tasks` instead).

Task Configuration / templates: separate “Workflow Task Configuration” area — confirm current URLs.

## E–F. Request / response

```http
GET /workflow/v1/tasks?start=0&limit=20
Authorization: Bearer {accessToken}
```

**Illustrative payload based on documented `taskResponse`:**

```json
{
  "id": "{taskId}",
  "name": "Verify income",
  "status": "In progress",
  "autocomplete": true,
  "assignee": { "entityId": "{userId}", "entityType": "User" },
  "workEntity": { "entityId": "{loanId}", "entityType": "urn:elli:encompass:loan" }
}
```

`entityType` values must match the current contract/examples. Webhook sample uses `workEntity.entityType` of `urn:elli:encompass:loan`.

Documented status strings: **Not started**, **In progress**, **Completed**. Live samples also showed `COMPLETED/IN_PROGRESS/NOT_STARTED` — confirm casing in real responses; do not assume one casing.

Also documented: `resolution`, `resolutionComment` (disposition-like). Exact disposition enums: **NOT ESTABLISHED** beyond those property names.

`customAttributes`: present on the contract. Whether they are indexed/searchable: **NOT ESTABLISHED** on the Get All Tasks page reviewed. Do not claim searchability.

## G. Field table (documented taskResponse subset)

| Field | Meaning | Business | R/W | Configurable? | Example |
|-------|---------|----------|-----|---------------|---------|
| `id` | Task id | Join | assigned | no | GUID |
| `name` / `description` / `type` | What work | Ops | per create/update pages | template | Verify income |
| `status` | Lifecycle | Queue | per update API | documented three values | In progress |
| `assignee` | Who | Workload | per API | role/group eligibility | Sarah |
| `due` | Due date | SLA | per API | template | ISO date |
| `priority` / `rank` | Order | Pipeline UX | per API | yes | integers |
| `autocomplete` | Complete parent from required children | Workflow | per API | template | true |
| `required` | Must complete for parent | Gate | per API | template | true |
| `customAttributes` | Extra | Bank-specific | per API | yes | — |
| `associations` | Links to other entities | Condition/loan links | per API | yes | — |
| `taskGroupId` | Group | Grouping | per API | yes | — |

Who changes it: assignee, managers, automation, autocomplete. What causes change: completion of required subtasks, explicit update, delete.

## H. Lifecycle

```text
Not started -> In progress -> Completed
```

Plus Create/Update/Delete webhooks. Delete is a documented task event. Whether Completed tasks can be reopened: **NOT ESTABLISHED** — verify update semantics.

## I. Events (documented)

Workflow Tasks webhook resources include **Task**, **Subtask**, and **Task Group** with **Create / Update / Delete** (Smart Client, API) on task and task group. Confirm subtask event table on the current page (fetch showed a subtask section).

Loan webhooks are a different resource. A task update does not replace loan `update`.

## J. Integration

Filter `GET /workflow/v1/tasks` by loan via documented query params (list includes association filters on subtasks: `associationEntityId`, `associationEntityType`). Confirm loan filter names on Get All Tasks before coding.

Map tasks to bank work queues by `assignee` and user groups. Respect SoD: platform may allow Mike to be LO and processor; **bank policy** may forbid it ([12](./12-organizations-users-roles.md)).

## K. Production

- Pagination required for pipeline-scale lists.
- Idempotent handling of Create/Update/Delete.
- Comments: separate GET; do not assume they are on the task list payload.
- Authorization: user vs group assignment.

## L. Common mistakes

1. Using Workflow Tasks to model milestones.
2. Assuming one status set with different casing without testing.
3. Claiming custom attributes are searchable.
4. Ignoring user-group pipeline work.

## M. Questions

1. What does `autocomplete` do if an optional subtask is open?
2. How do you show Sarah’s queue including group-assigned tasks?
3. How do you associate a task with Robert’s paystub condition without inventing fields?
