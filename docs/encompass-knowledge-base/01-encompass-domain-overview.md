# 01 — Encompass Domain Overview

> **Primary source:** [Encompass Developer Connect — Welcome](https://developer.icemortgagetechnology.com/developer-connect/docs/welcome)  
> **API base URLs:** Production `https://api.elliemae.com` · UAT `https://concept.api.elliemae.com`  
> **Related:** [02-loan-domain.md](./02-loan-domain.md) · [05-conditions-enhanced.md](./05-conditions-enhanced.md) · [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md)

---

## A. Purpose

Encompass Developer Connect enables developers to **configure, customize, and administer loan information and resources programmatically through REST APIs**. This document establishes the core mental model for four objects that appear in almost every integration: **Loan**, **Milestone**, **Workflow Task**, and **Condition**.

Understanding how these objects relate prevents the most common integration failure: treating Encompass as a flat key-value store instead of a mortgage workflow platform.

---

## B. Running example — John Smith conventional purchase

| Attribute | Value |
|-----------|-------|
| Borrower | John Smith |
| Purpose | Purchase |
| Property value | $500,000 |
| **Loan amount** | **$400,000** |
| Program | Conventional 30-year fixed |

| Role | Person |
|------|--------|
| Loan Officer | Mike |
| Processor | Sarah |
| Underwriter | Robert |

Field ID **2** maps to `loan.baseLoanAmount` / JSON path `$.baseLoanAmount` per [V3 Get Field Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-field-schema-1). A $400,000 loan amount would be stored at that path on the V3 loan contract.

---

## C. Core mental model (ASCII)

```
                         ENCOMPASS LENDING PLATFORM
                                    |
                                    v
+------------------------------------------------------------------+
|                           LOAN (loanId)                          |
|  32-digit GUID, immutable for life of loan                       |
|  Container for ALL loan data, workflow, documents, conditions    |
+------------------------------------------------------------------+
         |              |                |                |
         v              v                v                v
    LOAN DATA      MILESTONES       WORKFLOW TASKS    CONDITIONS
  (borrower,       (pipeline         (assignable       (eFolder
   property,        workflow          units of work      tracking
   income...)       steps)            via Task Service)  entries)
         |              |                |                |
         +--------------+----------------+----------------+
                        |
                        v
              DOCUMENTS / ATTACHMENTS (eFolder)
                        |
                        v
              WEBHOOKS (Loan resource events)
```

**Key invariant:** Everything hangs off the **loan**. The `loanId` is the primary key for nearly every API call.

---

## D. The four core objects compared

| Dimension | Loan | Milestone | Workflow Task | Condition |
|-----------|------|-----------|---------------|-----------|
| **Business meaning** | The mortgage file — borrower, property, terms, disclosures, and all related data | A step in the loan workflow defining activities and the role that carries them out | An assignable unit of work in an external business process, managed by the Workflow Task Service | An eFolder entry tracking status of a requirement as the loan moves through the pipeline |
| **Lifecycle** | Created → updated through pipeline → may be moved between folders → permanently deleted | Started → activities completed → marked finished → next milestone begins | Created → assigned → worked → completed (or waived) | Created → requested → fulfilled/received → reviewed → cleared/waived (status values are lender-configurable for enhanced; standard has documented enum) |
| **Primary identifier** | `loanId` (32-digit GUID) | Milestone log `id` (obtainable via V3 Milestone APIs) | Task `id` | `conditionId` |
| **Primary APIs** | V3 Loan Management: `GET/POST/PATCH /encompass/v3/loans/{loanId}` | V3 Milestones: `GET/PATCH /encompass/v3/loans/{loanId}/milestones` | Workflow Task Service: `workflow/v1/tasks` | Enhanced (V3): `GET/PATCH /encompass/v3/loans/{loanId}/conditions` · Standard (V1): separate endpoints per condition type |
| **Webhook resource** | Loan (`resourceType: Loan`) | Loan milestone subevents (`eventType: milestone`) | Workflow Tasks (`resourceType: Task`, etc.) | Loan condition subevents (`eventType: condition`) — **Enhanced Conditions only** per official Loan webhook docs |
| **Configurable vs invariant** | Loan *structure* is invariant (V3 schema); field values, milestone names, condition templates are lender-configurable | 13 OOTB milestones exist but names/behavior are admin-configurable; milestone-role association is per-system | Task templates, types, settings are admin-configurable | Enhanced: types, statuses, sources, recipients, Prior To values are settings-driven; Standard: separate V1 APIs |
| **John Smith example** | $400K conventional purchase file for John Smith | e.g., moves from *Processing* → *Submittal* when Sarah completes processing work | e.g., "Order appraisal" task assigned to processor | e.g., "Provide most recent two paystubs" underwriting condition |

---

## E. Loan — business meaning and lifecycle

### Business meaning

Per [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management):

> A loan is made up of numerous data types and formats that describe the details of the loan such as borrower, subject property, loan type, etc.

The loan is the **root aggregate**. Borrower pairs live under `applications[]`; income, assets, liabilities, and disclosures are nested entities on the V3 loan contract.

### Lifecycle (documented)

| Stage | What happens | API / event signal |
|-------|--------------|-------------------|
| Create | Loan started; `loanId` assigned | `POST /encompass/v3/loans` · webhook `create` |
| Update | Field/data changes | `PATCH /encompass/v3/loans/{loanId}` · webhook `update`, `change`, `fieldchange`, `enhancedfieldchange` |
| Move | Loan moved between folders (incl. trash = soft delete) | webhook `move` |
| Lock/Unlock | Exclusive loan lock acquired/released | webhook `lock` / `unlock` |
| Delete | Permanent removal | webhook `delete` |

### Key fields (invariant)

| Concept | Detail |
|---------|--------|
| `loanId` | 32-digit unique identifier; **does not change** through the lifetime of the loan |
| Discovery | Returned in response body on V3 Create Loan; also visible in Smart Client loan Properties as GUID |
| `useEnhancedConditionIndicator` | Field ID `ENHANCEDCOND.X1`, JSON path `loan.useEnhancedConditionIndicator` — determines Standard vs Enhanced conditions framework |

See [02-loan-domain.md](./02-loan-domain.md) and [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md).

---

## F. Milestone — business meaning and lifecycle

### Business meaning

Per [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones):

> A milestone is a step in the workflow that defines loan activities and the role that carries out those activities. When activities are completed, the milestone is marked as finished, and work begins on the next milestone.

### Out-of-the-box milestones (configurable)

Thirteen predefined milestones: *Started*, *Qualification*, *Processing*, *Submittal*, *Cond. Approval*, *Resubmittal*, *Approval*, *Doc Preparation*, *Docs Signing*, *Funding*, *Post Closing*, *Shipping*, and *Completion*. Administrators may rename, reconfigure, or add custom milestones.

### Lifecycle on John Smith's loan

```
Started → Qualification → Processing → Submittal → ... → Completion
   |          |              |            |
  Mike      Mike          Sarah       Robert (UW review)
```

When Sarah finishes processing, the *Processing* milestone is marked finished and *Submittal* begins. Webhook subevents: `updateMilestones`, `finishMilestones` (see Loan webhook catalog).

### APIs (V3 — documented)

| Endpoint | Purpose |
|----------|---------|
| `GET /encompass/v3/loans/{loanId}/milestones` | List milestone logs |
| `GET /encompass/v3/loans/{loanId}/milestones/{milestoneId}` | Get one milestone log |
| `PATCH /encompass/v3/loans/{loanId}/milestones/{milestoneId}` | Update milestone log; assign loan associate |
| `PATCH /encompass/v3/loans/{loanId}/milestones` | Update milestone dates (25.1+) |

V1 milestone endpoints also exist (`GET /encompass/v1/loans/{id}/milestones`).

---

## G. Workflow Task — business meaning and lifecycle

### Business meaning

Per [Workflow Task Service overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy):

> The Task Service provides the core concept of the Task, which represents an assignable unit of work in a workflow.

Tasks are **not** the same as milestones. Milestones are Encompass pipeline workflow steps; Workflow Tasks are a generalized work-management framework that can be linked to a loan via `workEntity`.

### Lifecycle

```
TaskGroup (optional) → Task created → assigned → in progress → completed/waived
                              ↓
                         Sub-Tasks (optional)
                              ↓
                         Task Comments
```

### APIs (documented)

| Area | Base path |
|------|-----------|
| Task instances | `workflow/v1/tasks` |
| Sub-tasks | `workflow/v1/subtasks` |
| Task pipeline | `workflow/v1/taskPipeline` |
| Configuration | Task Template APIs, Task Settings APIs |

### Webhooks

Task, Subtask, TaskGroup, and TaskComment resources have dedicated webhook categories per [Workflow Tasks webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks).

### John Smith example

A task "Verify employment for John Smith" might be created with `workEntity` pointing to the loan GUID, assigned to Sarah (processor), and completed independently of milestone transitions.

---

## H. Condition — business meaning and lifecycle

### Business meaning

Per [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions):

> A condition is an entry in the eFolder that allows you to track the status of a loan condition as the loan moves through the Pipeline. Multiple documents can be assigned to a condition … A document can be assigned to more than one condition.

### Two frameworks (mutually exclusive per loan)

| Framework | Indicator | APIs |
|-----------|-----------|------|
| **Enhanced Conditions** (Encompass 20.2+) | `useEnhancedConditionIndicator = true` | V3 `/encompass/v3/loans/{loanId}/conditions` |
| **Standard Conditions** | `useEnhancedConditionIndicator = false` | Separate V1 APIs (see [04-conditions-standard.md](./04-conditions-standard.md)) |

Per [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions):

> Enhanced Conditions provide lenders with the ability to customize conditions at a condition level and field level, and to enable condition reports to be generated across multiple loans (both of which are not currently supported by the standard conditions provided in earlier versions of Encompass).

### Lifecycle (Enhanced — illustrative for John Smith)

```
Underwriter Robert creates condition "Provide most recent two paystubs"
  → status: Requested
  → borrower uploads paystubs → document assigned to condition
  → tracking: Received → Reviewed → Cleared
```

See [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) for the full walkthrough.

### Webhooks (Loan resource — Enhanced)

Per [Loan webhook catalog](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan), `eventType: condition` fires when **loan Enhanced Conditions** are created, with subevents: `create`, `update`, `assign`, `assignDocument`, `remove`, `comment`, `status change`.

**documentation does not establish** whether standard conditions emit the same webhook subevents.

---

## I. How the four objects interact on John Smith's $400K loan

```
1. LOAN created (John Smith, $400K conventional)
       │
2. MILESTONE "Processing" active — Sarah assigned as processor (loan associate)
       │
3. WORKFLOW TASK "Collect initial docs" created, linked to loan
       │
4. CONDITION "Provide most recent two paystubs" added (Enhanced or Standard per indicator)
       │
5. DOCUMENT "Paystubs" created in eFolder → ATTACHMENT assigned → DOCUMENT linked to CONDITION
       │
6. CONDITION tracking updated → webhook `condition` event → integration GETs condition detail
       │
7. MILESTONE "Processing" finished → "Submittal" begins → webhook `milestone` event
```

---

## J. Webhook architecture (cross-cutting)

Per [Webhooks Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook):

- Webhooks deliver **real-time updates** when subscribed events occur.
- Notifications are **signed** (verify via Signing Keys).
- Every notification includes `eventId`, `eventTime`, `eventType`, and `meta` (with `userId`, `resourceType`, `resourceId`, `resourceRef`).
- `meta.resourceRef` can be used to fetch the full resource.
- `eventId` ensures events are only digested once.
- ICE may auto-delete bad subscriptions (>30 days old, >1,000 events/week, 5XX delivery failures).

### Loan webhook event types (documented)

`create`, `update`, `submit`, `move`, `document`, `attachment`, `condition`, `milestone`, `change`, `fieldchange`, `enhancedfieldchange`, `delete`, `lock`, `unlock`, `alertchange`, `disclosureTracking` (beta)

---

## K. Configurable vs invariant — summary table

| Item | Invariant (platform) | Configurable (per lender) |
|------|---------------------|---------------------------|
| `loanId` format & immutability | Yes | — |
| V3 loan entity taxonomy (fixed/variable collections, editable/system logs) | Yes | — |
| Milestone names & count | 13 OOTB exist | Admin can rename, add custom, apply templates |
| Milestone ↔ role mapping | Two role types exist (milestone / milestone-free) | Association is per-system |
| Condition framework per loan | Mutually exclusive Standard vs Enhanced | Set via `useEnhancedConditionIndicator` |
| Enhanced condition types, statuses, tracking definitions | Contract shape is fixed | Values defined in Enhanced Conditions Settings |
| Workflow task types & templates | Task/Subtask/TaskGroup model is fixed | Templates and settings are admin-configurable |
| Webhook event catalog | Event names documented | Subscription filters (e.g., `change`, `fieldchange`) are integrator-chosen |

---

## L. Production concerns

| Concern | Guidance (from official docs) |
|---------|-------------------------------|
| **API versioning** | Prefer V3 when available; V1 is legacy wrapper on SOAP/WCF ([V1 vs V3](https://developer.icemortgagetechnology.com/developer-connect/docs/v1-vs-v3-encompass-apis-whats-the-difference-1)) |
| **Payload size** | `view=full` returns largest payload; avoid unless logs required ([Loan Views](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management#about-loan-views)) |
| **EFC webhooks** | Trigger on every field change; payloads can be large and multi-chunked; limit to 1 subscription per clientId ([EFC Best Practices](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-best-practices)) |
| **Webhook delivery** | Not guaranteed real-time; implement idempotency via `eventId` and reconciliation via GET APIs |
| **Loan locks** | Lock/unlock webhooks do not eliminate need for retry/polling on lock acquisition |
| **Condition framework** | Verify `useEnhancedConditionIndicator` before calling condition APIs; mismatch causes errors (see 26.1 release notes) |
| **Date formats** | V3: `yyyy-MM-ddTHH:mm:ssZ` (datetime), `yyyy-MM-dd` (date) |

---

## M. Common mistakes

| Mistake | Why it fails | Correct approach |
|---------|--------------|------------------|
| Using V1 Loan APIs for new integrations | V3 is recommended best practice when available | Use V3 Loan Management + Schema APIs |
| Calling Enhanced Condition APIs on a Standard loan | Separate APIs exist per framework | Check `loan.useEnhancedConditionIndicator` first |
| Treating milestones as conditions | Different domain objects with different APIs and webhooks | Model separately; cross-reference loanId only |
| Assuming webhook payload is complete loan state | Webhooks signal change; `resourceRef` points to resource | GET loan/condition/task after event for authoritative state |
| Using `view=full` in polling loops | Largest payload; performance impact | Default to `view=entity`; use targeted GETs |
| Ignoring multi-chunk EFC payloads | Incomplete field change data | Reassemble chunks using `chunkId` per EFC docs |
| Creating Workflow Tasks without `workEntity` linkage | Task orphaned from loan context | Set `workEntity` to loan (`urn:elli:encompass:loan`) |
| Assuming 13 milestone names are fixed | Admin can rename/configure | Resolve milestone by `id`, not title alone |

---

## Cross-references

| Topic | File |
|-------|------|
| Loan API deep dive | [02-loan-domain.md](./02-loan-domain.md) |
| Schema, field IDs, collections | [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md) |
| Standard conditions | [04-conditions-standard.md](./04-conditions-standard.md) |
| Enhanced conditions | [05-conditions-enhanced.md](./05-conditions-enhanced.md) |
| Condition lifecycle & comments | [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) |
