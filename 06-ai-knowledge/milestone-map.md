# Milestone Map

## Purpose

**Milestone logs**, associates, SLA fields, and system history.

## Scope

Milestones API + logs. Canonical: [01-domain/milestones.md](../01-domain/milestones.md).

## Key concepts

| Concept | Classification |
|---------|----------------|
| Milestone log `id` | Instance id — **OFFICIAL_DOCUMENTATION** |
| MilestoneSetting | Template ref — **LENDER CONFIGURABLE** |
| `doneIndicator` | Finish milestone — **OFFICIAL_DOCUMENTATION** |
| Milestone History Log | System log in `view=logs` — **OFFICIAL_DOCUMENTATION** |
| Milestone-free roles | `/milestoneFreeRoles` — **OFFICIAL_DOCUMENTATION** |

## Definitions

- `days` — expected SLA days — **OFFICIAL_DOCUMENTATION** / **LENDER CONFIGURABLE**
- `duration` — actual elapsed — **OFFICIAL_DOCUMENTATION**
- `comments` — single string on log — **OFFICIAL_DOCUMENTATION** (not thread)

## Relationships

Milestone → Associate → User/Group — [relationship-map.md](./relationship-map.md)

## API references

- `GET/PATCH /encompass/v3/loans/{id}/milestones/{milestoneId}` — **OFFICIAL_DOCUMENTATION**
- Settings: `/encompass/v3/settings/milestones` — **OFFICIAL_DOCUMENTATION**
- V1 associates legacy: `/encompass/v1/loans/{id}/associates` — **OFFICIAL_DOCUMENTATION**

[02-apis/milestone-api.md](../02-apis/milestone-api.md)

Webhooks: `updateMilestones`, `finishMilestones` — **OFFICIAL_DOCUMENTATION**

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** Finish Processing with comment "Processing complete."

## Production notes

Do not use milestone GET for full transition history — use Milestone History Log — **OFFICIAL_DOCUMENTATION**
Derived SLA: `milestone_age_days`, `sla_breached` — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

## Common mistakes

- Confusing milestone log `id` with milestoneSetting entityId — **OFFICIAL_DOCUMENTATION**

## FAQ

See [architect-faq.md](./architect-faq.md).

## Related documents

- [03-loan-communications/milestone-comments.md](../03-loan-communications/milestone-comments.md) · [master-lifecycle-matrix.md](./master-lifecycle-matrix.md)

## Source references

- [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones) — Last verified 2026-08-13
