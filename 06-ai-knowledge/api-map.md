# API Map

## Purpose

Navigate **Developer Connect APIs** by domain without duplicating endpoint tables.

## Scope

Official REST + Webhook V1. Full matrix: [02-apis/API-INDEX.md](../02-apis/API-INDEX.md).

## Key concepts

| API family | Base path | Version | Classification |
|------------|-----------|---------|----------------|
| Loan Management | `/encompass/v3/loans` | V3 primary | **OFFICIAL_DOCUMENTATION** |
| Workflow Tasks | `/workflow/v1/tasks` | V1 | **OFFICIAL_DOCUMENTATION** |
| Enhanced Conditions | `/encompass/v3/loans/{id}/conditions` | V3 | **OFFICIAL_DOCUMENTATION** |
| Standard Conditions | `/encompass/v1/loans/{id}/conditions/{type}` | V1 | **OFFICIAL_DOCUMENTATION** |
| eFolder Documents | `/encompass/v3/loans/{id}/documents` | V3 | **OFFICIAL_DOCUMENTATION** |
| Attachments | `/encompass/v3/loans/{id}/attachments` | V3 | **VERSION_DEPENDENT** V1 sunset 26.3 |
| Encompass Docs | `/encompassdocs/v1/documentOrders` | V1 | **OFFICIAL_DOCUMENTATION** |
| Webhooks | `/webhook/v1/subscriptions` | V1 | **OFFICIAL_DOCUMENTATION** |
| Secondary Trades | `/secondary/v1/trades` | V1 | **OFFICIAL_DOCUMENTATION** |

## Version rules

| Rule | Classification |
|------|----------------|
| Prefer V3 for loan, documents, conditions, milestones | **INTERNAL_ARCHITECTURE_RECOMMENDATION** + **OFFICIAL_DOCUMENTATION** |
| Use `documentStatus` not `status` | **VERSION_DEPENDENT** 26.1+ |
| Migrate attachments off V1 | **VERSION_DEPENDENT** 26.3 sunset |

See [02-apis/api-version-matrix.md](../02-apis/api-version-matrix.md).

## Relationships

Each API maps to domain object in [master-object-matrix.md](./master-object-matrix.md).

## API references (by file)

| Domain | Doc |
|--------|-----|
| Loan | [02-apis/loan-api.md](../02-apis/loan-api.md) |
| Milestone | [02-apis/milestone-api.md](../02-apis/milestone-api.md) |
| Task | [02-apis/task-api.md](../02-apis/task-api.md) |
| Enhanced Condition | [02-apis/enhanced-condition-api.md](../02-apis/enhanced-condition-api.md) |
| Document | [02-apis/document-api.md](../02-apis/document-api.md) |
| Webhook | [02-apis/webhook-api.md](../02-apis/webhook-api.md) |
| Field change | [02-apis/field-change-api.md](../02-apis/field-change-api.md) |

## Examples

List conditions (Enhanced): `GET /encompass/v3/loans/{loanId}/conditions?view=Full` — **OFFICIAL_DOCUMENTATION**

## Production notes

- OAuth 2.0 bearer — [02-apis/api-authentication.md](../02-apis/api-authentication.md)
- Persona-scoped field visibility on GET — **OFFICIAL_DOCUMENTATION**
- Gaps: no global loan notes API — **NOT_ESTABLISHED**

## Common mistakes

- V1 standard conditions on enhanced-enabled loan
- Using deprecated document `status` field — **VERSION_DEPENDENT**

## FAQ

**Q: One API for all loan activity?** **NOT_ESTABLISHED** — aggregate in dashboard **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

## Related documents

- [integration-map.md](./integration-map.md) · [error-map.md](./error-map.md)

## Source references

- [Developer Connect Reference](https://developer.icemortgagetechnology.com/developer-connect/reference/) — Last verified 2026-08-13
