# 08 — Milestones and Associates

> **Official source:** [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones) · [V1 Get All Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-milestones) · [Loan Milestone Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)

**Primary milestone API version:** V1 (`/encompass/v1/loans/{id}/milestones`)

---

## Core mental model

A **milestone** is a **lifecycle stage** in the loan workflow—not a work item. It defines:

- Which loan activities occur at that stage
- Which **role** carries out those activities
- When the stage is finished, work advances to the next milestone

**Do not treat milestones as tasks.** Operational work is tracked via workflow tasks ([07-workflow-tasks.md](./07-workflow-tasks.md)) or conditions. Milestones mark **where** the loan sits in origination.

```
John Smith loan progression (illustrative — names are lender-configurable):

Started → Qualification → Processing → Submittal → Cond. Approval → Approval → ...
                                              ↓
                                         Resubmittal (if UW returns file)
```

---

## Out-of-the-box milestones (do not hardcode)

Encompass provides thirteen predefined milestones "out of the box":

*Started*, *Qualification*, *Processing*, *Submittal*, *Cond. Approval*, *Resubmittal*, *Approval*, *Doc Preparation*, *Docs Signing*, *Funding*, *Post Closing*, *Shipping*, and *Completion*.

> Your Encompass system administrator can configure the **behavior and names** of these milestones, create custom milestones, and apply milestone templates by loan type, channel, or other criteria.

**Integration rule:** Never hardcode milestone names in production code. Store `id`, `milestoneIdString`, and `milestoneName` from API responses per lender instance. Webhook payloads include `id` and `title`—treat `title` as display text, not a stable cross-lender identifier.

---

## Milestone log fields (V1)

From [V1 Get All Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-milestones) schema (`MilestonesLogAttributes`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier of the milestone **log** entry |
| `milestoneIdString` | string | Unique entity ID of the milestone definition |
| `milestoneName` | string | Name set by Encompass administrator |
| `startDate` | string | Milestone start date |
| `doneIndicator` | string | Whether milestone has been completed |
| `reviewedIndicator` | boolean | Whether activities/documents for milestone were reviewed |
| `roleRequired` | boolean | Whether assigning a loan team member is required |
| `loanAssociate` | object | Loan associate details (see below) |
| `comments` | string | Comments grouped by milestone |
| `expectedDays` | integer | Expected days to finish |
| `actualDays` | string | Actual days to complete |

### loanAssociate object

| Field | Notes |
|-------|-------|
| `loanAssociateType` | `User` or `Group` (required when assigning) |
| `id` | Encompass user ID or group ID |
| `name`, `phone`, `cellphone`, `fax`, `email` | Read-only; extracted from user profile on assignment |
| `roleName` | Read-only; see fixed roles below |
| `roleId` | Read-only integer |
| `writeAccess` | Read-only |

**Fixed role names** (custom roles can map to these):

- Loan Officer
- Loan Processor
- Loan Closer
- Underwriter

---

## Loan associates vs roles

| Concept | Definition |
|---------|------------|
| **Role** | Workflow responsibility (e.g. Loan Officer) configured in Encompass Settings; associated with milestones |
| **Loan associate** | Specific user or group assigned to a role **on a given loan** |

Users are assigned to roles loan-by-loan. Mike may be Loan Officer on one file and Processor on another. One user can hold multiple roles on the same loan.

**API:** Loan Associates API inspects and modifies associates on a loan.

---

## Milestone roles vs milestone-free roles

| Type | Association |
|------|-------------|
| **Milestone roles** | Tied to a particular milestone |
| **Milestone-free roles** | Not tied to any milestone |

The milestone–role mapping is **configurable per Encompass instance**.

**Milestone-Free Roles API** retrieves milestone-free logs for a loan.

---

## Primary endpoints (V1)

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Get all milestones | GET | `/encompass/v1/loans/{id}/milestones` |
| Update milestone | PATCH | `/encompass/v1/loans/{id}/milestones/{logId}` |
| Assign loan associate | PUT | `/encompass/v1/loans/{id}/associates/{logId}` |

### Update milestone actions

Query parameter `action` on PATCH:

| Action | Effect |
|--------|--------|
| `finish` | Complete the milestone |
| `unfinish` | Re-open the milestone |

---

## milestoneHistoryLogs (system log)

`milestoneHistoryLogs` is a **system log** on the V3 loan object. Per [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management):

- **System logs** cannot be edited by any user
- Included in **V3 Get Loan** with `view=logs` or `view=full`
- Documented example category: "Milestone History Log"

```http
GET /encompass/v3/loans/{loanId}?view=logs
```

Returns `milestoneHistoryLogs` array (among other log entities). Use for audit/history of milestone transitions—not for assigning work.

**Contrast:** V1 `GET /milestones` returns current milestone schedule state; `milestoneHistoryLogs` is historical/system-generated.

---

## milestoneTasks (legacy — not workflow tasks)

`milestoneTasks` on the V3 loan object (with `view=logs` or `view=full`) are **legacy milestone checklist items**, not Workflow Task Service instances.

Per 24.2 release notes, `milestoneTasks` (and related log entities) are returned only when `view=logs` or `view=full`—not with default or `view=entity`.

---

## Webhooks — milestone subevents

Loan resource event `milestone` (API support). Subevents in `meta.payload.event`:

| Subevent | When fired |
|----------|------------|
| `updateMilestones` | Milestone updated |
| `finishMilestones` | Milestone completed |

**eventType:** `milestone`

**Sample payload (from official docs):**

```json
{
  "eventType": "milestone",
  "meta": {
    "resourceType": "Loan",
    "resourceId": "{loanGuid}",
    "resourceRef": "/encompass/v3/loans/{loanGuid}/milestone",
    "payload": {
      "event": {
        "updateMilestones": [
          {
            "id": "5769d610-4f1e-4cd2-94f2-facceff7286c",
            "title": "Qualification"
          }
        ]
      }
    }
  }
}
```

On completion, expect `finishMilestones` with analogous `id` and `title` structure (documented as subevent; payload shape follows same pattern as `updateMilestones`).

**Internal-only events** (do not subscribe): `milestoneupdate` — internal use only per webhook catalog.

---

## Resubmittal scenario — John Smith

**Illustrative lifecycle** for John Smith's purchase file:

1. **Submittal** milestone finished — Sarah submits to underwriting.
2. **Cond. Approval** or **Approval** milestone active — Robert (Underwriter) reviews.
3. Robert finds issues → file returns to processing channel.
4. **Resubmittal** milestone becomes active (lender-configured name may differ).
5. Webhook: `eventType=milestone`, `updateMilestones` with `title` reflecting Resubmittal (or lender's custom name).
6. Sarah clears conditions, re-submits.
7. `finishMilestones` on Resubmittal → workflow advances toward Approval again.

**Integration pattern:**

```text
Webhook (milestone) → read id + title from payload
                   → GET /encompass/v1/loans/{loanId}/milestones for full state
                   → map title to lender's milestone config table (not hardcoded strings)
                   → trigger workflow tasks or notifications
```

**Do not** assume "Resubmittal" string—read from API/webhook and map via lender configuration.

---

## John Smith — associate assignment example

Robert must be Underwriter associate before underwriting milestone work:

```http
PUT /encompass/v1/loans/{johnSmithLoanGuid}/associates/{underwriterLogId}
Content-Type: application/json

{
  "loanAssociateType": "User",
  "id": "robert"
}
```

Note: associate must be assigned to the role attached to the milestone. Profile fields (`name`, `email`, etc.) are populated from Robert's user profile.

When **Processing** milestone associate is Sarah, workflow task `assignRole=true` can auto-assign her (see [07-workflow-tasks.md](./07-workflow-tasks.md)).

---

## Production integration concerns

1. **Lender-configurable names** — Cache milestone definitions per `instanceId`; never branch on hardcoded "Processing" or "Resubmittal" strings across lenders.
2. **V1 vs V3** — Milestone CRUD is V1; history logs are V3 loan `view=logs`. Plan two read paths.
3. **Webhook title vs milestoneName** — Webhook uses `title`; V1 API uses `milestoneName`; normalize in your event store.
4. **roleRequired** — Blocking logic if associate missing; surface ops alerts before milestone finish attempts fail.
5. **Group associates** — `loanAssociateType=Group` assigns work to a user group, not an individual; task pipeline may show tasks to all group members.
6. **Milestone finish side effects** — Finishing milestones may trigger workflow rules, task templates, and webhooks; design idempotent downstream handlers.
7. **Comments on milestones** — `comments` field on milestone log is milestone-grouped commentary—not the same as conversation logs or task comments ([11-conversation-logs-notes-comments.md](./11-conversation-logs-notes-comments.md)).
8. **Closed loan detection** — Partners often check last completed milestone or HMDA status; milestone names are lender-defined (document expectations for lenders per Partner Connect guidance).

---

## Related files

| File | Topic |
|------|-------|
| [07-workflow-tasks.md](./07-workflow-tasks.md) | Workflow tasks, `assignRole`, task pipeline |
| [11-conversation-logs-notes-comments.md](./11-conversation-logs-notes-comments.md) | Logs vs milestone comments |
| [12-organizations-users-roles.md](./12-organizations-users-roles.md) | Roles, personas, user groups |
