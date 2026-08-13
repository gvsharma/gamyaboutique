# Workflow Task API

## Business Purpose

Create, assign, track, and complete workflow tasks and subtasks — assignable units of work distinct from Encompass milestone tasks.

## Mortgage Use Case

Task "Review borrower income" assigned to Sarah (Processor); associated to paystub condition via `associations[]`.

## Official Documentation

- [Workflow Task Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy)
- [Get All Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks)
- [Create a Task](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-task)
- [Get Task Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/get-task-pipeline)
- [Get Subtasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-subtasks)
- [Task Configuration](https://developer.icemortgagetechnology.com/developer-connect/reference/task-configuration)
- [Workflow Tasks Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks)

## API Version

**V1** — base path `/workflow/v1/`

## Endpoints

### Task Instances

| Operation | Method | Path |
|-----------|--------|------|
| List tasks | GET | `/workflow/v1/tasks` |
| Create task | POST | `/workflow/v1/tasks` |
| Bulk update | PATCH | `/workflow/v1/tasks/bulk` |
| Get task | GET | `/workflow/v1/tasks/{id}` |
| Update task | PATCH | `/workflow/v1/tasks/{id}` |
| Delete task | DELETE | `/workflow/v1/tasks/{id}` |
| Task comments | GET/POST | `/workflow/v1/tasks/{id}/comments` |
| Task pipeline | GET | `/workflow/v1/taskPipeline` |

### Subtasks

| Operation | Method | Path |
|-----------|--------|------|
| List/create | GET/POST | `/workflow/v1/tasks/{taskId}/subtasks` |
| Get/update/delete | GET/PATCH/DELETE | `/workflow/v1/tasks/{taskId}/subtasks/{subTaskId}` |
| Subtask comments | GET/POST | `/workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments` |

### Templates (see also condition-template-api patterns)

| Operation | Method | Path |
|-----------|--------|------|
| Task templates | GET/POST/PATCH | `/workflow/v1/templates/task/items` |
| Template item | GET/PATCH/DELETE | `/workflow/v1/templates/task/items/{id}` |
| Subtask templates | GET/POST | `/workflow/v1/templates/task/items/{taskTemplateId}/subtasks` |
| Task settings | GET/PATCH | `/workflow/v1/settings/task` |

## Authentication

Bearer OAuth2. Assignee access enforced when assignee is `urn:elli:encompass:user`.

## Create Task

### Query Parameters (documented)

| Parameter | Description |
|-----------|-------------|
| `templateId` | Create from template; payload may override |
| `view` | e.g. `entity` — return full contract in response |
| `assignRole` | `"true"` for role-based assignment |
| `allowCreateForCompletedParent` | Default `true` |

### Request — Minimal (Illustrative)

**Confirmed required fields:** `name`, `type` (from overview).

```json
{
  "name": "Review borrower income",
  "type": "Processing",
  "priority": 1,
  "associations": [
    {
      "entityType": "urn:elli:encompass:loan:underwritingcondition",
      "entityId": "CONDITION_GUID",
      "relationship": "appliesTo"
    }
  ]
}
```

Association URN format confirmed in official overview.

## Field Reference

| Field | Type | Required | Read/Write | Meaning | Mortgage Significance | Configurable? | Example |
|-------|------|----------|------------|---------|----------------------|---------------|---------|
| `name` | string | Yes | Write | Task title | Work description | No | "Review borrower income" |
| `type` | string | Yes | Write | Task category | Reporting/filtering | **LENDER CONFIGURABLE** | "Processing" |
| `status` | string | — | Read/Write | Completion state | Pipeline columns | Template-driven | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `priority` | integer | — | Write | Sort priority | Work queue ordering | No | 1 |
| `due` | datetime | — | Write | Due date | SLA | No | ISO 8601 |
| `completed` | datetime | — | Read | Completion time | Metrics | No | — |
| `assignee` | object | — | Write | Primary assignee | Ownership | — | User URN |
| `workEntity` | EntityRef | — | Write | Work context | Usually loan | — | Loan ref |
| `templateId` | string | — | Read | Source template | Lineage | Admin | — |
| `associations[]` | array | — | Write | External links | Condition/loan links | No | See overview |
| `autocomplete` | boolean | — | Write | Auto-complete when subtasks done | Workflow rule | Template | `true` |
| `required` | boolean | — | Write | Subtask required flag | Completion gate | Template | — |
| `customAttributes` | object | — | Write | Extension fields | Opaque to service | No | — |
| `resolution` | string | — | Write | Disposition code | Completion audit | **LENDER CONFIGURABLE** | — |
| `resolutionComment` | string | — | Write | Disposition notes | "Appraisal reviewed." | No | — |

## Relationships

- Task → Loan via `workEntity` or association
- Task → Condition via association URN
- Task → Subtasks (1:n, same assignee)
- Task Template → Task Instance

## Lifecycle

Create (optionally from template) → assign → in progress → subtasks complete → task complete (manual or autocomplete)

## Errors

Template endpoints: `400`, `401`, `403`, `404`, `500`. Task delete with children: `409` unless `force=true`.

## Pagination

Offset: `start`, `limit`. Page: `page`, `size`. See [api-pagination.md](./api-pagination.md).

## Filtering

`assignee`, `statusIn`, `priority`, `dueDate`, `templateIds`, `tags`, `associationEntityId`, `associationEntityType`, `metaData=true` for `taskTypeName`.

## Webhooks

| Resource | Events |
|----------|--------|
| Task | Create, Update, Delete |
| Subtask | Create, Update, Delete |
| Task Comment | Update |
| Task Group | Create, Update, Delete |

## Permissions

Template `authorizations[]` with `CAN_CREATE` relationship; assignee or Administrator for access.

## Locking

NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION for workflow APIs.

## Version Dependencies

Task-based workflows require Encompass Web configuration.

## Configuration Dependencies

Task templates and settings — **LENDER CONFIGURABLE**.

## Production Considerations

- Validate `instanceId` match on PUT/PATCH/DELETE/GET
- Subtasks not separately assignable
- Use Task Pipeline for user work queues

## Common Developer Mistakes

- Confusing with Encompass milestone tasks
- Expecting separate subtask assignees
- Deleting parent task without `force=true`

## Real Loan Example

Sarah's pipeline: `GET /workflow/v1/taskPipeline?page=0&size=20` → filter tasks associated to John Smith loan.

## Java Example

```java
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://api.elliemae.com/workflow/v1/taskPipeline?page=0&size=20"))
    .header("Authorization", "Bearer " + token)
    .GET().build();
```

## cURL Example

```bash
curl -s "https://api.elliemae.com/workflow/v1/tasks?start=0&limit=20&metaData=true" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- Do we sync tasks via webhooks or poll pipeline?
- How do we map association URNs to our condition/loan tables?
- Which templates are authorized for our integration persona?
