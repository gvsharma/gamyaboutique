# Configuration Map

## Purpose

**LENDER CONFIGURABLE** Encompass settings that affect API behavior and dashboard labels.

## Scope

Settings APIs and admin-configured behavior — not hardcoded in ICE platform defaults.

## Key concepts

| Setting domain | API (examples) | Classification |
|----------------|----------------|----------------|
| Milestones | `GET /encompass/v3/settings/milestones` | **LENDER CONFIGURABLE** |
| Enhanced condition types | `.../settings/loan/conditions/types` | **LENDER CONFIGURABLE** |
| Condition templates | `.../settings/loan/conditions/templates` | **LENDER CONFIGURABLE** |
| Condition sets | `.../settings/loan/conditions/set` | **LENDER CONFIGURABLE** |
| eFolder document groups | `.../settings/eFolder/documentGroups` | **LENDER CONFIGURABLE** |
| Roles | `GET /encompass/v3/settings/roles` (25.1+) | **LENDER CONFIGURABLE** |
| Task templates | `/workflow/v1/templates/task/items` | **LENDER CONFIGURABLE** |
| Disclosure tracking | `GET /encompass/v3/settings/loan/disclosureTracking` | **LENDER CONFIGURABLE** |
| Business contacts | `/encompass/v3/settings/contacts/...` | **LENDER CONFIGURABLE** |

## Definitions

**Persona** — user capability profile — **LENDER CONFIGURABLE** · controls field/API visibility — **OFFICIAL_DOCUMENTATION**

## Relationships

Configuration drives labels in [master-lifecycle-matrix.md](./master-lifecycle-matrix.md) status rows marked **LENDER CONFIGURABLE**.

## API references

[02-apis/condition-template-api.md](../02-apis/condition-template-api.md) · [02-apis/milestone-api.md](../02-apis/milestone-api.md) (settings section)

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** Custom milestone "Cond. Approval" name on John Smith loan.

## Production notes

Store lender's milestone/condition status dictionary in integration config — **INTERNAL_ARCHITECTURE_RECOMMENDATION**
Sync settings on schedule or admin trigger — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

## Common mistakes

- Hardcoding UW status strings across lenders — **LENDER CONFIGURABLE** violation

## FAQ

**Q: Are DU status strings universal?** A: **LENDER CONFIGURABLE** / investor-specific — treat as configurable.

## Related documents

- [permission-map.md](./permission-map.md) · [condition-map.md](./condition-map.md)

## Source references

- [Settings Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-milestones) — Last verified 2026-08-13
