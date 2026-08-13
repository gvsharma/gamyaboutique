# Standard Conditions API

## Business Purpose

Manage underwriting, preliminary, and post-closing conditions on loans using **Standard Conditions** (when Enhanced Conditions are disabled).

## Mortgage Use Case

On loans with `useEnhancedConditionIndicator = false`, underwriter adds "Provide most recent two paystubs" via V1 condition endpoints by type `underwriting`.

## Official Documentation

- [Loan Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions)
- [Underwriting Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/underwriting-conditions)

## API Version

**V1** — path pattern `/encompass/v1/loans/{loanId}/conditions/{type}`

Types (documented): `underwriting`, `preliminary`, `postclosing`

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| List/create/update set | GET/POST/PATCH | `/encompass/v1/loans/{loanId}/conditions/{type}` |
| Get condition | GET | `/encompass/v1/loans/{loanId}/conditions/{type}/{conditionId}` |
| Condition comments | PATCH | `/encompass/v1/loans/{loanId}/conditions/{type}/{conditionId}/comments` |
| Assign documents | PATCH | `/encompass/v1/loans/{loanId}/conditions/{type}/{conditionId}/documents` |

## Authentication

Bearer OAuth2.

## Path Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `loanId` | Yes | Loan GUID |
| `type` | Yes | `underwriting`, `preliminary`, or `postclosing` |
| `conditionId` | Yes | Condition GUID (on single-condition routes) |

## Business Rules (Official)

- Condition is an **eFolder entry** tracking requirement status
- Multiple documents assignable to a condition
- A document may assign to **more than one** condition
- Each condition has unique **conditionId** (from create response header)

## Field Reference

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as a single published Standard Condition contract table in extracted reference pages. Use V1 OpenAPI on the specific condition type reference page for field-level detail.

Conceptual fields (domain — see [01-domain/conditions.md](../01-domain/conditions.md)):

| Field | Meaning | Mortgage Significance |
|-------|---------|----------------------|
| conditionId | Unique ID | API path key |
| Description | Requirement text | "Provide most recent two paystubs." |
| Status | Tracking state | Pipeline dashboards |
| Assigned documents | Evidence | Paystub PDFs |

## Relationships

Condition → Documents (n:m) | Condition ≠ Document | Condition ≠ Task

## Lifecycle

Add → track status → assign documents → clear/waive → loan proceeds

## Errors

**401** documented on related endpoints; full matrix per operation in reference.

## Pagination

NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION.

## Filtering

By `type` path segment only.

## Webhooks

When loan uses Enhanced Conditions, use loan `condition` webhook events. Standard-only loans: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** for dedicated standard condition webhooks.

## Permissions

eFolder/condition persona access — **LENDER CONFIGURABLE**.

## Locking

Inherits loan lock when loan locked.

## Version Dependencies

Check `loan.useEnhancedConditionIndicator` — if `true`, use [enhanced-condition-api.md](./enhanced-condition-api.md) instead.

## Configuration Dependencies

Condition types and statuses — **LENDER CONFIGURABLE**.

## Production Considerations

- Always read enhanced indicator before choosing API family
- Store conditionId from create response header

## Common Developer Mistakes

- Calling V1 standard APIs on enhanced-condition loans
- Treating condition as document or attachment

## Real Loan Example

Verify `useEnhancedConditionIndicator = false` → POST to underwriting conditions collection on John Smith loan.

## cURL Example (Illustrative path only)

```bash
curl -s "https://api.elliemae.com/encompass/v1/loans/${LOAN_ID}/conditions/underwriting" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- What percentage of our lender instances use Enhanced vs Standard?
- Do we maintain dual code paths during migration?
