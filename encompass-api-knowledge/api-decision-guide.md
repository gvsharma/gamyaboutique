# API decision guide

| Question | Answer | Source / label |
| -------- | ------ | -------------- |
| 100 loans for one HLA | `POST /encompass/v3/loanPipeline` with discovered canonical filter; one page | V3 pipeline; canonical **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** until Get Canonical Names |
| One complete loan | `GET /encompass/v3/loans/{id}` smallest view | loan-management |
| Current milestone | `GET /encompass/v3/loans/{id}/milestones` | 24.1 GA |
| Milestone history | GET Loan `view=logs` Milestone History Log | loan-management |
| All conditions | Enhanced GET `.../conditions` **or** V1 underwriting/postclosing/preliminary | useEnhancedConditionIndicator |
| Condition tracking | `.../conditions/{id}/tracking` (enhanced) | manage-tracking-entries |
| All task information | `GET /workflow/v1/tasks` (not Task Pipeline) | get-tasks |
| Task pipeline | `GET /workflow/v1/taskPipeline` incomplete for **caller** | get-task-pipeline |
| Document metadata | `GET .../documents` | get-list-of-documents |
| Actual file | V3 attachment download URL / exportjobs | not V1 after 26.3 |
| Conversation history | Conversation Logs + GET Loan logs | conversation-log |
| All loan comments | Multiple comment APIs (doc, condition, task) + logs — no single API | **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as one endpoint |
| Field definitions | GET standardFields | get-field-schema-1 |
| Custom fields | GET settings/loan/customFields | manage-custom-fields |
| Loan schema | GET schemas/loan | get-loan-schema-1 |
| Loan folders | GET /encompass/v3/loanFolders | loan-folder |
| Users | GET /encompass/v3/users | v3-get-list-internal-users |
| Events | Webhook subscriptions + GET resources | webhook |
| Reporting snapshot | POST /encompass/v3/loanPipeline/report | v3-create-cursor |
| Real-time dashboard | Redis from webhooks; Pipeline to hydrate; not /report | **INTERNAL ARCHITECTURE RECOMMENDATION** + concurrency guide |
