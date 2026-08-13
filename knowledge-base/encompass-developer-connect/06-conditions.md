# 06 — Conditions

**Share this file when:** modeling underwriting requirements, evidence, or condition reporting.

**Related:** [02 Definitions](./02-four-key-definitions.md) · [05 Tasks](./05-workflow-tasks.md) · [07 Documents](./07-documents-and-attachments.md) · [11 Comments vs tracking](./11-conversation-logs-comments-notes.md)

---

## What a condition is

A condition is a requirement that must be satisfied, usually with supporting evidence/documents.

```text
Condition = What requirement must be satisfied?
```

**A condition is not the same as a document.**

### Example (illustrative)

```text
Condition:
"Provide two most recent paystubs."

Evidence:
July_Paystub.pdf
August_Paystub.pdf
```

One condition can have multiple documents, and one document can be associated with multiple conditions.

## Standard Conditions vs Enhanced Conditions

**Standard Conditions and Enhanced Conditions must be treated separately.**

Enhanced Conditions were introduced in Encompass 20.2 and provide richer customization at condition and field level. They also support condition reporting across multiple loans.

ICE documents a loan-level indicator:

- Field ID: `ENHANCEDCOND.X1`
- JSON path: `loan.useEnhancedConditionIndicator`

If `true`, the loan uses Enhanced Conditions. If `false`, Standard Conditions are used, and **separate APIs** apply.

Never assume a single condition API covers both models.

## Enhanced Condition concepts

Enhanced Conditions support concepts including:

- condition ID
- condition type
- title
- internal/external descriptions
- category
- source
- recipient
- requested-from
- prior-to
- owner
- start/end dates
- days-to-receive
- status
- status date
- tracking
- comments
- assigned documents
- definitions
- templates
- condition types
- condition sets
- automated condition rules

Confirm exact contract properties in [Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1) and related settings APIs. ICE notes that at loan level, `title` is retrieve-only and cannot be edited.

ICE also documents:

- adding Condition Sets, Condition Templates, or ad hoc enhanced conditions
- duplicating a condition (`action=duplicate`) with `allowDuplicate` on the template; `trackingEntries`, `comments`, and `assignedTo` are not copied
- applying a template when payload `title` and `conditionType` match

Do not invent status enumerations. Status values are configured per lender.

## Important relationship

```text
Condition
   |
   +-- comments
   +-- tracking/history
   |
   +-- assigned documents
           |
           v
       Document
           |
           v
       Attachment(s)
```

### Comments vs tracking

**Condition tracking is distinct from comments.**

Comments explain context (illustrative):

```text
"Borrower provided gift letter.
Need donor account statement."
```

Tracking records status progression.

Do not store tracking as a comment stream, and do not treat comments as the audit of status changes.

## Condition lifecycle (illustrative)

A realistic business lifecycle may look like:

```text
Created
   |
Requested
   |
Received
   |
Reviewed
   |
+-- Satisfied
|
+-- Re-requested
       |
       v
    Received
       |
       v
    Reviewed
       |
       v
    Satisfied
```

This is **illustrative**. Do not assume every loan uses exactly these status names.

Never model a condition as only a boolean (golden rule 5). Conditions have type, owner, dates, status history, comments, and assigned evidence.

## Tasks vs conditions

A task may be associated with a condition (work to satisfy a requirement). Subtasks belong to the task, not to the condition.

See [05 Workflow tasks](./05-workflow-tasks.md).

## Events (verify in current catalog)

ICE loan webhook documentation describes condition-related subevents such as create, update, assign, assignDocument, remove, comment, and status change.

There is also a separate Enhanced Conditions webhook resource for templates and types (create/update/delete). ICE notes that enabling Enhanced Conditions webhook events may require a support ticket plus a subscription.

Always fetch current condition state when downstream systems must be correct. Webhook ≠ current truth.

## Official documentation

- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)
- [V3 Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1)
- [Enhanced Conditions webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions)
- Search Developer Connect for **Loan Conditions** (standard) and **Enhanced Conditions Settings** — keep both linked; they are different APIs.
