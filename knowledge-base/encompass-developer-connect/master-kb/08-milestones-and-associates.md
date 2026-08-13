# 08 — Milestones and associates

**Related:** [07 Tasks](./07-workflow-tasks.md) · [12 People](./12-organizations-users-roles.md) · [18 Case study](./18-real-loan-end-to-end-case-study.md)

**Official:** [Loan Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones) · [V3 Get Milestone Logs List](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-milestone-logs-list) · [V3 Get Milestone Log](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-milestone-log) · [V1 Get an Associate](https://developer.icemortgagetechnology.com/developer-connect/reference/get-associate)

---

## A. Business meaning

A **milestone** is a **major loan lifecycle stage**, not a work item.

ICE: it defines loan activities and the **role** that carries them out. When finished, work begins on the next milestone.

A **loan associate** is a user assigned to a **role on that loan**. Users are assigned **loan-by-loan**. A user can be LO on one loan and processor on another, and **can be assigned multiple roles on the same loan** (ICE example: loan officer and processor). Whether the **bank allows** that is SoD policy, not an ICE prohibition.

## B. John Smith (illustrative)

- Started / Qualification: Mike
- Processing: Sarah
- Submittal / Cond. Approval / Resubmittal / Approval: Robert
- Doc Preparation / Docs Signing / Funding: Lisa

**Not a straight line:** Robert issues conditions → file resubmits → more conditions → then approval. ICE’s out-of-the-box list includes **Resubmittal** and **Cond. Approval** for that reason.

## C. Domain model

```text
Loan
  +-- milestone logs[]
        +-- role required
        +-- loan associate
        +-- dates / expected vs actual days
        +-- done / reviewed indicators
        +-- comments
  +-- milestone history (system log — not user-editable)
  +-- milestone-free roles (separate API)
```

## D. APIs

| Version | Endpoint | Notes |
|---------|----------|--------|
| V3 | `GET /encompass/v3/loans/{loanId}/milestones` | List milestone logs |
| V3 | `GET /encompass/v3/loans/{loanId}/milestones/{milestoneId}` | One log |
| V3 | `PATCH /encompass/v3/loans/{loanId}/milestones/{milestoneId}` | Update; changelog notes associate assignment in payload |
| V3 | milestone-free roles list (changelog: `.../milestones/...FreeRoles`) | Confirm exact path on current page |
| V1 | `GET /encompass/v1/loans/{id}/associates/{logId}` | Associate for a milestone or milestone-free **logId** from Get All Milestones |

**Do not mix V1 associate JSON with V3 milestone log JSON without a mapping layer.**

## E–F. Request / response

```http
GET /encompass/v3/loans/{loanId}/milestones
Authorization: Bearer {accessToken}
```

Pull live samples from the official pages for field names. Seed fields below are **research targets**, not a guarantee they appear with these JSON names on V3:

## G. Fields — documented vs seed

| Seed name | Status | Business meaning |
|-----------|--------|------------------|
| milestone ID | Documented as `{milestoneId}` path param | Identity |
| milestone name / title | Official webhook sample uses `title` (e.g. `"Started"`, `"Qualification"`) | Display |
| `milestoneIdString` | **NOT ESTABLISHED** on the V3 pages cited — verify schema | — |
| start date | Verify on current milestone log contract | When stage started |
| expected days | Verify on current contract | Configured expectation |
| actual days | Verify on current contract | Observed duration |
| done indicator | Verify | Finished |
| reviewed indicator | Verify | Reviewed |
| role required | ICE prose: role carries out activities | Who should be assigned |
| loan associate | Documented concept + associate APIs | Who is assigned |
| comments | Object comments — verify field on V3 log | Context |
| milestone history | Documented **system log** example | Formal history |

If expected/actual days **are** on the contract, they enable SLA/bottleneck analytics. If not, derive duration from dates you **do** have. **Do not invent properties.**

Automatic vs manual date calculation; business-day calendars: **NOT ESTABLISHED** as a universal API rule. Often configuration/template. Say so in the bank runbook after reading admin guides.

## H. Lifecycle (illustrative; names from ICE out-of-the-box list)

ICE predefined: Started, Qualification, Processing, Submittal, Cond. Approval, Resubmittal, Approval, Doc Preparation, Docs Signing, Funding, Post Closing, Shipping, Completion.

**Lenders can configure names/behavior, add custom milestones, apply templates by type/channel.** Never hardcode.

**Rejection / denial / withdrawal:** ICE documents `move` (including trash = soft delete) and `delete`. It does **not** document “Rejected” as a universal milestone. Denial/withdrawal/cancellation are **disposition concepts** — find the actual fields/folders/status in schema + lender config. Do not invent a Rejected milestone.

Rework: conditions and Resubmittal exist so the file can move **backward or sideways** in business terms even if the milestone log is a sequence of finished stages.

## I. Events (documented)

Loan webhook `milestone` subevents: **`updateMilestones`**, **`finishMilestones`**. Official samples include `updateMilestones` with `id` + `title`.

`milestoneupdate`: **Internal Use Only**.

## J. Integration

Project current milestone + associate + finished flags. Use history system log for audit. Do not use webhook `title` as a durable enum — lender may rename.

## K. Production

- Custom milestones break dashboards that switch on `"Processing"`.
- Associate changes vs milestone finish are different events/subevents.
- Get Loan `view=log` may include milestone history — confirm current inclusion rather than assuming.

## L. Common mistakes

1. Hardcoding the thirteen names.
2. Treating a task as a milestone.
3. Assuming one associate per user globally.
4. Calling denial a milestone named Rejected.

## M. Questions

1. What is the difference between finishing Processing and completing a “Verify income” task?
2. How do you compute SLA if `expectedDays` is absent on V3?
3. How do milestone-free roles differ from milestone associates?
