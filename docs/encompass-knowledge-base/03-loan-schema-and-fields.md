# 03 — Loan Schema and Fields

> **Primary source:** [Schemas](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-schema) · [V3 Get Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1) · [V3 Get Field Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-field-schema-1)  
> **Related:** [02-loan-domain.md](./02-loan-domain.md) · [01-encompass-domain-overview.md](./01-encompass-domain-overview.md)

---

## A. Purpose

The V3 Loan Schema defines the **data contract** for Create, Get, and Update Loan operations. Field IDs (Encompass legacy identifiers), JSON paths, and contract paths bridge between Smart Client field references and V3 REST payloads. This document explains how to navigate the schema, resolve fields, and understand applications/borrower entities.

---

## B. Schema APIs

| API | Endpoint | Purpose |
|-----|----------|---------|
| **V3 Get Loan Schema** | `GET /encompass/v3/schemas/loan` | Full JSON schema for loans |
| **V3 Get Field Schema** | `GET /encompass/v3/schemas/loan/standardFields` | Standard field definitions with `fieldId`, `jsonPath`, `contractPath` |
| **V3 Get Custom Fields** | Custom fields settings API | Custom field metadata including `jsonPath` |

Per [Schemas](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-schema):

> A schema specifies the entities and data elements in a loan resource. You can retrieve all schema information from a loan or a certain set specified by field ID.

### V3 Get Field Schema — query parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `ids` | No | Comma-separated field IDs (e.g., `4000,2,3`) |
| `start` | Yes | Zero-based starting index |
| `limit` | Yes | Max items per page; bounded by response payload size limit |

Response header **`X-Total-Count`** indicates total records available.

### Usage notes (documented)

- Multi-instance fields can be queried with any index (e.g., `BE0002`, `BE0102`, `BE0202`)
- The **`jsonPath`** attribute locates fields in Get/Create/Update Loan responses
- Date/datetime formats: `yyyy-MM-ddTHH:mm:ssZ` (datetime), `yyyy-MM-dd` (date)

---

## C. Field ID → JSON path → contract path

Per [Create a Baseline Data Dictionary using Schema APIs](https://developer.icemortgagetechnology.com/developer-connect/docs/create-a-baseline-data-dictionary-using-schema-apis):

| Attribute | Description |
|-----------|-------------|
| `id` | Encompass field ID mapped to the field |
| `description` | Human-readable field description |
| `format` | Data format (STRING, YN, DECIMAL_2, DATE, DATETIME, etc.) |
| `contractPath` | Contract path, e.g. `loan.baseLoanAmount` |
| `jsonPath` | JSON path in loan object, e.g. `$.baseLoanAmount` |
| `entitiesFilterKey` | Entity filter for nested fields |
| `multiInstance` | Whether field is repeatable within entity |
| `readOnly` / `fieldLock` | Edit constraints |

### John Smith loan — documented field examples

| Field ID | Description | contractPath | jsonPath |
|----------|-------------|--------------|----------|
| `2` | Trans Details Total Loan Amt | `loan.baseLoanAmount` | `$.baseLoanAmount` |
| `3` | Trans Details Interest Rate | `loan.requestedInterestRatePercent` | `$.requestedInterestRatePercent` |
| `4` | Trans Details Term (Mos) | `loan.loanAmortizationTermMonths` | `$.loanAmortizationTermMonths` |
| `4000` | Borrower First Name (per Field Schema docs) | documentation does not establish exact path in this KB — resolve via Field Schema `ids=4000` | resolve via Field Schema |
| `ENHANCEDCOND.X1` | Enhanced condition indicator | `loan.useEnhancedConditionIndicator` | `$.useEnhancedConditionIndicator` |

> For Borrower First Name, the Field Schema documentation states field ID **4000** is the example for "Borrower First Name". Resolve the exact `jsonPath` at runtime via `GET /encompass/v3/schemas/loan/standardFields?ids=4000&start=0&limit=1`.

### Custom fields

Per [Update Data Dictionary](https://developer.icemortgagetechnology.com/developer-connect/docs/update-data-dictionary-with-changes-to-the-encompass-loan-schema):

```json
{
  "id": "CUST01FV",
  "contractPath": "loan.customFields[(fieldName == 'CUST01FV')].value",
  "jsonPath": "$.customFields[?(@.fieldName == 'CUST01FV')].value"
}
```

Custom fields live in the **fixed collection** `customFields[]`.

---

## D. Applications and borrower entities

The V3 loan contract nests borrower data under **`applications[]`**:

```
loan
 └── applications[]
       ├── id / legacyId / borrowerPairId
       ├── borrower { firstName, lastName, ... }
       ├── coborrower { ... }
       └── (variable collections per applicant via separate endpoints)
```

Per [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management), variable collections under an applicant follow:

```
/encompass/v3/loans/{loanId}/applications/{applicationId}/{applicantType}/{entityName}
```

Where `applicantType` is borrower or coborrower (documentation does not establish the exact enum string values in this overview — resolve from loan schema).

### Application reference pattern (Enhanced Conditions)

Enhanced conditions reference applications via `ApplicationReferenceContract`:

```json
{
  "application": {
    "entityId": "f664944b-34d8-4ca6-943b-06dc9bdccf84",
    "entityType": "Application",
    "entityName": "All",
    "legacyId": "All"
  }
}
```

`entityId: "All"` applies the condition to all borrower pairs (per Enhanced Conditions live data sample).

---

## E. Entity types in the schema

The loan schema organizes data into the four types documented in [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management). See [02-loan-domain.md](./02-loan-domain.md) for full taxonomy.

| Type | Schema behavior |
|------|-----------------|
| Fixed collections | Pre-sized arrays; items always present (may be empty) |
| Variable collections | Dynamic arrays; items added/removed/reordered |
| Editable logs | No field IDs; managed as log entities |
| System logs | Read-only; returned with `view=logs\|full` |

---

## F. Fixed collection — JSON example

> Illustrative payload based on documented contract.

`customFields` is a documented **fixed collection** example. Items cannot be deleted — only emptied.

```json
{
  "customFields": [
    {
      "fieldName": "CUST01FV",
      "value": "VIP"
    },
    {
      "fieldName": "CUST02FV",
      "value": null
    }
  ]
}
```

**Behavioral rules (documented):**
- Slots exist at loan creation even if empty
- Retrieve empty slots with `includeEmpty=true` on GET
- "Deleting" means setting all non-id fields to null/blank/zero
- IDs derived from field combination and/or index — not reorderable

`fileContacts` and `fixedAssets` follow the same fixed-collection rules.

---

## G. Variable collection — JSON example

> Illustrative payload based on documented contract.

`vods` (Verification of Deposits) is a documented **variable collection** example.

```json
{
  "applications": [
    {
      "id": "app-guid-001",
      "borrower": {
        "firstName": "John",
        "lastName": "Smith",
        "vods": [
          {
            "id": "vod-guid-001",
            "holderName": "Chase Bank",
            "total": 50000
          },
          {
            "id": "vod-guid-002",
            "holderName": "Wells Fargo",
            "total": 25000
          }
        ]
      }
    }
  ]
}
```

**Behavioral rules (documented):**
- Empty at loan creation
- Items can be added (POST loan), updated (PATCH loan), removed, reordered
- IDs are auto-generated GUIDs
- Separate entity endpoints available incrementally: `/encompass/v3/loans/{loanId}/applications/{applicationId}/borrower/vods` (pattern documented; exact entity names per schema)

---

## H. Editable log — JSON example

> Illustrative payload based on documented contract.

`conversationLogs` is a documented **editable log** example.

```json
{
  "conversationLogs": [
    {
      "id": "conv-log-guid-001",
      "addedBy": "sarah.processor",
      "addedDate": "2026-08-01T14:30:00Z",
      "comments": "Called John Smith to request paystubs."
    }
  ]
}
```

**Behavioral rules:**
- No Encompass field IDs on log items
- Returned with `view=log` or `view=full`
- Separate log management endpoints provided incrementally

---

## I. System log — JSON example

> Illustrative payload based on documented contract.

`milestoneLogs` (Milestone History Log) is a documented **system log** example.

```json
{
  "milestoneLogs": [
    {
      "id": "ms-log-guid-001",
      "milestoneName": "Processing",
      "startDate": "2026-07-15T08:00:00Z",
      "doneIndicator": true
    }
  ]
}
```

**Behavioral rules:**
- Cannot be edited by any user
- Returned with `view=log` or `view=full`

---

## J. Building a data dictionary workflow

Per official schema documentation guides:

1. **Baseline:** `GET /encompass/v3/schemas/loan` → full loan JSON schema for your environment
2. **Enrich standard fields:** `GET /encompass/v3/schemas/loan/standardFields?ids=<fieldId>&start=0&limit=N`
3. **Enrich custom fields:** V3 Get Custom Fields API
4. **Track changes:** Compare schema across Encompass releases; use delta files or diff schemas
5. **Parse loan responses:** Use `jsonPath` as unique identifier to extract values from `GET /encompass/v3/loans/{loanId}`

---

## K. John Smith — resolving fields for a $400K conventional loan

```http
GET /encompass/v3/schemas/loan/standardFields?ids=2,3,4&start=0&limit=10
Authorization: Bearer <token>
```

Expected mappings (from documented live sample):

| Business need | Field ID | jsonPath |
|---------------|----------|----------|
| Loan amount $400,000 | `2` | `$.baseLoanAmount` |
| Interest rate | `3` | `$.requestedInterestRatePercent` |
| Term 360 months | `4` | `$.loanAmortizationTermMonths` |

```http
GET /encompass/v3/loans/{loanId}?view=entity
```

Extract values using resolved `jsonPath` expressions.

---

## L. Production concerns

| Concern | Guidance |
|---------|----------|
| **Schema drift** | Loan schema updates every major Encompass release — automate dictionary refresh |
| **Environment differences** | Custom fields differ per instance; baseline schema is environment-specific |
| **Payload size** | Full loan schema response is very large; filter by `entities` when supported |
| **Field Schema pagination** | Use `start`/`limit` with `X-Total-Count`; respect payload size limits |
| **Multi-instance fields** | Index matters (e.g., `36#2` in EFC events = borrower pair index) |
| **YN vs boolean** | Encompass may store Y/N while V3 model uses true/false — EFC payload shows both |
| **String length** | No absolute limit in architecture; compliance constraints per field |

---

## M. Common mistakes

| Mistake | Fix |
|---------|-----|
| Hardcoding jsonPaths without schema lookup | Resolve via Field Schema API; paths can change across releases |
| Treating fixed collections as deletable arrays | Empty items, don't remove slots |
| Adding variable collection items without IDs on PATCH | Create via POST or use add actions on entity endpoints |
| Expecting system logs in `view=entity` | Use `view=log` or `view=full` |
| Ignoring `entitiesFilterKey` for nested fields | Use `entities` query param on GET loan to scope response |
| Using V1 field IDs with V1 contract paths on V3 payloads | Map through V3 Field Schema `contractPath`/`jsonPath` |
| Assuming Borrower First Name is at loan root | It's under `applications[].borrower` — resolve path via Field Schema |

---

## Cross-references

| Topic | File |
|-------|------|
| Loan API views and entity taxonomy | [02-loan-domain.md](./02-loan-domain.md) |
| Domain overview | [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) |
| Enhanced condition application reference | [05-conditions-enhanced.md](./05-conditions-enhanced.md) |
