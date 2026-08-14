# Loan Domain

## What a loan is in Encompass

In Encompass, a **loan** is the root business object representing a mortgage transaction. Official Developer Connect documentation states:

> A loan is made up of numerous data types and formats that describe the details of the loan such as borrower, subject property, loan type, etc.

The Loan Management API reads and writes these data elements, and can create and delete loans.

A loan is **not** merely a row in a pipeline view. It is a composite aggregate containing:

- **Entity data** — borrowers, property, financials, program details, custom fields
- **Workflow state** — milestones, conditions, tasks
- **People assignments** — loan associates bound to roles
- **Documents** — eFolder documents and attachments
- **Communications** — conversation logs
- **History** — editable logs and system-generated logs
- **Compliance artifacts** — disclosure tracking logs

For dashboard builders, treat the loan GUID as the **canonical integration key** across APIs and webhooks.

---

## Loan ID (loanId)

| Property | Detail |
|----------|--------|
| Identifier | 32-character GUID assigned at loan creation |
| Immutability | Does not change through the lifetime of the loan |
| API usage | Required path parameter for most loan-scoped endpoints |
| Discovery | Returned on `POST /encompass/v3/loans`; also visible in Smart Client loan Properties as GUID |

Example format (from official docs): `547x8xx1-15xx-4fbx-8x23-x033121x1402`

---

## V3 loan schema entity classification

The V3 Loan Schema classifies loan content into four entity types. Understanding this classification is essential for integration design.

### 1. Fixed collections

- Pre-populated with empty items when the loan is created
- IDs derived from field combinations and/or collection index
- Items cannot be truly deleted — only emptied (non-id fields null/blank/zero)
- Cannot be reordered
- Updated via Create/Update Loan APIs
- Included in `GET` with `view=entity|full` when populated
- Examples: File Contacts, Fixed Assets, Custom Fields

### 2. Variable collections

- Variable size; empty at loan creation
- Auto-generated IDs (typically GUIDs)
- Items can be added, removed, reordered
- Managed via dedicated endpoints incrementally
- Three placement patterns:

```
/encompass/v3/loans/{loanId}/{entityName}
/encompass/v3/loans/{loanId}/applications/{applicationId}/{entityName}
/encompass/v3/loans/{loanId}/applications/{applicationId}/{applicantType}/{entityName}
```

- Examples: VoDs (Verification of Deposit), VoLs (Verification of Liability), VoEs (Verification of Employment)

### 3. Editable logs

- Log items generally **without** Encompass Field IDs
- Can be created/updated via Create/Update Loan; also managed via dedicated endpoints
- Included in `GET` with `view=logs|full`
- Examples: AUS Tracking Logs, **Conversation Logs**

### 4. System logs

- **Cannot be edited by any user**
- Included in `GET` with `view=logs|full`
- Examples: **Milestone History Log**, **HTML Email logs**, **Lock Action Logs**

---

## Loan views (`view` query parameter)

| View | Returns |
|------|---------|
| `entity` | Everything except log entries |
| `log` | Log entries only |
| `full` | Entity + logs (largest payload; use only when log detail required) |
| `id` | IDs of created/updated resources (Create/Update only) |

---

## Loan-level indicators affecting domain behavior

| Indicator | Field / JSON path | Effect |
|-----------|-------------------|--------|
| Enhanced Conditions | `ENHANCEDCOND.X1` / `loan.useEnhancedConditionIndicator` | When `true`, loan uses Enhanced Conditions APIs; when `false`, Standard Conditions APIs |

See [enhanced-conditions.md](./enhanced-conditions.md).

---

## Example: John Smith purchase loan

When Mike (Loan Officer) creates John Smith's $400,000 purchase file:

1. Encompass assigns a permanent **loanId** (GUID)
2. A **borrower pair / application** is created with John Smith as borrower
3. Subject **property** data is captured ($500,000 value)
4. **Milestone schedule** is applied from a milestone template (**LENDER CONFIGURABLE**)
5. Mike is assigned as **loan associate** on the Started/Qualification milestone role
6. The loan appears in pipeline with entity data but likely empty variable collections until processing begins

As Sarah (Processor) works the file, variable collections populate (VoEs, VoDs), **conditions** are added, and **eFolder documents** receive **attachments**.

---

## Loan vs related concepts

| Concept | Relationship to loan |
|---------|---------------------|
| Application / borrower pair | Child entity under loan; holds borrower + co-borrower |
| Milestone log | Per-loan workflow stage instance |
| Condition | Per-loan requirement tracked in eFolder |
| eFolder document | Per-loan document container |
| Workflow task | Associated to loan via `workEntity` / associations |
| Disclosure tracking log | Per-loan RESPA-TILA compliance record |
| Conversation log | Per-loan communication record |

---

## API surface (conceptual, not implementation)

Primary loan endpoints (official Developer Connect):

| Operation | Endpoint |
|-----------|----------|
| Create | `POST /encompass/v3/loans` |
| Retrieve | `GET /encompass/v3/loans/{loanId}` |
| Update | `PATCH /encompass/v3/loans/{loanId}` |
| Delete | `DELETE /encompass/v3/loans/{loanId}` |
| Schema | V3 Loan Schema reference |

Base URL: `https://api.elliemae.com` (Production), `https://concept.api.elliemae.com` (UAT)

Authentication: OAuth 2.0 bearer token.

---

## Integration implications for dashboard builders

1. **Never treat webhook payload as full loan state** — fetch current resource after event (see [events.md](./events.md))
2. **Choose view intentionally** — `full` is expensive; prefer entity-only for dashboards
3. **Respect fixed vs variable collection semantics** — deletion behavior differs
4. **Check enhanced condition indicator** before calling condition APIs
5. **Loan lock** affects mutating operations — lock/unlock webhooks exist but are not real-time guarantees

---

## References

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [V3 Get Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1)
- [V3 Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1)
