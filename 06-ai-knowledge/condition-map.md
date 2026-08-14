# Condition Map

## Purpose

**Standard vs Enhanced conditions**, tracking, comments, and automation.

## Scope

Condition APIs and lifecycle. Canonical: [01-domain/conditions.md](../01-domain/conditions.md) · [01-domain/enhanced-conditions.md](../01-domain/enhanced-conditions.md).

## Key concepts

| Mode | When | API |
|------|------|-----|
| Enhanced | `useEnhancedConditionIndicator=true` | V3 `/conditions` — **OFFICIAL_DOCUMENTATION** |
| Standard | indicator false | V1 `/conditions/{type}` — **OFFICIAL_DOCUMENTATION** |

Types (standard path): `underwriting`, `preliminary`, `postclosing` — **OFFICIAL_DOCUMENTATION**

## Definitions

- **tracking[]** — checkpoint checklist — **OFFICIAL_DOCUMENTATION**
- **comments[]** — LogCommentContract — **OFFICIAL_DOCUMENTATION**
- **assignedTo** — document refs, not attachments — **OFFICIAL_DOCUMENTATION**
- **sourceOfCondition** — Manual, DUFindings, etc. — **OFFICIAL_DOCUMENTATION**
- Status labels — **LENDER CONFIGURABLE**

## Relationships

Condition → Document evidence chain — [relationship-map.md](./relationship-map.md)

## API references

- `GET/PATCH .../conditions/{id}/comments` — **OFFICIAL_DOCUMENTATION**
- `GET/PATCH .../conditions/{id}/tracking` — **OFFICIAL_DOCUMENTATION**
- `POST .../calculators/automatedConditions` — **OFFICIAL_DOCUMENTATION**
- Settings templates: `/encompass/v3/settings/loan/conditions/templates` — **OFFICIAL_DOCUMENTATION**

[02-apis/enhanced-condition-api.md](../02-apis/enhanced-condition-api.md) · [02-apis/condition-template-api.md](../02-apis/condition-template-api.md)

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** "Provide most recent two paystubs" — underwriting condition.

## Production notes

- `view=Full` only when comments needed — **INTERNAL_ARCHITECTURE_RECOMMENDATION**
- `includeRemoved=true` for audit — **OFFICIAL_DOCUMENTATION**
- Standard condition webhooks — **NOT_ESTABLISHED** when EC disabled

## Common mistakes

- Editing loan-level `title` on EC — retrieve-only — **OFFICIAL_DOCUMENTATION**

## FAQ

See [developer-faq.md](./developer-faq.md) · [product-faq.md](./product-faq.md).

## Related documents

- [master-lifecycle-matrix.md](./master-lifecycle-matrix.md) · [03-loan-communications/condition-comments.md](../03-loan-communications/condition-comments.md)

## Source references

- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions) — Last verified 2026-08-13
