# Conditions (Standard)

## Definition

Official Developer Connect documentation:

> A condition is an entry in the eFolder that allows you to track the status of a loan condition as the loan moves through the Pipeline.

A **condition** is a **requirement** — not a document, not a task, not a milestone.

---

## Standard vs Enhanced Conditions

| Mode | Indicator | API |
|------|-----------|-----|
| **Standard Conditions** | `loan.useEnhancedConditionIndicator = false` (Field `ENHANCEDCOND.X1`) | Loan Conditions API (legacy standard) |
| **Enhanced Conditions** | `loan.useEnhancedConditionIndicator = true` | Enhanced Conditions API (Encompass 20.2+) |

Always check the loan-level indicator before calling condition APIs. See [enhanced-conditions.md](./enhanced-conditions.md).

---

## Condition types (standard context)

Standard conditions are organized by purpose in the eFolder:

- **Preliminary** conditions
- **Underwriting** conditions
- **Post-closing** conditions

Enhanced Conditions extend this with configurable **Condition Types** at the settings level (**LENDER CONFIGURABLE**).

---

## Condition ≠ Document ≠ Task ≠ Milestone

```
Condition  = Requirement ("Provide most recent two paystubs")
Document   = Evidence container in eFolder ("Paystubs" document)
Attachment = File (Paystub.pdf, Paystub2.pdf)
Task       = Staff work item ("Review borrower income")
Milestone  = Workflow stage ("Processing", "Cond. Approval")
```

Official documentation on document assignment:

> Multiple documents can be assigned to a condition using the Conditions API as well as in Encompass. A document can be assigned to more than one condition.

---

## Example: paystub condition

**Condition:** "Provide most recent two paystubs."

```
Condition
 |
 +-- Status
 |
 +-- Tracking
 |
 +-- Comments
 |
 +-- Assigned Documents
         |
         +-- Paystub.pdf (attachment on document)
         +-- Paystub2.pdf (attachment on document)
```

The condition describes **what** is required. Documents and attachments are **proof** the requirement was met.

---

## Condition ID

Each condition receives a unique **conditionId**. Required when specifying a condition in API calls.

Discovery:

- Response header when condition is created
- GET conditions list responses

---

## Standard Conditions API

Use the Loan Conditions API to create and manage underwriting, post-closing, and preliminary conditions in the Encompass eFolder:

- Add, remove, update, delete conditions in a condition set

**When to use:** Loans with `useEnhancedConditionIndicator = false`.

For enhanced condition attribute details (tracking, priorTo, assignedTo, etc.), see [enhanced-conditions.md](./enhanced-conditions.md) — the Enhanced API is the authoritative rich model even when comparing concepts.

---

## Condition status and tracking (conceptual)

Standard conditions support status tracking in the eFolder UI. Enhanced Conditions expose explicit API contracts:

| Enhanced attribute | Description |
|--------------------|-------------|
| `status` | RetrieveOnly. Current status name (e.g., "Requested") |
| `statusDate` | RetrieveOnly. When current status applied |
| `statusOpen` | RetrieveOnly. Whether condition is open vs satisfied |
| `tracking[]` | Status checkpoint entries with `isChecked` |

Standard condition status values: **LENDER CONFIGURABLE** via Encompass settings.

---

## Condition comments

Conditions support comments (Enhanced: `LogCommentContract` on condition). Example:

> "Need donor statement."

Comments are scoped to the condition — not conversation logs.

---

## Condition documents

Documents are **assigned** to conditions. In Enhanced Conditions, `assignedTo` is:

> List of documents that the condition is assigned to.

Assign/unassign via Enhanced Conditions manage API. Webhook sub-events: `assignDocumentsToConditions`.

---

## Condition assignment and ownership

| Concept | Enhanced field | Description |
|---------|----------------|-------------|
| Owner | `owner` | User/role responsible for clearing condition |
| Assigned documents | `assignedTo[]` | Document entity references |
| Requested from | `requestedFrom` | e.g., "Borrower" |
| Recipient | `recipient` | **LENDER CONFIGURABLE** values |

---

## Prior To

**Prior To** identifies when the condition must be cleared or waived (e.g., Approval, Docs, Funding, Closing, Purchase).

Values defined in Encompass settings — **LENDER CONFIGURABLE**.

Enhanced field: `priorTo` with `priorToDefinitions[]` in definitions.

---

## Removal and soft deletion

Enhanced Conditions support:

- `isRemoved` — indicates condition removed from loan
- `includeRemoved` query parameter on GET — include removed conditions in list
- Manage API `remove` action

Standard conditions support remove/delete via Conditions API.

Removed conditions may still appear in reporting/history depending on configuration.

---

## Automated conditions

Enhanced platform provides Automated Conditions Evaluator:

```
POST /encompass/v3/calculators/automatedConditions
```

Evaluates business rules in Encompass Settings and returns condition templates applicable to the loan state.

See [enhanced-conditions.md](./enhanced-conditions.md).

---

## Webhook events (loan resource)

When Enhanced Conditions enabled, loan `condition` event type supports subevents:

- create, update, assign, assignDocument, remove, comment, status change

Support: API (Smart Client behavior may vary).

---

## John Smith underwriting example

Robert (Underwriter) adds condition during Cond. Approval milestone:

1. Condition created: "Provide most recent two paystubs."
2. Status tracking: **Requested**
3. Sarah requests documents from John
4. Paystubs uploaded → documents assigned to condition
5. Tracking updated → **Received**
6. Robert reviews → condition satisfied/cleared
7. Loan advances toward Approval milestone

---

## References

- [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions)
- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)
- [V3 Get All Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-conditions)
- [V3 Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1)
