# Milestones

## Definition

A **milestone** is a step in the workflow that defines loan activities and the role that carries out those activities. When activities are completed, the milestone is marked as finished, and work begins on the next milestone.

Official source: [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)

---

## Milestone vs milestone setting vs milestone log

| Concept | Scope | Description |
|---------|-------|-------------|
| **Milestone Setting** | System/lender config | Template defining milestone name, expected days, role (**LENDER CONFIGURABLE**) |
| **Milestone Log** | Per-loan instance | Runtime milestone state on a specific loan |
| **Milestone History Log** | Per-loan system log | Append-only history of milestone transitions |

Settings API: `/encompass/v3/settings/milestones`

Loan API: `/encompass/v3/loans/{loanId}/milestones`

---

## Default milestones (out of the box)

Thirteen predefined milestones (**LENDER CONFIGURABLE** names and behavior):

1. Started
2. Qualification
3. Processing
4. Submittal
5. Cond. Approval
6. Resubmittal
7. Approval
8. Doc Preparation
9. Docs Signing
10. Funding
11. Post Closing
12. Shipping
13. Completion

Administrators may create **custom milestones** and **milestone templates** applied by loan type, channel, or criteria.

---

## Milestone log attributes (MilestonesLogV3attributes)

| Attribute | Access | Description |
|-----------|--------|-------------|
| `id` | Read/Write | Unique milestone identifier on the loan |
| `name` | RetrieveOnly | Milestone name from admin configuration |
| `startDate` | Read/Write | When milestone work started (ISO 8601) |
| `days` | RetrieveOnly | Expected days to complete |
| `duration` | RetrieveOnly | Actual elapsed days |
| `doneIndicator` | Read/Write | Whether milestone is completed |
| `reviewedIndicator` | Read/Write | Whether activities/documents reviewed |
| `roleRequired` | RetrieveOnly | Whether loan team member assignment required |
| `comments` | Read/Write | Milestone comments for this loan |
| `loanAssociate` | Read/Write | Assigned user/group for milestone role |
| `milestoneSetting` | RetrieveOnly | Reference to system milestone setting |

### Finish a milestone

```json
{ "doneIndicator": true }
```

Sent to: `PATCH /encompass/v3/loans/{loanId}/milestones/{milestoneId}`

---

## Expected duration vs actual duration

| Metric | Field | Meaning |
|--------|-------|---------|
| Expected | `days` | Configured SLA target from milestone setting |
| Actual | `duration` | Elapsed time since `startDate` (RetrieveOnly) |
| Start | `startDate` | When milestone became active |
| Complete | `doneIndicator` | Whether milestone finished |

**Dashboard use cases:**

| Analysis | How |
|----------|-----|
| SLA reporting | Compare `duration` vs `days` per milestone |
| Bottleneck analysis | Identify milestones where actual >> expected |
| Processor performance | Aggregate Processing milestone durations by associate |
| Underwriter performance | Aggregate Cond. Approval / Resubmittal durations |
| Loan aging | Track time since `startDate` on current open milestone |

---

## Milestone ID strings

Each milestone log on a loan has:

- `id` — unique identifier for this milestone **instance** on the loan
- `milestoneSetting.entityId` — reference to the configured milestone setting
- `name` — human-readable milestone name (e.g., "Cond. Approval")

Webhook extra payload includes milestone `id` and `title` on `updateMilestones` / `finishMilestones` events.

---

## Milestone comments

The `comments` field on the milestone log stores information related to the milestone for this loan. Official docs state comments are **grouped by milestone**.

Example: "Processing complete." recorded when Sarah finishes processing.

Milestone comments are **distinct** from conversation logs, task comments, and condition comments. See [comments-notes-logs.md](./comments-notes-logs.md).

---

## Milestone history

**Milestone History Log** is a **system log**:

- Cannot be edited by any user
- Included in Get Loan with `view=logs|full`
- Provides auditable history of milestone transitions

For current milestone state, use milestone log APIs — not history alone.

---

## Milestone-free roles

Two role types exist on a loan:

| Type | Description |
|------|-------------|
| **Milestone roles** | Associated with a particular milestone |
| **Milestone-free roles** | Not associated with any milestone |

Association is **LENDER CONFIGURABLE**.

API: Milestone-Free Roles — retrieve milestone-free logs for a loan.

---

## Milestone tasks (Encompass native)

The V3 loan schema includes `MilestoneTaskContract` and `MilestoneTemplateLogContract` — these are **Encompass milestone tasks**, distinct from **Workflow Tasks** (see [tasks.md](./tasks.md)).

Official Workflow Task documentation explicitly states:

> A workflow task is different from the milestone task that exists in Encompass.

---

## John Smith example

| Event | Milestone change | Associate |
|-------|------------------|-----------|
| Loan created | Started active | Mike (LO) |
| App submitted | Qualification → Processing | Sarah (Processor) |
| Sent to UW | Processing done; Submittal done | Robert (UW) |
| Conditional approval | Cond. Approval active | Robert |
| Cleared to close | Approval done | Lisa (Closer) |
| Docs out | Doc Preparation → Docs Signing | Lisa |
| Funded | Funding done | — |
| File complete | Completion done | — |

---

## Webhook events

Loan resource milestone events (API-triggered):

| Sub-event | Description |
|-----------|-------------|
| `updateMilestones` | Milestone updated |
| `finishMilestones` | Milestone completed |

Event type: `milestone`

See [events.md](./events.md).

---

## References

- [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- [V3 Get Milestone Logs List](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-milestone-logs-list)
- [V3 Update Milestone Log](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-update-milestone-log)
- [Settings Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-milestones)
