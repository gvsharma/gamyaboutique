# 04 — Standard Conditions

> **Primary source:** [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions) · [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)  
> **Related:** [05-conditions-enhanced.md](./05-conditions-enhanced.md) · [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) · [02-loan-domain.md](./02-loan-domain.md)

---

## A. Purpose

Standard Conditions are the **legacy eFolder condition framework** used when a loan's `useEnhancedConditionIndicator` is `false`. This document covers when Standard Conditions apply, how they differ from Enhanced Conditions, and which APIs the official documentation establishes.

---

## B. When Standard Conditions apply

Per [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions):

| `loan.useEnhancedConditionIndicator` | Framework |
|--------------------------------------|-----------|
| `false` | **Standard Conditions** — separate APIs are available |
| `true` | **Enhanced Conditions** — use V3 `/encompass/v3/loans/{loanId}/conditions` |

| Property | Detail |
|----------|--------|
| Field ID | `ENHANCEDCOND.X1` |
| JSON path | `loan.useEnhancedConditionIndicator` |
| Writable after create? | From release 26.1: only if **no conditions** (enhanced or standard) exist in the loan |

### 26.1 guardrail

Per [26.1 Major Release](https://developer.icemortgagetechnology.com/developer-connect/changelog/261-major-release):

> Starting with the 26.1 release, the [standard condition create] APIs will fail with a **500 error** if the `useEnhancedConditionIndicator` attribute in the loan is set to true.

Always verify the indicator before calling Standard Condition APIs.

---

## C. Business meaning

Per [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions):

> A condition is an entry in the eFolder that allows you to track the status of a loan condition as the loan moves through the Pipeline. Multiple documents can be assigned to a condition using the Conditions API as well as in Encompass. A document can be assigned to more than one condition.

Standard Conditions do **not** support:
- Condition-level and field-level customization (per Enhanced Conditions intro)
- Condition reports across multiple loans

These capabilities require Enhanced Conditions (Encompass 20.2+).

---

## D. Condition types (Standard)

Per [V1 Manage Preliminary Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-preliminary-conditions) OpenAPI, documented condition types include:

| Type | Description |
|------|-------------|
| `preliminary` | Pre-qualification / early pipeline conditions |
| `underwriting` | Underwriting conditions |
| `postclosing` | Post-closing conditions |
| `purchase` | Purchase conditions |

Each type has its own API path segment under `/encompass/v1/loans/{loanId}/conditions/`.

---

## E. Documented V1 endpoints

The following endpoints are **explicitly documented** in official ICE Developer Connect reference pages and release notes. This is not an exhaustive inventory — **documentation does not establish** a complete list of all Standard Condition endpoints in this knowledge base.

### Create endpoints (26.1 release notes)

| Operation | Method | Endpoint |
|-----------|--------|----------|
| V1 Create Preliminary Conditions | `POST` | `/encompass/v1/loans/{loanId}/conditions/preliminary` |
| V1 Create Post-Closing Conditions | `POST` | `/encompass/v1/loans/{loanId}/conditions/postclosing` |
| V1 Create Underwriting Conditions | `POST` | `/encompass/v1/loans/{loanId}/conditions/underwriting` |

### Additional endpoints confirmed in OpenAPI reference pages

| Operation | Method | Endpoint | Source |
|-----------|--------|----------|--------|
| V1 Get a Preliminary Condition | `GET` | `/encompass/v1/loans/{loanId}/conditions/preliminary/{conditionId}` | [V1 Get a Preliminary Condition](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-preliminary-conditions) |
| V1 Manage Preliminary Conditions | `PATCH` | `/encompass/v1/loans/{loanId}/conditions/preliminary` | [V1 Manage Preliminary Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-preliminary-conditions) |

> **documentation does not establish** the complete set of GET/Manage endpoints for `underwriting` and `postclosing` condition types in this document. Consult the [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions) reference section for the full API catalog in your environment.

### Manage actions (Preliminary — documented)

Per V1 Manage Preliminary Conditions OpenAPI, `action` query parameter values:

| Action | Effect |
|--------|--------|
| `add` | Adds to a condition set |
| `remove` | Deletes the condition |
| `update` | Updates the condition |

---

## F. Standard condition contract — key fields

Per V1 Create Preliminary Conditions and related OpenAPI schemas:

| Field | Description |
|-------|-------------|
| `id` | Unique condition identifier (`conditionId`) |
| `conditionType` | `underwriting`, `postclosing`, `preliminary`, `purchase` |
| `source` | Required. Values include: **Escrow, Investor, Recorder's Office, Borrowers, FHA, VA, MI Company, Other, Manual, Condition Set, Automated Conditions** |
| `status` | **Added, Expected, Requested, Received, Rerequested, Fulfilled, Reviewed, Sent, Cleared, Waived, Expired, Rejected** |
| `statusDate` | Last status change timestamp |
| `daysToReceive` | Number of days to receive |
| `requestedFrom` | User who requested |
| `forAllApplications` | If `true`, applies to all loan applications |
| `application` | Required if not `forAllApplications` — specific borrower pair |
| `templateId` | Template used to create the condition |
| `createdDate` / `createdBy` | Audit fields |

Condition ID is returned in the **response header** when the condition is created (per Loan Conditions overview).

---

## G. Standard vs Enhanced comparison

| Dimension | Standard | Enhanced |
|-----------|----------|----------|
| API version | V1 | V3 |
| Indicator | `useEnhancedConditionIndicator = false` | `useEnhancedConditionIndicator = true` |
| Customization | Limited | Condition-level and field-level |
| Multi-loan reports | Not supported | Supported |
| Settings APIs | documentation does not establish dedicated Standard settings APIs | Types, sets, templates via `/encompass/v3/settings/loan/conditions/*` |
| Webhook `condition` event | documentation does not establish Standard condition webhook support | Documented for Enhanced Conditions on Loan resource |
| Status model | Fixed enum (12 values above) | Lender-configurable tracking definitions |

---

## H. John Smith example — Standard Conditions

**Scenario:** John Smith's $400K conventional loan has `useEnhancedConditionIndicator = false`. Underwriter Robert needs paystubs.

```http
POST /encompass/v1/loans/{loanId}/conditions/underwriting
Authorization: Bearer <token>
Content-Type: application/json
```

> Illustrative payload based on documented contract.

```json
[
  {
    "title": "Provide most recent two paystubs",
    "source": "Borrowers",
    "status": "Requested",
    "forAllApplications": true,
    "daysToReceive": 5,
    "requestedFrom": "Robert"
  }
]
```

Retrieve `conditionId` from response header, then:

```http
GET /encompass/v1/loans/{loanId}/conditions/underwriting/{conditionId}
```

---

## I. Webhooks

Per [Loan webhook catalog](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan):

> `condition` event — When loan **Enhanced Conditions** are created.

**documentation does not establish** whether Standard Conditions trigger the same `condition` webhook subevents (`create`, `update`, `assign`, `assignDocument`, `remove`, `comment`, `status change`). For Standard loan integrations, plan on polling or using `update`/`change`/`fieldchange` loan events unless verified in your environment.

---

## J. Migration to Enhanced Conditions

| Step | Action |
|------|--------|
| 1 | Verify no existing conditions on loan |
| 2 | `PATCH /encompass/v3/loans/{loanId}` with `useEnhancedConditionIndicator: true` (26.1+) |
| 3 | Switch to V3 Enhanced Condition APIs |
| 4 | Re-create conditions using templates/sets via `PATCH .../conditions?action=Add` |

**documentation does not establish** an automated migration API from Standard to Enhanced conditions.

---

## K. Production concerns

| Concern | Detail |
|---------|--------|
| **Framework mismatch** | Calling Standard APIs on Enhanced-enabled loan → 500 error (26.1+) |
| **V1 API status** | V1 is legacy; migrate to Enhanced V3 when possible |
| **Condition ID in header** | Parse response headers on create — body may not include ID depending on `view` |
| **Status enum** | Standard statuses are fixed; don't assume Enhanced tracking names apply |
| **Multi-application loans** | Use `forAllApplications` or specify `application` correctly |
| **Document assignment** | Standard conditions support document assignment per Loan Conditions overview; exact API **documentation does not establish** in this file |

---

## L. Common mistakes

| Mistake | Fix |
|---------|-----|
| Using V3 `/conditions` on a Standard loan | Check `useEnhancedConditionIndicator` first |
| Assuming same status values as Enhanced | Standard has its own 12-value enum |
| Ignoring response header for `conditionId` | Read header on create |
| Changing indicator after conditions exist | Not allowed (26.1+); must clear all conditions first |
| Inventing endpoint paths for underwriting/postclosing | Verify in official reference before implementing |
| Expecting Enhanced webhook subevents for Standard | Not documented — implement reconciliation |

---

## M. Cross-references

| Topic | File |
|-------|------|
| Enhanced Conditions deep dive | [05-conditions-enhanced.md](./05-conditions-enhanced.md) |
| Condition lifecycle walkthrough | [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) |
| Loan indicator field | [02-loan-domain.md](./02-loan-domain.md) |
| Domain overview | [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) |
