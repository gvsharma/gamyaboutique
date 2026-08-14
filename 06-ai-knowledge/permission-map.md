# Permission Map

## Purpose

**Access control** — Encompass personas vs dashboard RBAC.

## Scope

Official Encompass permission model + **INTERNAL_ARCHITECTURE_RECOMMENDATION** for dashboard.

## Key concepts

| Layer | Mechanism | Classification |
|-------|-----------|----------------|
| Encompass Persona | Field/collection visibility on GET | **OFFICIAL_DOCUMENTATION** + **LENDER CONFIGURABLE** |
| eFolder role access | Document list returns role matrix | **OFFICIAL_DOCUMENTATION** |
| Task template authorization | `CAN_CREATE` on templates | **OFFICIAL_DOCUMENTATION** |
| Workflow assignee | Assignee or admin for task access | **OFFICIAL_DOCUMENTATION** |
| Integration OAuth user | Super Admin / dedicated API user | **OFFICIAL_DOCUMENTATION** |
| Dashboard RBAC | Map persona → loan row access | **INTERNAL_ARCHITECTURE_RECOMMENDATION** |

## Definitions

- **Write access (associate)** — `writeAccess` on milestone associate — **OFFICIAL_DOCUMENTATION**
- **External user** — TPO; separate API surface — **OFFICIAL_DOCUMENTATION**

## Relationships

Associates link users to roles on loans — [01-domain/people-roles-associates.md](../01-domain/people-roles-associates.md)

## API references

Users: `/encompass/v3/users`, `/encompass/v3/externalUsers` — **OFFICIAL_DOCUMENTATION**  
Roles: `/encompass/v3/settings/roles` — **OFFICIAL_DOCUMENTATION**

[02-apis/users-organizations-api.md](../02-apis/users-organizations-api.md)

## Examples

Processor Sarah sees fields per persona — **ILLUSTRATIVE_BUSINESS_EXAMPLE**

## Production notes

403 on Encompass GET → log permission gap, not user error — **INTERNAL_ARCHITECTURE_RECOMMENDATION**
Dashboard document download proxy with auth — [05-dashboard-architecture/security.md](../05-dashboard-architecture/security.md)

## Common mistakes

- Using integration user with insufficient eFolder persona — **OFFICIAL_DOCUMENTATION** symptom: empty documents

## FAQ

See [architect-faq.md](./architect-faq.md).

## Related documents

- [configuration-map.md](./configuration-map.md) · [security](../05-dashboard-architecture/security.md)

## Source references

- [Internal Users](https://developer.icemortgagetechnology.com/developer-connect/reference/internal-users) — Last verified 2026-08-13
