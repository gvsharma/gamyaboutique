# 03 — Loans

**Share this file when:** designing loan fetch, patch, and schema strategy (V3).

**Related:** [01 Core model](./01-purpose-and-core-model.md) · [11 Logs vs comments](./11-conversation-logs-comments-notes.md) · [13 Field change](./13-enhanced-field-change.md) · [18 Official docs](./18-official-documentation.md)

---

## What a loan is

The loan is the mortgage transaction and its structured data. It is the center of Encompass.

Loan data includes borrower, property, employment, income, assets, liabilities, and many other entities. Workflow, people, documents, and disclosures are related to the same loan identity.

## V1 vs V3

The V3 Loan Schema is a **different data contract** from the V1 Loan Contract. Do not mix V1 and V3 contracts without explaining the difference.

Golden rule 10: **Never mix V1 and V3 contracts without explaining the difference.**

Always confirm field paths, collection names, and endpoints in current ICE documentation:

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [V3 Get Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1)
- [V3 Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1)

## Four types of loan entities (V3)

The V3 Loan Management API distinguishes:

1. **Fixed collections**
2. **Variable collections**
3. **Editable logs**
4. **System logs**

### Variable collections (examples from ICE docs)

Repeatable collections such as:

- VoDs
- VoLs
- VoEs
- other repeatable collections

ICE documents three location patterns for variable collections:

1. Directly under the loan: `/encompass/v3/loans/{loanId}/{entityName}`
2. Under a borrower pair / application: `/encompass/v3/loans/{loanId}/applications/{applicationId}/{entityName}`
3. Under an applicant (borrower / coborrower) in an application: `/encompass/v3/loans/{loanId}/applications/{applicationId}/{applicantType}/{entityName}`

Confirm each collection's actual path in the current V3 schema.

### Editable logs (examples from ICE docs)

- Conversation Logs
- AUS Tracking Logs

Editable logs generally do not use Encompass Field IDs the way loan entity fields do. They can be created/updated through loan APIs and, incrementally, through dedicated endpoints.

Included in Get Loan with `view=log` or `view=full` if present.

### System logs (examples from ICE docs)

- Milestone History
- HTML Email Logs
- Lock Action Logs

**System logs cannot be edited by users.**

Included in Get Loan with `view=log` or `view=full` if present.

## Loan views

Important views documented by ICE:

| View | Returns | When to use |
|------|---------|-------------|
| `entity` | Loan content **without** log entries | Default for loan data |
| `log` | **Only** log entries | When you need logs/history |
| `full` | Loan content **and** logs | Only when both are required |
| `id` | IDs of created/updated resources | Create/update responses; ICE notes this is available on create/update APIs |

**Do not blindly use `full` for every request.** ICE documents that `full` produces the largest payload and is not recommended for general use unless log detail is required.

If a requested field is not permitted for the caller, ICE documents that the field will not be returned.

## Integration guidance

- Fetch **entity** for operational loan content.
- Fetch **log** (or dedicated log APIs) for communications and history.
- Persist the loan id as the join key across downstream tables.
- Treat custom fields and PII as first-class concerns. See [13 Enhanced Field Change](./13-enhanced-field-change.md).
- Never assume the V1 JSON shape when calling V3, or vice versa.

## Official documentation

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [V3 Get Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1)
- [V3 Update Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/update-loan-1)
- [Get Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1)
