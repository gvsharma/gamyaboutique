# 05 — Enhanced Conditions

**Related:** [04 Standard](./04-conditions-standard.md) · [06 Lifecycle and comments](./06-condition-lifecycle-and-comments.md)

**Official:** [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions) · [V3 Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1) · [V3 Get All Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-conditions) · [V3 Get an Enhanced Condition](https://developer.icemortgagetechnology.com/developer-connect/reference/get-an-enhanced-condition) · [V3 Manage Comments](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-comments) · [V3 Manage Tracking Entries](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-tracking-entries)

---

## A. Business meaning

Enhanced Conditions (Encompass **20.2+**) let lenders customize conditions at **condition and field level** and report across **multiple loans** — capabilities ICE says Standard Conditions do not currently support.

Use them only when `loan.useEnhancedConditionIndicator` is `true`.

## B. John Smith example (illustrative)

Robert adds template-based condition title **“Provide most recent two paystubs.”** (loan-level `title` is **retrieve-only** once on the loan — documented). Sarah requests it from the borrower. John uploads files. Robert comments and updates tracking. If stubs are incomplete, Robert re-requests (new tracking / comments — status names are **configured**).

## C. Domain model

```text
Settings (instance-level)
  Condition Types, Sets, Templates, automated rules
        |
        v
Loan Enhanced Condition instance
  +-- comments[]          (LogCommentContract)
  +-- tracking[]          (TrackingEntryContractAttributes)
  +-- assignedTo[]        (documents — EntityReference)
  +-- definitions
  +-- owner, application, borrowers (borrowers: beta)
```

Settings APIs (documented on overview):

- Types: `GET` all types — [Get All Enhanced Condition Types](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-condition-types)
- Sets: `/encompass/v3/settings/loan/conditions/set`
- Templates: Get All Enhanced Condition Templates
- Evaluate Automated Conditions: separate V3 evaluator (see overview)

## D. APIs (documented)

| Operation | Method / path |
|-----------|----------------|
| List | `GET /encompass/v3/loans/{loanId}/conditions` — filter `conditionType`; `includeRemoved` |
| Get one | `GET /encompass/v3/loans/{loanId}/conditions/{conditionId}` — `view`: **Summary** (summary), **Detail** (summary+tracking+definitions), **Full** (those + comments) |
| Manage | `PATCH /encompass/v3/loans/{loanId}/conditions` — EnhancedConditionContract; values must match **lender configuration** |
| Comments | `PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}/comments` — `action`: **Add, Update, Delete** |
| Tracking | `PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}/tracking` — `action`: **add, remove, delete** (if omitted, tracking entries are added) |

Query params commonly documented: `lockId`, `view` (`entity`/`id` on some PATCH; missing view → **204 No Content** on tracking manage).

Duplicate (`action=duplicate`): `allowDuplicate` must be enabled on the template; provide `conditionID`; copy excludes **trackingEntries, comments, assignedTo**.

Add via template: payload `title` + `conditionType` match applies the template.

## E. Request

**Illustrative payload based on documented contract** (status/type strings must be **this lender’s** configured values, not copied blindly):

```http
PATCH /encompass/v3/loans/{loanId}/conditions?action=add&lockId={lockId}&view=entity
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{
  "conditionType": "{lenderConfiguredType}",
  "title": "Provide most recent two paystubs.",
  "requestedFrom": "Borrower",
  "priorTo": "Approval"
}
```

`Requested` / `Approval` / `Borrower` are **examples ICE itself uses as example strings**, not a closed enum. ICE: category, priorTo, recipient values **are defined in Encompass settings and vary by lender/investor**.

## F. Response

Get-one `view=Full` returns summary, tracking, definitions, **and comments** (documented). List endpoint can include tracking and comments in its schema — confirm whether list is as complete as get-one Full before skipping get-by-id.

## G. Field-by-field (from EnhancedConditionContract)

ICE property names below are **documented**. Trailing spaces in some schema keys (`conditionType `, `daysToReceive `, `isRemoved `) appear in the published OpenAPI dump — confirm actual JSON names in live responses; do not blindly send keys with spaces.

| Field | Meaning | Business significance | Read/Write | Configurable? | Example |
|-------|---------|----------------------|------------|---------------|---------|
| `id` | Unique condition GUID | Join key | Assigned | No | `"3AA5BF62-3C0D-46A7-8ADE-03907BE0A5E5"` (ICE example) |
| `conditionType` | Type (e.g. Preliminary, Underwriting, Post-Closing) | Ops queue | Read-only; from template | Yes (types) | Underwriting |
| `title` | Name | What is required | Retrieve-only **at loan level** | Template | Paystubs |
| `internalId` / `internalDescription` | Encompass Web facing | Processor/UW language | Writable per contract | Often templated | `INC0001` |
| `externalId` / `externalDescription` | TPO facing | Broker/borrower-facing wording | Writable per contract | Often templated | Provide signed returns… |
| `externalPrintDate` | Last printed for external/TPO | Audit of what TPO saw | RetrieveOnly | — | ISO datetime |
| `category` | Category | Reporting | Settings-defined | **Yes, varies by lender** | Income, Assets, Credit (ICE examples) |
| `source` | Source system | Provenance | Per contract | — | `"Fannie Mae"` (ICE example) |
| `sourceOfCondition` | How it was added | Automation vs manual | ReadOnly for EDC users | Enum **documented** including User, Manual, ConditionList, AutomatedByUser, FHA, DUFindings, EarlyCheckFindings, LPAFindings, LCLAFindings, Duplicate, plus S2S-only InvestorDelivery, AutomatedByRule, PartnerConnect | `AutomatedByRule` |
| `application` | Borrower pair | Whose requirement | entityId required | — | Application ref |
| `priorTo` | When it must be cleared | Closing calendar | Settings-defined | **Yes** | Approval, Docs, Funding, Closing, Purchase (ICE examples) |
| `recipient` | Recipient | Who cares | Settings-defined | **Yes** | `"MERS"` (ICE example) |
| `requestedFrom` | Who must provide it | Borrower vs third party | Per contract | Often settings | `"Borrower"` |
| `owner` | User/role responsible to manage/clear | Workload | Entity ref | Role config | Robert / Underwriter |
| `startDate` / `endDate` | Effective window | Aging | Per contract | — | ISO datetime |
| `daysToReceive` | Expected receive days | SLA-style expectation | Per contract | Often templated | integer |
| `status` | Current status **type name** | Pipeline | **RetrieveOnly** | **Status names configured** | ICE example `"Requested"` — not a universal enum |
| `statusDate` | When status applied (GMT) | Audit | RetrieveOnly | — | ISO datetime |
| `statusOpen` | Open vs satisfied per definition | Boolean rollup — **not** a substitute for status history | RetrieveOnly | Definition-driven | true/false |
| `age` / `ageStartDate` / `ageClosedDate` | Days open | Condition aging KPIs | RetrieveOnly | — | integer / dates |
| `assignedTo` | **Documents** assigned | Evidence link | Array of document entity refs | — | Document entityType |
| `documentReceiptDate` | Doc received date | Ops | Per contract | — | date |
| `tracking` | Status tracking entries | Formal history | Separate tracking API | Status list configured | See TrackingEntry |
| `comments` / `commentsCount` | Narrative | Context | Comments API: Add/Update/**Delete** | — | LogCommentContract |
| `definitions` | Allowed options for this type/template | Constrains UI/API values | From settings | **Yes** | priorToDefinitions, etc. |
| `isRemoved` | Removed from loan | Soft-remove | Per contract; list `includeRemoved` | — | boolean |
| `createdBy` / `createdDate` / `lastModifiedBy` / `lastModifiedDate` | Provenance | Audit | lastModified* RetrieveOnly | — | entity + datetime |
| `printDefinitions` | Print appearance | Closing docs | Per contract | Settings | ids |
| `publishedDate` | Published | TPO visibility timing | RetrieveOnly | — | datetime |
| `partner` | Partner/third party | EPC-ish association | RetrieveOnly; settings | **Yes** | — |
| `verifications` | Verification refs | **Beta — not ready for production** (ICE warning) | — | — | — |
| `borrowers` | Borrower refs | **Beta — not ready for production** | — | — | — |
| `delegatedTrackingStatuses` | Which roles may update which tracking statuses | Delegation | Per contract | **Yes** | — |

### TrackingEntryContractAttributes (documented)

| Field | Meaning | R/W |
|-------|---------|-----|
| `status` | Name of status marked complete | per tracking API |
| `user` | Who marked it | RetrieveOnly |
| `date` | When marked complete | RetrieveOnly |
| `isChecked` | Required; `true` creates tracking entry; default false | write |

### LogCommentContract (documented)

| Field | Meaning | R/W |
|-------|---------|-----|
| `id` | Comment id | assigned |
| `comments` | Text | writable via Add/Update |
| `forRole` | Role comment was added for | per contract |
| `addedDate` | When added | RetrieveOnly |
| `addedBy` | Who added | entity |
| `reviewedDate` / `reviewedBy` | Review | RetrieveOnly dates |
| `isExternal` | Whether comment can be shown externally | boolean |

**Persist in bank systems?** Identity, status/tracking, dates, assigned document IDs, and comments if the bank’s audit policy requires them. Raw PII in comment text: treat as sensitive. Do not persist beta `verifications`/`borrowers` as production contract.

**Workflow participation:** status/tracking and `priorTo` drive ops; `owner` drives queues; assigned documents drive evidence; comments do **not** replace tracking.

**Events:** Loan webhook `condition` (Enhanced) subevents documented as create, update, assign, assignDocument, remove, comment, status change. Official sample also shows payload keys `createConditions`, `updateStatusTrackingInConditions`, `addCommentsToConditions`, `assignDocumentsToConditions`, `documentStatusUpdates`. Subscribe to the **documented event name** `condition`; treat inner keys as extra payload.

## H–I. Lifecycle and events

See [06](./06-condition-lifecycle-and-comments.md). **No fixed event count.** Rework multiplies tracking + comment + assignDocument notifications.

Enhanced Conditions **template/type** webhooks are a **separate resource** (Create/Update/Delete on templates and types) and may need a **support ticket** plus subscription. Source: [Enhanced Conditions webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions).

## J. Integration

Always GET `view=Full` (or comments API) when you need comment text; do not assume list is complete. After webhook, GET current condition. Honor `lockId` on writes.

## K. Production

- 204 if `view` omitted on some PATCH.
- Duplicate does not copy comments/tracking/assignedTo.
- `status` is retrieve-only — you likely change status via **tracking** entries; confirm in current manage-condition vs tracking pages (do not PATCH a made-up status field if ICE marks it retrieve-only).
- Beta fields: not production.

## L. Common mistakes

1. Editing loan-level `title`.
2. Using Standard APIs on an Enhanced loan.
3. Treating `statusOpen` as the full lifecycle.
4. Assuming comments are append-only (Delete is documented).
5. Shipping `verifications` to production.

## M. Questions

1. What does duplicate copy and what does it drop?
2. Summary vs Detail vs Full?
3. How do delegated tracking statuses affect Robert vs Sarah?
4. Why is `sourceOfCondition` read-only for Developer Connect users?
