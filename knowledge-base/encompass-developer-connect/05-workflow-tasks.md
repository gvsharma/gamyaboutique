# 05 — Workflow Tasks

**Share this file when:** designing work queues, assignment, or task/condition associations.

**Related:** [02 Definitions](./02-four-key-definitions.md) · [04 Milestones](./04-milestones.md) · [06 Conditions](./06-conditions.md) · [11 Comments](./11-conversation-logs-comments-notes.md)

---

## What a workflow task is

A Workflow Task is an assignable unit of work.

```text
Task = What work needs to be done?
```

**Workflow Tasks are distinct from milestone tasks.** Do not model them as the same object.

ICE's Task Service / Workflow Task Instance Management APIs provide:

- task templates
- task instances
- subtasks
- task comments
- task pipeline
- assignment
- completion
- associations
- custom attributes

Confirm the current API surface in ICE docs. ICE describes:

- **Task APIs** — create, update, delete, retrieve tasks; add/view task comments
- **Sub-Task APIs** — create, update, delete, retrieve sub-tasks; add/view sub-task comments
- **Task Pipeline API** — retrieve workflow tasks assigned to a user or the user's user group(s)

## Template vs instance (illustrative)

```text
Task Template:
"Verify Income"

        |
        v

Task Instance:
Loan 1002456789

        |
        +-- Assignee: Processor
        +-- Status: Open
        +-- Due Date
        +-- Comments
        +-- Subtasks
```

The template is reusable configuration. The instance is work on a specific loan. Status names, custom attributes, and assignment rules are lender-configurable. Verify in the target environment.

## Association with a condition (illustrative)

A task may be associated with a condition:

```text
Condition:
Large Deposit Explanation
       |
       v
Task:
Review Large Deposit Evidence
       |
       v
Underwriter
```

The condition is the **requirement**. The task is the **work**. They can be linked; they are not the same thing.

## Subtasks

Subtasks belong to the parent task and are **not independently assignable**.

Do not build a work queue that assigns subtasks as if they were first-class tasks.

## Comments

Task comments and subtask comments are **object-specific**. They are not Conversation Logs.

Example (illustrative): `"Appraisal reviewed."`

See [11 Conversation Logs vs comments vs notes](./11-conversation-logs-comments-notes.md).

## Pipeline and pagination

ICE documents that `GET /workflow/v1/tasks` supports:

- offset-based pagination (`start`, `limit`)
- page-based pagination (`page`, `size`)

ICE also notes that `taskTypeName` is stored in metadata and is returned when `metaData=true` is passed.

Confirm query parameters in current docs before implementing list/pipeline screens.

## Integration notes

- Subscribe to Workflow Tasks webhooks if the catalog includes them; still fetch current task state when required.
- Normalize task events separately from milestone and condition events. See [16](./16-normalized-communications-timeline.md).
- Never assume one user equals one role when assigning or displaying tasks. See [10](./10-associates-and-roles.md).

## Official documentation

- [Get All Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks)
- [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
- Search Developer Connect for **Workflow Tasks** templates, pipeline, and webhook resource pages — confirm current URLs before linking in implementation tickets.
