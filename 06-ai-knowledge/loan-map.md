# Loan Map

## Purpose

**Loan aggregate** — root object for all integrations and dashboard views.

## Scope

Loan entity, views, logs, pipeline. Canonical: [01-domain/loan-domain.md](../01-domain/loan-domain.md).

## Key concepts

| Field / concept | Classification |
|-----------------|----------------|
| `loan.id` | Permanent GUID — **OFFICIAL_DOCUMENTATION** |
| `loanNumber` | Display id — **LENDER CONFIGURABLE** auto-number |
| `loanFolder` | Pipeline folder — **LENDER CONFIGURABLE** |
| `useEnhancedConditionIndicator` | API branch switch — **OFFICIAL_DOCUMENTATION** |
| `view=entity\|logs\|full` | Response shape — **OFFICIAL_DOCUMENTATION** |

## Definitions

**Loan logs (collective):** editable logs + system logs via `view=logs|full` — **OFFICIAL_DOCUMENTATION**

| view | Returns |
|------|---------|
| entity | Loan data, no logs — **OFFICIAL_DOCUMENTATION** |
| logs | Logs only — **OFFICIAL_DOCUMENTATION** |
| full | Entity + logs — **OFFICIAL_DOCUMENTATION** |

## Relationships

Parent of all loan-scoped objects — [relationship-map.md](./relationship-map.md)

## API references

- CRUD: `/encompass/v3/loans/{loanId}` — **OFFICIAL_DOCUMENTATION**
- Pipeline search: `POST /encompass/v3/loanPipeline` — **OFFICIAL_DOCUMENTATION**
- Schema: `GET /encompass/v3/schemas/loan` — **OFFICIAL_DOCUMENTATION**
- Audit: `POST .../auditTrail` — **OFFICIAL_DOCUMENTATION**
- Locks: `/encompass/v3/resourceLocks` — **OFFICIAL_DOCUMENTATION**

[02-apis/loan-api.md](../02-apis/loan-api.md)

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** John Smith loan GUID as canonical integration key.

## Production notes

Avoid `view=full` on recurring sync — **INTERNAL_ARCHITECTURE_RECOMMENDATION**
Trash = `move` webhook — **OFFICIAL_DOCUMENTATION**

## Common mistakes

- V1 vs V3 loan contract mix-up — **VERSION_DEPENDENT**

## FAQ

See [developer-faq.md](./developer-faq.md).

## Related documents

- [loan-map.md](./loan-map.md) · [field-changes](../03-loan-communications/field-changes.md) · [05-dashboard loan projection](../05-dashboard-architecture/data-model.md)

## Source references

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) — Last verified 2026-08-13
