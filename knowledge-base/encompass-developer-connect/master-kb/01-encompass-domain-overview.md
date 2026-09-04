# 01 — Encompass domain overview

**Related:** [02 Loan](./02-loan-domain.md) · [05 Enhanced conditions](./05-conditions-enhanced.md) · [07 Tasks](./07-workflow-tasks.md) · [08 Milestones](./08-milestones-and-associates.md)

Portal: [Developer Connect](https://developer.icemortgagetechnology.com/developer-connect)

---

## A. Business meaning

Encompass is not a generic borrower database. It is a **configurable mortgage origination workflow and document platform centered on a loan**.

A bank uses it to:

- capture application data
- move work through processing, underwriting, closing, funding
- collect evidence (documents/files)
- satisfy requirements (conditions)
- generate and track disclosures
- record who did what, and when

## B. Real mortgage example (illustrative)

John Smith is buying a $500,000 house with a $400,000 conventional 30-year fixed loan.

- **Mike** originates the file.
- **Sarah** processes it (orders appraisal from XYZ, title from ABC).
- **Robert** underwrites it and issues conditions (paystubs, large-deposit explanation).
- **Lisa** coordinates closing and disclosures.

None of those people *are* the loan. They are assigned to **roles on this loan**. The loan is the root object.

## C. Domain model

```text
CUSTOMER
   |
   v
 LOAN
   |
   +-------------------+-------------------+
   |                   |                   |
  DATA              WORKFLOW            PEOPLE
   |                   |                   |
Borrower           Milestones          Associates
Property           Conditions          Roles
Employment         Tasks               Users
Income             Subtasks            Groups
Assets             Schedulers          Contacts
Liabilities
   |
   v
DOCUMENTS
   |
   +-------------+
   |             |
 eFolder    Document Order
   |             |
Attachments   Delivery
   |
   v
CONDITIONS
   |
   v
DISCLOSURES
   |
   v
DISCLOSURE TRACKING
```

Around all of this (do not collapse these into one “notes” bucket):

- field changes
- system logs / editable logs
- conversation logs
- object comments (condition, task, subtask, milestone, document)
- webhooks/events
- audit/history
- users / roles / personas
- business rules and templates
- configuration

External/service domains (separate catalogs): **EPC**, **DDA**, **Trades**, **Organizations & Users**, **Schedulers**. See [14](./14-epc-dda-trades-schedulers.md).

## The four core objects

| Object | Business question | Never confuse with |
|--------|-------------------|--------------------|
| **Loan** | What is the mortgage transaction and its data? | A borrower record, a document |
| **Milestone** | Where is the loan in the lifecycle? | A task, a condition |
| **Workflow Task** | What work needs to be done, by whom, by when? | A milestone task (legacy), a condition |
| **Condition** | What requirement must be satisfied, with what evidence? | A document, an attachment, a task |

**Documented ICE language (conditions):** a condition is an eFolder entry used to track a loan condition through the pipeline; multiple documents can be assigned to a condition; a document can be assigned to more than one condition. Source: [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions).

**Documented ICE language (milestones):** a milestone is a step in the workflow that defines loan activities and the role that carries them out; when finished, work begins on the next milestone. Administrators can configure names/behavior and create custom milestones. Source: [Loan Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones).

**Documented ICE language (workflow tasks):** Task Instance Management APIs create/manage tasks, sub-tasks, comments, and a pipeline of work assigned to a user or user group(s). Source: [Get All Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks).

**Documented ICE language (loan):** the loan ID is a 32-digit unique identifier that does not change for the life of the loan. V3 loan schema is a **different contract** from V1. Source: [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management).

## What is lender-configurable vs platform invariant

| Typically configurable (do not hardcode) | Platform invariants (as documented) |
|------------------------------------------|-------------------------------------|
| Milestone names, templates, expected days | Loan GUID (`loanId`) identity |
| Condition types, statuses, templates, sets, prior-to lists | Standard vs Enhanced selected per loan via `ENHANCEDCOND.X1` / `loan.useEnhancedConditionIndicator` |
| Roles, personas, user groups, who may hold which role | Webhook notification is a POST JSON callback, not current truth |
| Document types, stacking, delivery portals | Document ≠ attachment |
| Task templates, assignment rules | V1 loan contract ≠ V3 loan contract |

ICE documents thirteen predefined milestones (Started, Qualification, Processing, Submittal, Cond. Approval, Resubmittal, Approval, Doc Preparation, Docs Signing, Funding, Post Closing, Shipping, Completion) **and** that administrators can rename, reconfigure, and add custom milestones. **Never hardcode that list as the lender’s workflow.**

## D–F. API / request / response

There is no single “get the domain model” API. Start with:

```http
GET /encompass/v3/loans/{loanId}?view=entity
Authorization: Bearer {accessToken}
```

**Documented:** `GET /encompass/v3/loans/{loanId}` returns the loan or specific entities. If the caller lacks permission to a field, that field is not returned. Source: [V3 Get Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1).

Hosts **documented:** production `https://api.elliemae.com`, UAT `https://concept.api.elliemae.com`.

## G. Field table (identifiers you will join on)

| Field | Meaning | Business significance | Read/Write | Configurable? | Example |
|-------|---------|----------------------|------------|---------------|---------|
| `loanId` | 32-digit loan GUID | Join key for every downstream table | Assigned at create | No | Illustrative: `a07c3604-555d-4553-9de7-5b3e87b6bce0` |
| Condition `id` | Unique condition identifier | Track a requirement across comments, tracking, documents | Assigned at create | No | Documented as GUID-like unique id |
| Task `id` | Unique task identifier | Work item | Assigned at create | No | Documented on Task APIs |
| Document id | eFolder document identifier | Evidence record | Assigned at create | Type/title often configured | See [09](./09-documents-efolder-attachments.md) |
| Attachment id | File identifier | The actual file | Assigned at upload | No | Webhook sample uses names like `EBSP23444.pdf` — treat as sample, not a format rule |

## H. Lifecycle (illustrative loan path)

See [18](./18-real-loan-end-to-end-case-study.md). Processing → Submittal → Conditional Approval → Resubmittal → Approval is **not** always a straight line. Conditions cause rework. ICE does **not** document “Rejected” as a universal milestone name.

## I. Events

Webhook catalog **documented** resources include Loan, Document Delivery, Document Order, Enhanced Conditions, Organizations & Users, EPC, Schedulers, Trades, Workflow Tasks, DDA (limited availability). Source: [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook).

**Principle (documented in ICE lock/unlock notes and generally true of this platform):** webhook notifications are **not guaranteed real-time**; delays and intervening changes exist. Webhook ≠ current truth.

## J. Integration architecture

Bank services should treat Encompass as:

1. **System of origination record** for loan data, workflow, and documents
2. **Event source** via webhooks
3. **Query source** via resource GETs after events

See [15](./15-production-integration-architecture.md).

## K. Production concerns

- Do not default `view=full`.
- Do not mix V1 and V3 loan JSON.
- Check `useEnhancedConditionIndicator` before choosing condition APIs.
- Persist `eventId` for idempotency (documented as unique identifier ensuring events are digested once). Source: [Default payload attributes](https://developer.icemortgagetechnology.com/developer-connect/reference/default-payload-attributes).

## L. Common mistakes

1. Treating Encompass as a CRUD database of borrowers.
2. Using `full` on every GET.
3. Assuming one user = one role.
4. Treating a condition as a document or a boolean.
5. Assuming webhook payloads are current loan state.
6. Hardcoding ICE’s out-of-the-box milestone names as the bank’s process.
7. Inventing a single “get all comments” API.

## M. Interview / architecture questions

1. Why is the loan the aggregate root rather than the customer?
2. How do you decide between `entity`, `log`, `full`, and `id`?
3. How do you know whether to call Standard or Enhanced Condition APIs?
4. What is the difference between a milestone, a workflow task, and a condition on John Smith’s file?
5. Why must a bank integration be idempotent even if ICE emits an `eventId`?

Auth (documented at high level): OAuth 2.0 bearer tokens; API fundamentals describe scope `lp` (Lending Platform) for some flows. Confirm current grant types on [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication).
