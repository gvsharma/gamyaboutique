# Enhanced Conditions

## Overview

Enhanced Conditions were introduced in **Encompass 20.2**. Official documentation states they provide:

- Customization at **condition level** and **field level**
- Condition reports across multiple loans (not supported by standard conditions)

Prerequisites and setup: *Working with Enhanced Conditions: Setup and User Guide* (Encompass Resource Center — requires access).

---

## Loan-level mode switch

| Field ID | JSON path | Value | Mode |
|----------|-----------|-------|------|
| `ENHANCEDCOND.X1` | `loan.useEnhancedConditionIndicator` | `true` | Enhanced Conditions |
| `ENHANCEDCOND.X1` | `loan.useEnhancedConditionIndicator` | `false` | Standard Conditions |

Always read this indicator before choosing APIs.

---

## API sets

Encompass Developer Connect provides three Enhanced Conditions API sets:

### 1. Managing Enhanced Conditions (loan-level)

Endpoints: `/encompass/v3/loans/{loanId}/conditions`

| Operation | Method | Notes |
|-----------|--------|-------|
| Get all | GET | Filter by `conditionType`, `includeRemoved`; views: Summary, Detail, Full |
| Get one | GET | Single condition |
| Manage | PATCH | Actions: add, update, remove, duplicate |

Manage API capabilities:

- Add Condition Sets, Condition Templates list, or ad hoc conditions
- Manage condition comments
- Assign/unassign condition documents
- Duplicate conditions (requires `allowDuplicate` on template; copies all except trackingEntries, comments, assignedTo)

Applying template: provide matching `title` + `conditionType` in payload.

**Loan-level `title` is Retrieve-Only** — cannot be edited at loan level.

### 2. Enhanced Conditions Settings

| Resource | Endpoint |
|----------|----------|
| Condition Types | `/encompass/v3/settings/loan/conditions/types` |
| Condition Sets | `/encompass/v3/settings/loan/conditions/set` |
| Condition Templates | `/encompass/v3/settings/loan/conditions/templates` |

Settings define (**LENDER CONFIGURABLE**):

- Condition types, statuses, sources, recipients, Prior To values
- Actions allowed per template based on user role

### 3. Automated Conditions Evaluator

```
POST /encompass/v3/calculators/automatedConditions
```

Evaluates Automated Enhanced Conditions Business Rules in Encompass Settings; returns applicable condition templates for current loan state.

---

## Configuration hierarchy

```
Condition Type          (e.g., Underwriting, Preliminary, Post-Closing)
    └── Condition Set       (grouped conditions for a scenario)
         └── Condition Template   (reusable definition)
              └── Condition Instance (on loan file)
```

| Level | Description |
|-------|-------------|
| **Condition Type** | Classifies condition; read-only on loan instance from template |
| **Condition Set** | Batch of templates applied together |
| **Condition Template** | Admin-defined blueprint with fields, tracking, definitions |
| **Condition Instance** | Runtime condition on loan (EnhancedConditionContract) |
| **Automated Conditions** | Rules engine suggests/applies templates based on loan data |

All settings-level names and values: **LENDER CONFIGURABLE**.

---

## EnhancedConditionContract — key attributes

| Attribute | Access | Description |
|-----------|--------|-------------|
| `id` | RW | Unique condition GUID |
| `conditionType` | RetrieveOnly | From template (Preliminary, Underwriting, Post-Closing, etc.) |
| `title` | RetrieveOnly (loan-level) | Condition name |
| `internalId` / `externalId` | RW | Internal (Encompass Web) vs external (TPO) identifiers |
| `internalDescription` / `externalDescription` | RW | Staff vs TPO-facing text |
| `category` | RW | Assets, Credit, Income, Legal, Misc, Property, etc. (**LENDER CONFIGURABLE**) |
| `priorTo` | RW | When condition must be cleared (Approval, Docs, Funding, etc.) |
| `recipient` | RW | Condition recipient (**LENDER CONFIGURABLE**) |
| `requestedFrom` | RW | e.g., "Borrower" |
| `daysToReceive` | RW | Expected days to receive |
| `source` | RW | Source system (e.g., "Fannie Mae") |
| `application` | RW | Borrower pair reference |
| `status` | RetrieveOnly | Current status name |
| `statusDate` | RetrieveOnly | When status applied (GMT) |
| `statusOpen` | RetrieveOnly | Open vs satisfied |
| `age`, `ageStartDate`, `ageClosedDate` | RetrieveOnly | Aging metrics |
| `assignedTo[]` | RW | **Documents** assigned to condition |
| `owner` | RW | User/role responsible for clearing |
| `tracking[]` | RW | Status tracking entries |
| `comments[]` | RW | LogCommentContract entries |
| `definitions` | RW | Field option definitions (category, priorTo, recipient, source, tracking) |
| `isRemoved` | RW | Soft removal flag |
| `sourceOfCondition` | RetrieveOnly | How condition was added (see values below) |
| `documentReceiptDate` | RW | When supporting document received |

### sourceOfCondition values (official)

- User, Manual, ConditionList, AutomatedByUser
- FHA, DUFindings, EarlyCheckFindings, LPAFindings, FHA Findings, LCLAFindings
- Duplicate
- InvestorDelivery (Service-to-Service only)
- AutomatedByRule (Service-to-Service only)
- PartnerConnect (Service-to-Service only)

---

## Condition tracking

Tracking uses `TrackingEntryContractAttributes`:

| Field | Description |
|-------|-------------|
| `status` | Status name marked complete |
| `user` | RetrieveOnly. Who marked it |
| `date` | RetrieveOnly. When marked |
| `isChecked` | Required. `true` = add entry; `false` = remove |

Tracking definitions come from `definitions.trackingDefinitions[]` on the condition type/template.

**Delegated tracking:** `delegatedTrackingStatuses[]` identifies which roles can update delegated statuses.

---

## Condition comments

Uses `LogCommentContract`:

| Field | Description |
|-------|-------------|
| `comments` | Comment text |
| `forRole` | Role comment is directed to |
| `addedBy` / `addedDate` | RetrieveOnly audit |
| `reviewedBy` / `reviewedDate` | Review tracking |
| `isExternal` | Whether visible externally (TPO) |

---

## Definitions object

`EnhancedConditionDefinitionContract` provides valid options for:

- `categoryDefinitions`
- `priorToDefinitions`
- `recipientDefinitions`
- `sourceDefinitions`
- `trackingDefinitions`

These reflect **LENDER CONFIGURABLE** settings at type/template level.

---

## GET view parameter

| View | Returns |
|------|---------|
| Summary | Summary only |
| Detail | Summary + tracking + definitions |
| Full | Summary + tracking + definitions + comments |

---

## Duplicate behavior

When `action=duplicate`:

- Requires `allowDuplicate` enabled on associated ConditionTemplate
- Requires `conditionID` in payload
- Copies everything **except** `trackingEntries`, `comments`, `assignedTo`
- Sets `sourceOfCondition` = Duplicate internally

---

## Beta attributes (not production-ready per official docs)

- `verifications[]` — beta, not ready for production
- `borrowers[]` — beta, not ready for production

---

## Webhook resource category

Dedicated Enhanced Conditions webhook category exists in addition to loan-level `condition` events.

See [events.md](./events.md).

---

## John Smith example

Underwriter Robert adds automated + manual conditions:

| Condition | sourceOfCondition | priorTo |
|-----------|-------------------|---------|
| Provide most recent two paystubs | Manual / User | Approval |
| Verify large deposit | DUFindings (if AUS-driven) | Approval |
| Hazard insurance policy | ConditionList (from set) | Docs |

Sarah assigns Paystub PDFs to the paystub condition's `assignedTo` documents list.

---

## References

- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)
- [V3 Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1)
- [V3 Get All Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-conditions)
- [Settings Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-enhanced-conditions)
- [V3 Evaluate Automated Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/evaluate-automated-conditions)
