# 11 — Conversation Logs vs Comments vs Notes vs System Logs

**Share this file when:** anyone says "just pull all the notes" or conflates comments with communications.

**Related:** [03 Loans](./03-loans.md) · [06 Conditions](./06-conditions.md) · [16 Normalized timeline](./16-normalized-communications-timeline.md)

---

## These must not be conflated

Conversation Logs, comments, notes, and system logs are different things. There is not necessarily one universal "get every comment" endpoint.

## Conversation Log

A **loan-related communication record**.

Examples (illustrative):

```text
Phone:
"Spoke with borrower about $15K deposit."

Email:
"Requested updated bank statement."

Vendor:
"Called title company for status."
```

Conversation Logs are an **editable log** in the V3 loan model (alongside examples such as AUS Tracking Logs). ICE provides APIs to create and retrieve conversation log entries.

ICE documents a dedicated way to retrieve Conversation Logs for a loan (historically a V1 endpoint; V3 create/manage APIs also exist). **Verify the exact current API/resource** before implementing. Do not assume V1 and V3 bodies match.

## Comment

Context attached to a **business object**.

Examples (illustrative):

```text
Condition comment:
"Need donor statement."

Task comment:
"Appraisal reviewed."

Document comment:
"Unreadable signature page."

Milestone comment:
"Processing complete; title pending."
```

Comments are **object-specific**. They live on the condition, task, subtask, document, or milestone — not in a single global notes table.

## Note

**Do not assume a generic "Note" is interchangeable with a Conversation Log.**

Verify the exact API/resource and semantics in the current ICE documentation before implementing anything named "notes."

## System Log

Platform-generated history that **cannot be edited by users**.

Examples from ICE loan management docs:

- Milestone History
- HTML Email Logs
- Lock Action Logs

Included in Get Loan with `view=log` or `view=full` if present.

## Condition tracking is also not a comment

Tracking records status progression. Comments explain context. See [06 Conditions](./06-conditions.md).

## Aggregation implication

A bank integration that must retrieve all loan notes/comments/communications must **fan out** across resources and then normalize. See [16 Normalized communications timeline](./16-normalized-communications-timeline.md).

## Official documentation

- [Loan Management (editable vs system logs)](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [V3 Create Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/create-conversation-log)
- Search Developer Connect for **Get Conversation Logs** (confirm V1 vs V3)
- Task comment methods: [Get All Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks)
- Document comments: [Get List of Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents)
