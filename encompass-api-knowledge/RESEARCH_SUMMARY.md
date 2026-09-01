# Research summary — Lending Manager dashboard vs Encompass

Research date: **2026-08-25**.  
Portal: [Developer Connect Welcome](https://developer.icemortgagetechnology.com/developer-connect/docs/welcome).

This document answers the sixteen product questions. Official ICE behavior is labeled **Source**. Design choices are labeled **INTERNAL ARCHITECTURE RECOMMENDATION**.

---

## 1. What are the most important APIs for this dashboard?

| Priority | API | Why |
| -------- | --- | --- |
| 1 | `POST /encompass/v3/loanPipeline` | List 50–100 HLA loans in **one page** (max 1000/page). Source: [V3 Loan Pipeline (with Pagination)](https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline-with-pagination-1) |
| 2 | `GET /encompass/v3/loanPipeline/canonicalFields` or `GET /encompass/v1/loanPipeline/fieldDefinitions` | Discover the HLA / Loan Officer **canonical name** for *this* instance. Source: [V3 Get Pipeline Canonical Names](https://developer.icemortgagetechnology.com/developer-connect/reference/get-canonical-names) |
| 3 | `GET /encompass/v3/users` | HLA (internal user) roster. Source: [V3 Get a List of Internal Users](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-list-internal-users) |
| 4 | `GET /encompass/v1/loans/{id}/associates` | Confirm who is assigned on **one** loan (roleName includes the four fixed roles). Source: [V1 Get List of Associates](https://developer.icemortgagetechnology.com/developer-connect/reference/get-associates) |
| 5 | `GET /encompass/v3/loans/{loanId}` with `view=entity` or `logs`/`full` | Loan detail, not the manager grid. Source: [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| 6 | `GET /encompass/v3/loans/{loanId}/milestones` | Current milestone worksheet. Source: [V3 Get Milestone Logs List](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-milestone-logs-list) |
| 7 | Enhanced conditions `GET /encompass/v3/loans/{loanId}/conditions` **or** standard V1 condition routes | Depends on `loan.useEnhancedConditionIndicator`. Source: [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions) |
| 8 | `GET /workflow/v1/tasks` and `GET /workflow/v1/taskPipeline` | Tasks / “my tasks”. Source: [Get Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks), [Get Task Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/get-task-pipeline) |
| 9 | `GET /encompass/v3/loans/{loanId}/documents` and `/attachments` | eFolder metadata. Source: [Get List of Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents) |
| 10 | `POST /webhook/v1/subscriptions` + Resources API | Keep Redis current without polling Get Loan. Source: [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) |
| 11 | `POST /encompass/v3/loans/{loanId}/fieldReader` | Small field set on cache miss. Source: [V3 Field Reader](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-field-reader) |

ICE’s own concurrency guide: **use Pipeline instead of per-loan GETs**; **use webhooks instead of polling**. Source: [Concurrency Limits](https://developer.icemortgagetechnology.com/developer-connect/docs/concurrency-limits).

---

## 2. Can V3 Loan Pipeline retrieve 50–100 loans for one HLA efficiently?

**Yes, if you can filter.** Fifty to one hundred loans is well under the documented **maximum of 1000 loans per page**. One `POST /encompass/v3/loanPipeline` with `start=0` and `limit` around 100–1000 is the intended pattern.

Source: [V3 Loan Pipeline (with Pagination)](https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline-with-pagination-1) — “A maximum of 1000 loans are returned per page.”

ICE also tells you to:

- Limit folders via `loanFolders` (24.1+). Source: [Pipeline Calls best practices](https://developer.icemortgagetechnology.com/developer-connect/docs/pipeline-calls-bp), [24.1 changelog](https://developer.icemortgagetechnology.com/developer-connect/changelog/241-major-release)
- Limit fields (server may override `limit` based on loan count × fields). Same V3 page.
- Avoid sort if not needed; admin persona is faster. Source: [Pipeline Calls best practices](https://developer.icemortgagetechnology.com/developer-connect/docs/pipeline-calls-bp)
- Optionally `calculateTotalCount=NoWait` to skip `X-Total-Count`. Source: same best-practices page.

**What is not established:** a published SLA that this call returns in &lt;2 seconds. **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION.**

**INTERNAL ARCHITECTURE RECOMMENDATION:** Treat Pipeline as the **hydration / reconciliation** path into Redis, not as the hot path for every dashboard click. Serve the 2-second grid from Redis. See [dashboard-architecture.md](11-dashboard/dashboard-architecture.md).

---

## 3. What is the correct filter for HLA / loan associate?

### Official facts

1. Encompass **does not document a product named “Home Lending Advisor.”** The four **fixed role names** are: **Loan Officer, Loan Processor, Loan Closer, Underwriter**. Custom roles can be mapped to a fixed role. **LENDER CONFIGURABLE.**  
   Source: [V1 Get List of Associates](https://developer.icemortgagetechnology.com/developer-connect/reference/get-associates)

2. Associates are assigned **loan-by-loan**. A user can be LO on one loan and processor on another. Same source.

3. `GET /encompass/v1/loans/{id}/associates` can filter that **one loan** by `userId` or `roleId`. It is **not** a “list all loans for user X” API. Same source.

4. V3 Pipeline supports `loanOwnership`: `AllLoans` (default) or `MyLoans`. Source: [V3 Loan Pipeline (with Pagination)](https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline-with-pagination-1). `MyLoans` only helps if the **access token is the HLA**. A manager token typically needs `AllLoans` plus a field filter.

5. V1 Pipeline docs: “to return only the loans in My Pipeline, filter by canonical name or user ID.” Source: [V1 Loan Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline). The page **does not name** the user-ID canonical field.

6. ICE’s **only** published way to know filterable names is Get Canonical Names. Pipeline `canonicalName` maps to V1 `criterionFieldName` / V3 `canonicalName`. Source: [V1 Get Pipeline Canonical Names](https://developer.icemortgagetechnology.com/developer-connect/reference/v1-get-canonical-fields)

### What we will not invent

Official pipeline examples use `Loan.LoanFolder`, `Loan.LastModified`, `Loan.LoanNumber`, `Loan.LoanRate`, `Loan.BorrowerName`, `Fields.4000`, `Fields.4002`, `Fields.2608`, `Loan.CreditScore`, `Loan.DateofFinalAction`. **None of those is Loan Officer.**

Strings such as `Loan.LoanOfficerName`, `Loan.LoanOfficerID`, `Fields.317`, `Fields.1612` appear in **third-party** field lists. They are **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as Pipeline canonical names.

### Required instance step

```http
GET /encompass/v3/loanPipeline/canonicalFields
Authorization: Bearer {token}
```

Search the response `description` / `canonicalName` / `fieldId` for Loan Officer (and any custom HLA role). Use **that** `canonicalName` in the Pipeline filter. If the field is not in the RDB, it cannot be queried until it is added. **LENDER CONFIGURABLE.**

Virtual field types include `LoanAssociate`. Source: [22.1 Major Release](https://developer.icemortgagetechnology.com/developer-connect/changelog/221-major-release) / [Get Virtual Fields](https://developer.icemortgagetechnology.com/developer-connect/reference/get-virtual-fields). Whether a Loan Associate virtual field is **pipeline-filterable** is **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION**.

### Example request shape (canonical name is a placeholder)

```http
POST /encompass/v3/loanPipeline?start=0&limit=100
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "loanFolders": ["My Pipeline"],
  "loanOwnership": "AllLoans",
  "fields": [
    "Loan.GUID",
    "Loan.LoanNumber",
    "Loan.BorrowerName",
    "Loan.LoanAmount",
    "Loan.LastModified"
  ],
  "filter": {
    "canonicalName": "<criterionFieldName from Get Canonical Names>",
    "value": "<HLA Encompass userId>",
    "matchType": "exact"
  }
}
```

The `canonicalName` value **must** be copied from Get Canonical Names. Do not ship `Fields.317` without verifying it on the instance.

Official V3 example **response** shape (fields from ICE live sample, not HLA-specific):

```json
[
  {
    "loanId": "b9e4651c-a326-4288-884d-224f862a77e9",
    "fields": {
      "Loan.LoanFolder": "My Pipeline",
      "Loan.LoanNumber": "",
      "Loan.LoanRate": "8.25000",
      "Loan.LoanAmount": "57000.0000",
      "Fields.4002": "Example",
      "Loan.LastModified": "5/4/2021 3:24:50 AM",
      "Loan.BorrowerName": "Example, FHA Fixed"
    }
  }
]
```

Source of sample shape: [V1 paginated pipeline live sample](https://developer.icemortgagetechnology.com/developer-connect/reference/post-encompass-v1-loanpipeline) / V3 uses `loanId` instead of `loanGuid`.

---

## 4. Which APIs should populate Redis?

**INTERNAL ARCHITECTURE RECOMMENDATION**, using ICE-supported read APIs:

| Redis projection | Populate from |
| ---------------- | ------------- |
| HLA directory | `GET /encompass/v3/users` (org-scoped) |
| HLA → loan index + grid columns | `POST /encompass/v3/loanPipeline` (small field list) |
| Per-loan current milestone title/id | Pipeline field **if** present in canonical list, else `GET .../milestones` on webhook |
| Per-loan lock info | Pipeline `include=LockInfo` (V3) |
| Counts (conditions/tasks/docs) | Webhook-driven increments + periodic Pipeline/list APIs |

ICE: “Cache frequently used data rather than fetching it repeatedly.” Source: [Concurrency Limits](https://developer.icemortgagetechnology.com/developer-connect/docs/concurrency-limits).

Do **not** store full `view=full` loan JSON as the default Redis object. 6 MB response cap and 40 MB loan-file cap make that a trap. Source: [Response payload size limit](https://developer.icemortgagetechnology.com/developer-connect/docs/response-payload-size-limit), changelog loan-size notes.

---

## 5. Which APIs should populate historical storage?

Not Redis. A durable store (Postgres / S3 / OpenSearch — **INTERNAL ARCHITECTURE RECOMMENDATION**):

| Need | Encompass source |
| ---- | ---------------- |
| Field value history | `POST /encompass/v3/loans/{loanId}/auditTrail` — Source: [Pull Field Audit Data](https://developer.icemortgagetechnology.com/developer-connect/reference/pull-field-audit-data) |
| Milestone / lock / HTML email history | `GET /encompass/v3/loans/{loanId}?view=logs` (system logs). Source: [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Condition tracking entries | `GET/PATCH .../conditions/{id}/tracking` (enhanced). Source: [Manage Tracking Entries](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-tracking-entries) |
| Conversation / comments | Conversation Logs + entity comments APIs |
| Timeline / MTT / aging | **Derived**: webhook `eventTime` + stored previous state. ICE does not publish MTT formulas. **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as a native metric API. |

Append webhook envelopes (`eventId`, `eventTime`, payload) for replay. ICE: `eventId` “ensures events are only digested once.” Source: [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook).

---

## 6. Which APIs should NOT be called for every dashboard request?

Do **not** on each manager grid render:

- `GET /encompass/v3/loans/{loanId}?view=full`
- Per-loan associates, milestones, conditions, documents, tasks in a loop (N+1)
- Attachment download URLs
- Document order / delivery
- Field schema / loan schema
- Batch update
- Pipeline **report** endpoint (`/loanPipeline/report`) — “only for report generation,” not real-time UI. Source: [V3 Loan Pipeline for Reports](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-create-cursor)

Default concurrency hard stop: **30 in-flight calls per lender environment**. Source: [Concurrency Limits](https://developer.icemortgagetechnology.com/developer-connect/docs/concurrency-limits). Looping Get Loan for 300 HLA loans would exhaust it.

---

## 7. What should be event-driven?

Subscribe (after enablement where required):

| Resource / event | Dashboard effect |
| ---------------- | ---------------- |
| Loan `create` / `update` / `move` / `delete` | Add/remove/move projection |
| Loan `milestone` (`updateMilestones`, `finishMilestones`) | Milestone + aging |
| Loan `condition` (enhanced subevents) | Condition counts / aging |
| Loan `document` / `attachment` | Document activity |
| Loan `change` / `fieldchange` / `enhancedfieldchange` | Targeted field refresh (EFC already includes changed data — concurrency guide) |
| Loan `lock` / `unlock` | Lock column (not guaranteed real-time; still retry) |
| Workflow Task / Subtask / TaskComment | Task counts / aging |
| DocumentDelivery / DocumentOrder | Disclosure/delivery status |
| InternalUsers | HLA roster |

Sources: [Loan webhook catalog](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan), [Workflow Tasks catalog](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks), [Concurrency Limits](https://developer.icemortgagetechnology.com/developer-connect/docs/concurrency-limits).

Enhanced Conditions **template/type** webhooks require a **support ticket** plus subscription. Source: [Enhanced Conditions webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions).

`enhancedfieldchange` enablement is a support-ticket + subscription flow. Source: [How to enable EFC](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-how-to-enable).

---

## 8. What should be periodically reconciled?

Pipeline reads the **Reporting Database**, updated **asynchronously**. Saves may not appear immediately. Cursor results are a **snapshot at cursor creation**. Source: [Loan Pipeline overview](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-pipeline).

ICE does **not** publish RDB lag SLA. **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION.**

**INTERNAL ARCHITECTURE RECOMMENDATION:**

- Nightly or hourly: Pipeline sweep per HLA (or `loanFolders`) vs Redis index.
- On webhook gap / 5xx from ICE: rebuild that loan from Get Loan + list APIs.
- Compare `X-Total-Count` (or summed page lengths) to Redis cardinality.

Subscriptions older than 30 days, noisy, or failing can be **auto-deleted** by ICE. Reconcile subscription inventory. Source: [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook).

---

## 9. What data belongs in Redis?

Current-state only:

- HLA list (id, name, org)
- Loan IDs per HLA
- Grid fields: loan number, borrower display name, amount, milestone, lock, last modified, folder
- Aggregates: loan count, overdue flags **computed** from dates we stored
- Short TTL metadata: `projectionVersion`, `lastReconcileAt`

See [cache-strategy.md](11-dashboard/cache-strategy.md).

---

## 10. What data belongs outside Redis?

- Webhook raw payloads and `eventId` idempotency log
- Audit trail / conversation / comment history
- Attachment bytes (never cache files in Redis as SoR)
- Schema / canonical field catalogs (config service or S3, refresh on release)
- MTT / cycle-time time series

---

## 11. Biggest Encompass API performance traps

1. **N+1 Get Loan** instead of Pipeline. ICE says use Pipeline. Source: [Concurrency Limits](https://developer.icemortgagetechnology.com/developer-connect/docs/concurrency-limits)
2. **Hitting 30 concurrent calls** → 429 for **everyone** on the instance. Same source.
3. **`view=full`** on every open. Source: [About Loan Views](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
4. **Too many Pipeline fields** → server shrinks `limit`. Source: V3 Pipeline usage notes
5. **Sorting** when not needed. Source: [Pipeline Calls BP](https://developer.icemortgagetechnology.com/developer-connect/docs/pipeline-calls-bp)
6. **Ignoring `loanFolders`**. Source: 24.1 changelog + BP
7. **Polling** instead of webhooks. Source: concurrency guide
8. **Cursor idle 5 minutes**; 10 cursor cap; 409 if exceeded (24.3). Sources: [Create Cursor](https://developer.icemortgagetechnology.com/developer-connect/reference/create-cursor), [24.3 release](https://developer.icemortgagetechnology.com/developer-connect/changelog/243-major-release)
9. **6 MB response** hard limit. Source: [Response payload size](https://developer.icemortgagetechnology.com/developer-connect/docs/response-payload-size-limit)
10. **Non-admin Pipeline** is slower. Source: Pipeline considerations (admin persona)

---

## 12. Biggest stale-data risks

1. RDB lag on Pipeline vs live loan file. Source: Pipeline RDB note.
2. Cursor snapshot while webhooks continue. Source: same.
3. `includeArchivedLoans` default false; 26.2 briefly inverted default then fixed. **VERSION DEPENDENT.** Source: changelog EDC-1312.
4. Webhooks “not guaranteed real-time” (especially lock/unlock). Source: [Loan webhook catalog](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
5. Batch Update may **delay/coalesce** webhooks; skips calcs and rules. Source: [Batch Update](https://developer.icemortgagetechnology.com/developer-connect/reference/batch-update)
6. Logs missing unless `view=logs`/`full` (24.2). **VERSION DEPENDENT.** Source: [24.2 changelog](https://developer.icemortgagetechnology.com/developer-connect/changelog/242-major-release)
7. Subscription auto-delete. Source: Webhook overview.

---

## 13. What APIs should product engineers learn first?

1. Authentication (password grant for lenders). Source: [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication)
2. V3 Pipeline + Canonical Names
3. Loan views (`entity` / `logs` / `full` / `id`)
4. Associates + milestones (HLA vs LO)
5. Webhook subscriptions + Loan events
6. Concurrency headers

---

## 14. What APIs should they learn later?

- Enhanced vs standard conditions (instance flag)
- Workflow Task Service (`/workflow/v1`)
- eFolder V3 + attachment URLs (V1 attachments sunset **26.3**)
- Document order / delivery / disclosure tracking 2015
- ICE PPE, EPC, DDA, Trades, ECS
- SCIM user provisioning
- Pipeline View APIs (**Preview**, not production). Source: [API Previews](https://developer.icemortgagetechnology.com/developer-connect/reference/api-previews)

---

## 15. Non-obvious API relationships

- Pipeline **≠** live loan store; it is RDB.
- **Document** is a folder-like tracker; **Attachment** is a file; **Condition** references documents; **Document Order** generates packages; **Document Delivery** tracks fulfillment; **Disclosure Tracking** is created when LE/CD packages send. See [documents.md](05-documents/documents.md).
- `loanOwnership=MyLoans` is token-scoped, not a manager HLA filter.
- Associates API cannot replace Pipeline for “all loans for HLA.”
- Task Pipeline returns **incomplete tasks for the user/user groups**, not all tasks on a loan. Source: [Get Task Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/get-task-pipeline)
- V3 `/workflow/v1` is a **different path prefix** than `/encompass/v3`.
- Webhooks live under `/webhook/v1`.
- Fixed collections never truly delete; they empty. Source: Loan Management four entity types.
- Enhanced Conditions and Standard Conditions are **mutually selected per loan** via `ENHANCEDCOND.X1`.

---

## 16. Assumptions the team should avoid

1. “`limit=10000` returns all loans.” False. V3 max **1000/page**; server may lower it.
2. “Pipeline is real-time.” It is RDB-async; report endpoint is a snapshot; V3 `/loanPipeline` is the “real time pipeline results” *relative to report*, still RDB. Source: Reports page vs Pipeline RDB note.
3. “Fields.317 is official.” Not in ICE pipeline examples. Discover it.
4. “HLA is an Encompass object.” It is a lender title for a **role assignment**.
5. “Redis can be the history store.” Product requirement forbids it; ICE audit APIs exist for history.
6. “Webhooks are ordered and instant.” Docs say otherwise for real-time guarantee; retry policy details **NOT ESTABLISHED**.
7. “Get Loan without `view` returns everything.” Create/update with no view → **204**. Get Loan views documented separately. Source: Loan Management.
8. “V1 is deprecated globally.” V1 vs V3: use V3 when available; no blanket sunset. Source: [V1 vs V3](https://developer.icemortgagetechnology.com/developer-connect/docs/v1-vs-v3-encompass-apis-whats-the-difference-1)
9. “One cursor pool for everything.” As of 24.3, Pipeline cursors are **separate** from Contacts. Source: [24.3](https://developer.icemortgagetechnology.com/developer-connect/changelog/243-major-release)
10. “Calling as the manager sees all HLA loans.” Persona and loan-access rules still apply. **LENDER CONFIGURABLE.**
