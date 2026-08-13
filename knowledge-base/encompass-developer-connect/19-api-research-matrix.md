# 19 — Encompass API Research Matrix

**Share this file when:** starting official ICE Developer Connect research, or assigning API coverage work.

**Related:** [20 Per-resource template](./20-per-resource-research-template.md) · [21 All notes and comments](./21-all-notes-and-comments-research.md) · [research/README.md](./research/README.md) · [18 Official documentation](./18-official-documentation.md)

---

## Purpose

Use this as a **living checklist** while researching the official ICE Mortgage Technology Developer Connect portal.

**Do not fill undocumented values from memory.** Verify each item against the current official reference.

If official documentation does not answer a question, write:

> NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION

Do not guess.

## Source discipline

Use **only** official ICE Mortgage Technology Developer Connect material for API contracts unless explicitly asked to compare third-party/community information.

Portal: [https://developer.icemortgagetechnology.com/developer-connect](https://developer.icemortgagetechnology.com/developer-connect)

## Domain matrix

| Domain | Primary API / resource | Version | Key questions | Worksheet |
|--------|------------------------|---------|---------------|-----------|
| Loan | Loan Management | V3 | Current state, schema, views, collections, logs, locks | [research/loan-management.md](./research/loan-management.md) |
| Loan fields | Loan Management / Reader/Writer | V3 | Field IDs, paths, read/write semantics | [research/loan-fields.md](./research/loan-fields.md) |
| Conditions | Loan Conditions | V1 / verify current | Standard condition lifecycle and documents | [research/loan-conditions.md](./research/loan-conditions.md) |
| Enhanced Conditions | Loan Enhanced Conditions | V3 | Instance, comments, tracking, documents, removal | [research/enhanced-conditions.md](./research/enhanced-conditions.md) |
| Condition types | Enhanced Condition Types | V3 | Configuration and eligibility | [research/condition-types.md](./research/condition-types.md) |
| Condition sets | Enhanced Condition Sets | V3 | Configuration grouping | [research/condition-sets.md](./research/condition-sets.md) |
| Condition templates | Enhanced Condition Templates | V3 | Runtime condition creation/configuration | [research/condition-templates.md](./research/condition-templates.md) |
| Automated conditions | Evaluate Automated Conditions | V3 | Rules and template evaluation | [research/automated-conditions.md](./research/automated-conditions.md) |
| Tasks | Workflow Task Service | V1 | Task instance lifecycle | [research/workflow-tasks.md](./research/workflow-tasks.md) |
| Task templates | Workflow Task Configuration | V1 | Template configuration | [research/task-templates.md](./research/task-templates.md) |
| Subtasks | Workflow Task Service | V1 | Required/optional, assignment | [research/subtasks.md](./research/subtasks.md) |
| Task comments | Task Comment resource | Verify current | Comments and disposition events | [research/task-comments.md](./research/task-comments.md) |
| Task pipeline | Task Pipeline | V1 | Open work assigned to user/group | [research/task-pipeline.md](./research/task-pipeline.md) |
| Milestones | Loan Associates & Milestones | Verify current | Stage, associate, dates, history | [research/milestones.md](./research/milestones.md) |
| Documents | eFolder Documents | Verify current | Document record, status, comments | [research/documents.md](./research/documents.md) |
| Attachments | eFolder Attachments | Verify current | Actual files, upload/download | [research/attachments.md](./research/attachments.md) |
| Document order | Send Encompass Docs / Document Order | Verify current | Package generation and delivery | [research/document-order.md](./research/document-order.md) |
| Disclosure tracking | Disclosure Tracking 2015 | Verify current | LE/CD and disclosure history | [research/disclosure-tracking.md](./research/disclosure-tracking.md) |
| Conversation logs | Conversation Logs | V1 | Loan communication history | [research/conversation-logs.md](./research/conversation-logs.md) |
| Webhooks | Webhook API | Current | Subscriptions, signing, event payloads | [research/webhooks.md](./research/webhooks.md) |
| EPC | Encompass Partner Connect | Current | Service order lifecycle | [research/epc.md](./research/epc.md) |
| DDA | Data & Document Automation | Current | Analyzer/document events and availability | [research/dda.md](./research/dda.md) |
| Schedulers | Scheduler Service | Current | Time-based automation | [research/schedulers.md](./research/schedulers.md) |
| Trades | Trades | Current | Secondary-market workflow | [research/trades.md](./research/trades.md) |
| Users | Organizations & Users | Current | Identity, groups, provisioning | [research/users.md](./research/users.md) |

**Version column meaning:** the version shown is the **starting hypothesis from this seed**, not a verified contract. The worksheet must confirm or replace it from current ICE docs. Rows marked **Verify current** must not be treated as V1 or V3 until documented.

## How to use

1. Pick a domain row.
2. Open its worksheet in `research/`.
3. Research only against the official portal.
4. Fill every required field, or mark it `NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION`.
5. Record **Last verified against ICE docs** (date) and the exact documentation URL.
6. Do not copy answers from memory, blogs, or prior integrations unless they match the current official page.

## Cross-cutting research

After domain worksheets, complete:

- [20 Per-resource research template](./20-per-resource-research-template.md) — fields required on **every** resource
- [21 All notes and comments for one loan](./21-all-notes-and-comments-research.md) — special aggregation research
- Then design the normalized loan timeline (see worksheet in 21 and domain seed [16](./16-normalized-communications-timeline.md))
