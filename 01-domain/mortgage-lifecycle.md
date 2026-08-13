# Mortgage Lifecycle

## Purpose

This document describes a **realistic mortgage lifecycle** as modeled in Encompass, using the fictional John Smith purchase loan. It explains how domain objects change as the loan progresses.

**Important:** Milestone names, count, order, and duration are **LENDER CONFIGURABLE**. Do not assume every lender uses identical stages or labels.

---

## Official out-of-the-box milestones

Developer Connect documents thirteen predefined milestones in Encompass "out of the box":

| # | Milestone name (default) |
|---|--------------------------|
| 1 | Started |
| 2 | Qualification |
| 3 | Processing |
| 4 | Submittal |
| 5 | Cond. Approval |
| 6 | Resubmittal |
| 7 | Approval |
| 8 | Doc Preparation |
| 9 | Docs Signing |
| 10 | Funding |
| 11 | Post Closing |
| 12 | Shipping |
| 13 | Completion |

Administrators can rename milestones, create custom milestones, and apply **milestone templates** based on loan type, channel, or other criteria (**LENDER CONFIGURABLE**).

---

## Conceptual lifecycle (illustrative)

The diagram below shows a common retail origination pattern. Your lender's configured milestones may differ.

```
Application
    |
Qualification
    |
Processing
    |
Submittal
    |
Underwriting        ← often aligns with Submittal → Cond. Approval window
    |
Conditional Approval
    |
Condition Collection
    |
Resubmittal
    |
Approval
    |
Document Preparation
    |
Signing
    |
Funding
    |
Post Closing
    |
Completion
```

"Underwriting" and "Condition Collection" are **business activities** that may span multiple configured milestones rather than always mapping 1:1 to a single milestone name.

---

## Lifecycle stage definitions (business domain)

| Stage | Business meaning | Typical domain objects touched |
|-------|------------------|--------------------------------|
| Application | Borrower intent captured; initial 1003 data | Application, Borrower, Property, Contacts |
| Qualification | LO validates scenario fit | Loan fields, AUS logs, Conversation logs |
| Processing | Processor verifies income/assets/credit | VoEs, VoDs, Conditions, Documents, Tasks |
| Submittal | File sent to underwriting | Milestone completion, Conditions cleared/waived |
| Underwriting | Risk decision | Conditions added, UW tasks, AUS findings |
| Conditional Approval | Approved subject to conditions | Enhanced/Standard conditions with Prior To = Approval |
| Condition Collection | Borrower/third party provides evidence | Document attachments assigned to conditions |
| Resubmittal | UW reviews cleared conditions | Condition tracking status changes |
| Approval | Final credit approval | Milestone, rate lock logs |
| Document Preparation | Closing docs ordered | Document Order, Disclosure Tracking |
| Signing | eSign or wet sign | Document Delivery, Disclosure Tracking |
| Funding | Loan funds | Funding milestone, post-closing conditions |
| Post Closing | Trailing docs, shipping | Post-closing conditions, investor delivery |
| Completion | Loan manufactured/complete | Completion milestone |

---

## John Smith loan — lifecycle walkthrough

### Stage 1: Application / Started

**Actors:** John Smith (borrower), Mike (Loan Officer)

| Domain change | Detail |
|---------------|--------|
| Loan created | New loanId assigned |
| Application | Borrower pair with John Smith |
| Property | $500,000 purchase property |
| Loan amount | $400,000 conventional 30-year fixed |
| Milestone | Started → Qualification (as configured) |
| Associate | Mike assigned to LO milestone role |

**Webhook events (examples):** `create`, `update`, possibly `milestone` with `updateMilestones`

---

### Stage 2: Qualification / Processing

**Actors:** Sarah (Processor)

| Domain change | Detail |
|---------------|--------|
| Income/employment | VoEs added under application |
| Assets/liabilities | VoDs, VoLs populated |
| Milestone | Processing started; `startDate` set on milestone log |
| Tasks | Workflow task: "Review borrower income" may be created |
| Conversation log | Phone call: "Spoke with borrower about large deposit." |

Sarah's task ("Review borrower income") is **work assigned to staff**. It is not the same as a condition requiring paystubs.

---

### Stage 3: Submittal / Underwriting

**Actors:** Robert (Underwriter)

| Domain change | Detail |
|---------------|--------|
| Milestone | Submittal marked `doneIndicator: true`; Cond. Approval active |
| Associate | Robert assigned as Underwriter on milestone |
| Conditions added | "Provide most recent two paystubs." (see [conditions.md](./conditions.md)) |
| AUS | AUS tracking log entries (editable log) |

Robert adds underwriting conditions. Each condition is a **requirement**; paystubs will later become **document evidence**.

---

### Stage 4: Conditional Approval / Condition Collection

**Actors:** Sarah (Processor), John Smith (Borrower)

| Domain change | Detail |
|---------------|--------|
| Condition status | Tracking: Requested → Received (via tracking entries) |
| Documents | eFolder document "Paystubs" created |
| Attachments | Paystub.pdf, Paystub2.pdf uploaded and assigned to document |
| Condition assignment | Documents linked to condition via `assignedTo` |
| Condition comment | "Need donor statement for large deposit." |

```
Condition: "Provide most recent two paystubs."
 |
 +-- Status: Requested → Received
 |
 +-- Tracking entries (status checkpoints)
 |
 +-- Comments
 |
 +-- Assigned Documents
         |
         +-- Paystub.pdf (attachment)
         +-- Paystub2.pdf (attachment)
```

---

### Stage 5: Resubmittal / Approval

**Actors:** Robert (Underwriter)

| Domain change | Detail |
|---------------|--------|
| Condition tracking | Status marked satisfied/cleared per tracking definitions |
| Milestone | Cond. Approval → Resubmittal → Approval |
| Tasks | "Review appraisal" task completed with disposition comment |

---

### Stage 6: Document Preparation / Signing

**Actors:** Lisa (Closing Coordinator)

| Domain change | Detail |
|---------------|--------|
| Document Order | Opening/Closing doc set generated via Encompass Docs APIs |
| Document Delivery | Package sent to borrower portal |
| Disclosure Tracking | 2015 log created/updated for LE/CD compliance |
| eFolder | Document containers created from delivery |
| Milestone | Doc Preparation → Docs Signing |

---

### Stage 7: Funding / Post Closing / Completion

| Domain change | Detail |
|---------------|--------|
| Milestone | Funding marked complete |
| Post-closing conditions | May be added (Enhanced Condition type: Post-Closing) |
| System logs | Milestone History Log records transitions |
| Milestone | Post Closing → Shipping → Completion |

---

## Lender configuration and version differences

| Topic | Variability |
|-------|-------------|
| Milestone names | **LENDER CONFIGURABLE** — admin can rename all thirteen defaults |
| Custom milestones | **LENDER CONFIGURABLE** — additional stages may exist |
| Milestone templates | **LENDER CONFIGURABLE** — applied by loan type/channel |
| Standard vs Enhanced Conditions | Loan-level indicator; lender must enable Enhanced Conditions (introduced Encompass 20.2) |
| Task-based workflows | Optional; requires Encompass Web task configuration |
| Workflow task vs milestone task | Different systems — see [tasks.md](./tasks.md) |

Version-specific API behavior is documented in [Encompass Developer Connect release notes](https://developer.icemortgagetechnology.com/developer-connect/changelog).

---

## SLA and aging relevance

Milestone logs expose:

- `startDate` — when milestone work began
- `days` — expected days to complete (**RetrieveOnly**)
- `duration` — actual elapsed time (**RetrieveOnly**)
- `doneIndicator` — completion flag

Comparing expected vs actual duration supports processor/underwriter performance analysis. See [milestones.md](./milestones.md).

---

## References

- [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- [Settings Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-milestones)
- [SDK to API Migration — Milestone Webhooks](https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide)
