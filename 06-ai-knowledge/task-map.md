# Task Map

## Purpose

**Workflow Tasks** (`/workflow/v1`) — distinct from milestone tasks and conditions.

## Scope

Task instances, subtasks, comments, pipeline. Canonical: [01-domain/tasks.md](../01-domain/tasks.md).

## Key concepts

| Concept | Classification |
|---------|----------------|
| Task vs Milestone Task | Different systems — **OFFICIAL_DOCUMENTATION** |
| Subtask assignee | Same as parent — **OFFICIAL_DOCUMENTATION** |
| Associations to condition | URN format — **OFFICIAL_DOCUMENTATION** |
| Task Pipeline | Incomplete tasks for user — **OFFICIAL_DOCUMENTATION** |

## Definitions

- `resolution` / `resolutionComment` — completion disposition — **OFFICIAL_DOCUMENTATION**; codes **LENDER CONFIGURABLE**
- `workEntity` — usually loan reference — **OFFICIAL_DOCUMENTATION**
- `customAttributes` — opaque JSON — **OFFICIAL_DOCUMENTATION**

## Relationships

Task → Loan via workEntity; Task → Condition via associations — [relationship-map.md](./relationship-map.md)

## API references

| Operation | Path |
|-----------|------|
| List/create | `/workflow/v1/tasks` — **OFFICIAL_DOCUMENTATION** |
| Comments | `/workflow/v1/tasks/{id}/comments` — **OFFICIAL_DOCUMENTATION** |
| Pipeline | `/workflow/v1/taskPipeline` — **OFFICIAL_DOCUMENTATION** |
| Templates | `/workflow/v1/templates/task/items` — **OFFICIAL_DOCUMENTATION** |

[02-apis/task-api.md](../02-apis/task-api.md)

Webhooks: Create, Update, Delete, Task Comment Update (24.2+) — **OFFICIAL_DOCUMENTATION**

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** "Review borrower income" assigned to Sarah.

## Production notes

Validate `instanceId` on mutations — **OFFICIAL_DOCUMENTATION**
Delete parent: 409 unless `force=true` — **OFFICIAL_DOCUMENTATION**
Subtask comment webhook — **NOT_ESTABLISHED**

## Common mistakes

- Expecting separate subtask assignees — **OFFICIAL_DOCUMENTATION** not supported

## FAQ

See [developer-faq.md](./developer-faq.md).

## Related documents

- [03-loan-communications/task-comments.md](../03-loan-communications/task-comments.md) · [task workload in 05-dashboard UX](../05-dashboard-architecture/dashboard-ux.md)

## Source references

- [Workflow Task Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy) — Last verified 2026-08-13
