# 04 — Standard Conditions

**Related:** [05 Enhanced](./05-conditions-enhanced.md) · [06 Lifecycle and comments](./06-condition-lifecycle-and-comments.md) · [09 Documents](./09-documents-efolder-attachments.md)

**Official:** [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions) · [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)

---

## A. Business meaning

A **condition** is a **requirement** that must be satisfied as the loan moves through the pipeline — typically with supporting documents.

ICE (standard Conditions API): a condition is an **eFolder entry** used to track status of a loan condition. It can represent underwriting, post-closing, and preliminary conditions. Multiple documents can be assigned to a condition; a document can be assigned to more than one condition. Accessing a condition in eFolder exposes assigned documents and files assigned to those documents.

That is **many-to-many at the business level** (documented).

## B. John Smith example (illustrative)

Robert (underwriter) needs: **“Provide most recent two paystubs.”**

That requirement is the condition. `July_Paystub.pdf` and `August_Paystub.pdf` are **attachments** on one or more **documents** assigned to the condition. Sarah may have a **task** “Collect paystubs.” Processing **milestone** is where the loan sits. Four different objects.

## C. Domain model

```text
Standard Condition  <---- many-to-many ---->  Document  ---> Attachment(s)
```

Standard and Enhanced are **separate APIs**. Do not call Enhanced endpoints on a Standard loan or vice versa without checking the indicator.

## How an integration chooses the API (documented)

Loan-level indicator:

- Field ID: `ENHANCEDCOND.X1`
- JSON path: `loan.useEnhancedConditionIndicator`

| Value | Meaning (documented) |
|-------|----------------------|
| `true` | Loan uses **Enhanced Conditions** |
| `false` | Loan uses **Standard Conditions**; **separate APIs** |

Source: [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions).

Enhanced Conditions were introduced in **Encompass 20.2** (documented on that same overview). Older instances or unmigrated loans may still be Standard.

## D. API

Standard: [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions).

ICE describes methods to add, remove, update, and delete conditions in a condition set. Each condition has a unique **condition ID**; on create, ID can be retrieved from the **response header**.

Exact V1 vs V3 path for **standard** (not enhanced) list/get/patch: open the current Loan Conditions child pages. Do **not** assume they share `/encompass/v3/loans/{loanId}/conditions` with Enhanced — that V3 path is documented for **Enhanced** management.

If a child page is V1, say V1 in your runbook. Mixing the Enhanced V3 body (`EnhancedConditionContract`) into Standard calls is a contract error.

## E–F. Request / response

**NOT ESTABLISHED in this file:** a copied Standard Condition JSON schema. Pull the live example from the current Loan Conditions operation page and paste it into your bank runbook with the date verified.

Illustrative HTTP only:

```http
Authorization: Bearer {accessToken}
```

## G. Field table

Until you paste the Standard contract from the official page, do not invent fields. Use Enhanced field names **only** in [05](./05-conditions-enhanced.md).

What **is** documented for Standard:

| Item | Documented fact |
|------|-----------------|
| Identity | `conditionId` unique; returned on create (response header) |
| Types mentioned | underwriting, post-closing, preliminary |
| Documents | many documents per condition; one document on many conditions |
| Files | accessed via assigned documents |

Read/write, comments, tracking, webhooks for **Standard** specifically: confirm on the current Standard pages. Loan webhook `condition` event text says it fires when loan **Enhanced Conditions** are created and lists Enhanced-oriented subevents. **Do not assume Standard condition edits emit the same webhook.** That would be invention.

## H. Lifecycle

See [06](./06-condition-lifecycle-and-comments.md). Status names for Standard are **lender/eFolder configuration**. Do not hardcode Created/Requested/Satisfied as API enums unless the official Standard contract lists them.

## I. Events

Standard-specific webhook: **NOT ESTABLISHED** as identical to Enhanced. Verify Resources API / Loan webhook page for your instance.

## J. Integration

1. GET loan `useEnhancedConditionIndicator`.
2. If false, use Standard Conditions APIs only.
3. Persist `conditionId` + assigned document IDs.
4. Fetch documents/attachments separately ([09](./09-documents-efolder-attachments.md)).

## K. Production concerns

- Wrong API family is a common 4xx/empty-result cause.
- Soft delete / remove: Enhanced documents `isRemoved` and `includeRemoved`; **confirm Standard equivalents** on the Standard page.
- Lock: write APIs commonly require or accept `lockId` — confirm per operation.

## L. Common mistakes

1. Using Enhanced V3 manage APIs on a Standard loan.
2. Treating condition ID as a document ID.
3. Assuming Standard and Enhanced status lists match.

## M. Questions

1. How do you detect Standard vs Enhanced on John Smith’s loan?
2. What does ICE mean by “condition set” on the Standard API?
3. Where is `conditionId` returned on create?
