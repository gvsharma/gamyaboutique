# 03 — Loan schema, fields, collections, and EFC

**Related:** [02 Loan domain](./02-loan-domain.md) · [13 Webhooks](./13-webhooks-events.md)

**Official:** [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) · [Get Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1) · [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) · [EFC features and usage notes](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes)

---

## A. Business meaning

The V3 loan object is a **typed graph**: applications (borrower pairs), applicants, property, repeating verification collections, custom fields, and logs.

Field IDs (classic Encompass, e.g. `ENHANCEDCOND.X1`) and JSON paths (e.g. `loan.useEnhancedConditionIndicator`) are two addressing systems. **Do not assume V1 field IDs map 1:1 to V3 paths.**

## B. John Smith example (illustrative mapping)

You will store downstream:

- borrower name, SSN, income, assets
- subject property address and appraised value
- loan amount, product, occupancy
- custom bank fields if the lender defined them

Exact paths come from **Get Loan Schema** for that instance/version — not from this file.

## C. Domain model — variable collection locations (documented)

1. Directly under the loan: `/encompass/v3/loans/{loanId}/{entityName}`
2. Under a borrower pair / application: `/encompass/v3/loans/{loanId}/applications/{applicationId}/{entityName}`
3. Under an applicant in an application: `/encompass/v3/loans/{loanId}/applications/{applicationId}/{applicantType}/{entityName}`

**Documented examples** of variable collections: VoDs, VoLs, VoEs.

**Illustrative JSON shape based on documented nesting** (entity names must be confirmed in schema):

```json
{
  "id": "{loanId}",
  "applications": [
    {
      "id": "{applicationId}",
      "borrower": { "firstName": "John", "lastName": "Smith" },
      "coborrower": {}
    }
  ]
}
```

Do not treat `firstName` as verified unless your schema export shows it.

## D–F. Schema API

Use [Get Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1) as the contract for create/update.

Reader/Writer APIs (if present in the current portal for your version): use them to reason about read vs write semantics **only after opening the current page**. Field-level R/W in this file would be invention.

Empty fields: Loan Management notes some empty fields can be retrieved with `includeEmpty=true`. Confirm on the current Get Loan page before relying on it.

## G. Field-change mechanisms (documented)

| Event | What ICE says | Bank use |
|-------|----------------|----------|
| `change` | Specified attributes in a loan file are updated; filters on subscribe | Narrow attribute watch |
| `fieldchange` | Change on a specified field via `filters.attributes`; subject field need **not** be in Audit Trail Database; payload includes subject field **plus other fields updated as a result** | Field-level trigger with fan-out |
| `enhancedfieldchange` | Loan created or a change occurs; payload includes **previous** and **new** values; virtual fields require field IDs in the **Reporting Database**; field need not be in Audit Trail; **if subscribed, webhooks occur on all loan field change events**; read the EFC setup guide first | Audit/delta analytics — high volume |

There is **no documented fixed maximum** number of field changes per loan or per event. Do not invent one.

Official EFC sample (adapted; contains PII-shaped values in ICE’s own example) shows `payload.event.fieldChangeEvents[]` with `modifiedField`, `parentFieldId`, `encompass.previousValue` / `newValue`, and `v3LoanModel.previousValue` / `newValue`. Source: [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan).

Chunking / payload size limits: **NOT ESTABLISHED** in the pages reviewed for this KB. Read the [EFC user/setup guide](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes) before production subscribe.

## H. Lifecycle of a field change

```text
User/API/business rule updates loan
        |
        v
Encompass persists new current state
        |
        +-- optional fieldchange / EFC / change notifications
        |
        v
Bank validates eventId, stores raw payload, queues
        |
        v
If projection must be correct: GET current loan entity
```

Actor: `meta.userId` on the webhook (documented). Event time: `eventTime` ISO-8601 (documented).

## I. When to GET after EFC

GET current loan when:

- you apply balances, income, or other values that drive credit decisions
- multiple EFC notifications may arrive out of order
- the payload is partial relative to your projection
- PII handling requires you not to persist the raw newValue

You may skip GET only for non-authoritative analytics **if** the bank accepts eventual consistency. That is a bank policy choice, not an ICE guarantee.

## J. Integration architecture

See [15](./15-production-integration-architecture.md). Subscribe with filters for `change`/`fieldchange`. For EFC, assume **all** field changes (as documented) and design for volume, PII, and idempotency on `eventId`.

## K. Production concerns

- **PII:** official sample includes SSN-like `newValue`. Encrypt raw store; redact logs.
- **Idempotency:** `eventId` “ensures events are only digested once” — still implement your own dedupe table.
- **Custom fields:** lender-defined; do not freeze a closed list unless subscription filters are explicit.
- **Delayed delivery:** documented for lock events; treat as general webhook property.
- **Rate limits:** **NOT ESTABLISHED** in the pages cited here. Confirm current API fundamentals / throttling docs.

## L. Common mistakes

1. Hardcoding field IDs from a different Encompass version.
2. Mixing V1 field IDs into V3 JSON bodies.
3. Subscribing to EFC without reading the setup guide or sizing the pipeline.
4. Using EFC previous/new as the system of record.
5. Assuming a maximum of N field changes.

## M. Questions

1. Why can one user save produce many `fieldChangeEvents`?
2. What is the difference between Audit Trail Database and Reporting Database for EFC virtual fields?
3. How do you map `modifiedField` to a V3 JSON path?
4. When is `includeEmpty` required?
