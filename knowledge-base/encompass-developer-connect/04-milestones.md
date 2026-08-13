# 04 — Milestones

**Share this file when:** modeling loan lifecycle, SLA analytics, or milestone webhooks.

**Related:** [02 Definitions](./02-four-key-definitions.md) · [05 Tasks](./05-workflow-tasks.md) · [10 Associates](./10-associates-and-roles.md) · [15 Timeline](./15-loan-timeline.md)

---

## What a milestone is

A milestone is a major workflow stage in the loan lifecycle.

```text
Milestone = Where is the loan in the lifecycle?
```

ICE: a milestone is a step in the workflow that defines loan activities and the role that carries out those activities. When activities are completed, the milestone is marked as finished, and work begins on the next milestone.

Milestones are **not** tasks and **not** conditions.

## Standard milestones documented by ICE

ICE documents thirteen predefined ("out of the box") milestones:

- Started
- Qualification
- Processing
- Submittal
- Conditional Approval (`Cond. Approval` in ICE's list)
- Resubmittal
- Approval
- Doc Preparation
- Docs Signing
- Funding
- Post Closing
- Shipping
- Completion

**Do not assume every lender uses identical names or behavior.** ICE states that administrators can:

- configure behavior and names of these milestones
- create custom milestones
- set up milestone templates applied by loan type, channel, or other criteria

Never hardcode lender-configurable workflow (golden rule 1).

## Important milestone fields

Important milestone fields include:

- milestone ID
- milestone name
- milestoneIdString
- start date
- expected days
- actual days
- done indicator
- reviewed indicator
- role required
- loan associate
- comments
- milestone history

Confirm exact JSON property names and types in current ICE documentation and the loan schema. Do not invent fields.

### SLA distinction

```text
expectedDays = configured expectation
actualDays   = observed duration
```

This allows SLA / bottleneck analytics: compare configured expectation vs observed duration per milestone, per loan, per role, per channel.

## Milestone comments vs history

- **Comments** are object-specific context (example, illustrative: "Processing complete; title pending.").
- **Milestone history** is platform-generated progression (a system log). System logs cannot be edited by users.

Do not conflate comments, conversation logs, and system logs. See [11](./11-conversation-logs-comments-notes.md).

## People on a milestone

A milestone is associated with a **role** and a **loan associate**. A user assigned to a role on a loan is a loan associate. One user may hold different roles on different loans, and may be assigned multiple roles on the same loan depending on configuration and policy.

See [10 Associates and roles](./10-associates-and-roles.md).

## Events (verify in current webhook catalog)

ICE loan webhook documentation includes milestone subevents such as:

- `updateMilestones` — when a milestone is updated
- `finishMilestones` — when a milestone is completed

Treat webhook names as **documentation-bound**. Confirm the current catalog before coding consumers.

A webhook is not necessarily current truth. Fetch the milestone/loan resource after the event when downstream state must be accurate. See [12](./12-events-and-webhooks.md).

## Official documentation

- [Loan Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
