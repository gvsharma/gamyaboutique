# Workflow tasks

Separate product: Encompass Workflow Task Service. Prefix **`/workflow/v1`**, not `/encompass/v3`.

“The Task Service provides the core concept of the Task, which represents an assignable unit of work in a workflow, as well as the APIs for creating, assigning, and completing workflow tasks.”

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy)

## Instance APIs

| Name | Method | Path |
| ---- | ------ | ---- |
| Create Task | POST | `/workflow/v1/tasks` |
| Get All Tasks | GET | `/workflow/v1/tasks` (offset or page pagination; `metaData=true`) |
| Get Task Pipeline | GET | `/workflow/v1/taskPipeline` |
| Subtasks | GET | `/workflow/v1/tasks/{taskId}/subtasks` |
| Subtask comments | GET/POST | `/workflow/v1/tasks/{taskId}/subtasks/{subTaskId}/comments` |

Task comments at `/workflow/v1/tasks/{taskId}/comments` are described at overview level.

## Task Pipeline vs all tasks

Get Task Pipeline: “Returns workflow tasks assigned to a user or the user's User Group(s). Returns only tasks that are **not completed**.” Default sort priority then create date.

This is **not** “all tasks on a loan.” Use Get All Tasks with filters for loan-scoped lists (confirm filter params on live reference).

## Templates

`POST /workflow/v1/templates/task/items`, subtask templates under `.../{taskTemplateId}/subtasks`. Authorization tuple: entityType URN (e.g. role), entityId, relationship (e.g. CREATE).

## Deprecated

Task **Group** APIs deprecated 24.3.

## Events

Webhook resource Task / Subtask / TaskComment / TaskGroup: create/update/delete (TaskComment: update). Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks)

Assignment, owner, status, aging: present on task objects in API responses — exact property names should be copied from the live OpenAPI for Create/Get Task. Do not invent enums here if not quoted. Confirm on [https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-task](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-task).
