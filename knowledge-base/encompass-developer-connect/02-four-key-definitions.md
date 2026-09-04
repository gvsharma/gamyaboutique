# 02 — Four Key Definitions

**Share this file when:** aligning vocabulary across product, ops, and engineering.

**Related:** [01 Core model](./01-purpose-and-core-model.md) · [04 Milestones](./04-milestones.md) · [05 Tasks](./05-workflow-tasks.md) · [06 Conditions](./06-conditions.md) · [07 Documents](./07-documents-and-attachments.md)

---

## The four objects

### Loan

The mortgage transaction and its structured data.

A loan is the **root aggregate**. Borrower data, workflow, people, documents, conditions, and disclosures hang off the loan.

See [03 Loans](./03-loans.md).

### Milestone

A major workflow stage in the loan lifecycle.

Milestones answer: **Where is the loan in the lifecycle?**

See [04 Milestones](./04-milestones.md).

### Workflow Task

An assignable unit of work.

Tasks answer: **What work needs to be done?**

Workflow Tasks are distinct from milestone tasks. See [05 Workflow tasks](./05-workflow-tasks.md).

### Condition

A requirement that must be satisfied, usually with supporting evidence/documents.

Conditions answer: **What requirement must be satisfied?**

A condition is **not** a document. See [06 Conditions](./06-conditions.md).

## The key distinction

```text
Milestone = Where is the loan in the lifecycle?
Task      = What work needs to be done?
Condition = What requirement must be satisfied?
Document  = What evidence/information exists?
Attachment= What actual electronic file is attached?
```

## Quick examples (illustrative)

These examples are teaching examples. Exact titles, statuses, and field names are lender-configurable and must be verified in the target Encompass instance and current ICE docs.

| Concept | Example |
|---------|---------|
| Milestone | Processing has started; Approval is not done |
| Task | "Verify Income" assigned to Processor, status Open |
| Condition | "Provide two most recent paystubs." |
| Document | eFolder record titled "Paystubs" tracking that evidence through the pipeline |
| Attachment | `July_Paystub.pdf`, `August_Paystub.pdf` |

## Common conflations to avoid

| Do not assume | Reality |
|---------------|---------|
| Condition = document | A condition is a requirement. Documents are evidence that may be assigned to it. |
| Document = file | A document is a business record. An attachment is the electronic file. |
| Task = milestone | A milestone is a stage. A task is assignable work that may happen inside a stage. |
| Task = condition | A task may be associated with a condition, but they are different objects. |
| One user = one role | Users, personas, roles, groups, and loan associates are distinct. See [10](./10-associates-and-roles.md). |

## Relationship sketch

```text
Loan
 |
 +-- Milestone (lifecycle position)
 |     +-- comments
 |     +-- history
 |
 +-- Workflow Task (work to do)
 |     +-- comments
 |     +-- subtasks (not independently assignable)
 |     +-- optional association to a Condition
 |
 +-- Condition (requirement)
 |     +-- comments
 |     +-- tracking/history
 |     +-- assigned Document(s)
 |
 +-- Document (evidence record)
       +-- comments
       +-- Attachment(s) (actual files)
```

## Official documentation

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [Loan Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- [Workflow Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks)
- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)
- [eFolder documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents)
