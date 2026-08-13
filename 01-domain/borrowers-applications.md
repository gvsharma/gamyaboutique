# Borrowers, Applications, and Financial Data

## Domain hierarchy

Encompass organizes borrower and financial data under the **loan**, primarily through **applications** (borrower pairs):

```
Loan
 └── applications[]          (borrower pairs)
      ├── borrower           (ApplicantType: borrower)
      ├── coborrower         (ApplicantType: coborrower, optional)
      ├── property           (subject property for the pair)
      ├── employment[]       (variable collection under application)
      ├── income[]           (variable collection)
      ├── assets[]           (VODs — variable collection)
      ├── liabilities[]      (VOLs — variable collection)
      └── ... other application-scoped entities
```

Variable collections under applicants follow:

```
/encompass/v3/loans/{loanId}/applications/{applicationId}/{applicantType}/{entityName}
```

Where `applicantType` is `borrower` or `coborrower`.

---

## Application (borrower pair)

An **application** represents a borrower pair on the loan file. In Enhanced Conditions, applications are referenced via `ApplicationReferenceContract`:

| Attribute | Description |
|-----------|-------------|
| `entityId` | Required. Unique application identifier |
| `entityName` | RetrieveOnly. Borrower pair name |
| `entityType` | `Application` |
| `legacyId` | RetrieveOnly. Application ID if loan created via V1 API |

Conditions, disclosures, and other entities may be scoped to a specific borrower pair.

---

## Borrower

A **borrower** is an applicant on an application. The V3 loan schema includes `BorrowerContract` with extensive attributes covering:

- Identity and demographics
- Employment and income
- Assets and liabilities indicators
- Authorization (credit report, eConsent)
- Military service, declarations, etc.

Borrowers are accessed under:

```
/encompass/v3/loans/{loanId}/applications/{applicationId}/borrower/...
```

### Co-Borrower

A **co-borrower** is a second applicant on the same application:

```
/encompass/v3/loans/{loanId}/applications/{applicationId}/coborrower/...
```

Entity type in reference contracts: `CoBorrower`.

---

## Property

Subject **property** data is associated with the application (borrower pair). For John Smith's purchase:

| Field concept | Example value |
|---------------|---------------|
| Purpose | Purchase |
| Value | $500,000 |
| Loan amount | $400,000 |
| LTV | Derived from loan/program fields |

Property details live in the V3 loan schema under the application entity. Exact field IDs map to Encompass custom/standard fields — consult the V3 Loan Schema for authoritative field names.

---

## Employment

**Employment** records are variable collections documenting borrower employment history. Encompass uses **VoE** (Verification of Employment) entities for verification workflows.

Typical lifecycle:

1. Processor enters employer data during Processing
2. VoE ordered/completed
3. Conditions may require paystub/W-2 evidence (see conditions domain)

Endpoint pattern:

```
/encompass/v3/loans/{loanId}/applications/{applicationId}/{applicantType}/employment
```

(or VoE-specific endpoints as documented in V3 schema)

---

## Income

**Income** sources are captured as variable collections under the applicant:

- Base employment income
- Overtime, bonus, commission
- Other income (rental, alimony, etc.)

Income totals feed qualification and AUS submissions. Income changes trigger field change / enhanced field change webhooks when subscribed.

---

## Assets

**Assets** are tracked via VODs (Verification of Deposit) and related structures:

- Bank accounts
- Retirement accounts
- Other asset types

Fixed asset slots also exist at the loan level as **fixed collections** (cannot be deleted, only emptied).

Large deposit explanations often drive **conditions** and **conversation logs** — e.g., John Smith's large deposit noted in a phone call log.

---

## Liabilities

**Liabilities** are tracked via VOLs (Verification of Liability):

- Mortgages
- Revolving credit
- Installment loans
- Alimony/child support obligations

Liabilities affect DTI calculations and underwriting conditions.

---

## Contacts

Encompass distinguishes contact types:

| Type | Description |
|------|-------------|
| **Borrower** | Loan applicant (part of application entity) |
| **Co-Borrower** | Second applicant |
| **Business Contact** | Title company, appraiser, etc. (`BusinessContact` entity type) |
| **Borrower Contact** | CRM-style borrower contact (`BorrowerContact` entity type) |
| **Service Provider** | Third-party vendors integrated via networks |

**File Contacts** are a fixed collection on the loan for key transaction parties.

Borrower contact **notes** exist as a separate API (`POST /encompass/v1/borrowerContacts/{contactId}/notes`) — these are CRM notes, not loan-level conversation logs. See [comments-notes-logs.md](./comments-notes-logs.md).

---

## John Smith example — data evolution

| Lifecycle stage | Data changes |
|-----------------|--------------|
| Application | John Smith created as borrower; property $500K; loan $400K |
| Processing | Employment added (current employer); 2-year history |
| Processing | VODs for checking/savings; VOLs from credit report |
| Underwriting | Income calculation fields updated after paystub review |
| Conditional | Large deposit triggers asset explanation condition |
| Closing | Final income/assets verified; eConsent on disclosure logs |

---

## Entity type reference (from official contracts)

Common `entityType` values in EntityReferenceContract relevant to this domain:

`Borrower`, `CoBorrower`, `Application`, `Vod`, `Voe`, `Vol`, `Vom`, `Vor`, `ReoProperty`, `NonBorrowingOwner`, `BusinessContact`, `BorrowerContact`

---

## Integration notes

1. **Multi-borrower-pair loans** — A loan may have multiple applications; always scope reads/writes to the correct `applicationId`
2. **V1 vs V3** — Legacy `legacyId` on applications when loan originated via V1 APIs
3. **Variable collections** — Use dedicated endpoints for add/remove/reorder where available
4. **Field-level subscriptions** — Borrower name fields (e.g., field `36`, `37`) appear in enhanced field change webhook payloads

---

## References

- [Loan Management — Variable Collections](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [V3 Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1)
- [Enhanced Condition ApplicationReferenceContract](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-conditions)
