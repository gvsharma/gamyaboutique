# Comments (`LogCommentContract`)

Attributes documented: `id`, `comments`, `forRole`, `addedDate`, `addedBy`, `reviewedDate`, `reviewedBy`, `isExternal`.

| Surface | Path |
| ------- | ---- |
| Document | `POST /encompass/v1/loans/{loanId}/documents/{documentId}/comments` |
| Condition | enhanced `.../conditions/{id}/comments` |
| Subtask | `/workflow/v1/tasks/{taskId}/subtasks/{id}/comments` |
| Generic get/manage | get-comments / manage-comments (`entityType` enum includes Condition, Document, Milestone, WorkflowTask, …) |

Milestone comments: generic entityType includes Milestone; dedicated “milestone comments API” name: confirm explorer.

Source: add-comments-to-a-document, V3 contracts
