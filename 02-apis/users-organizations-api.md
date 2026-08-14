# Organizations & Users API

## Business Purpose

Retrieve and manage Encompass organizational hierarchy, internal users, external (TPO) users, personas, and roles.

## Mortgage Use Case

Dashboard maps Mike/Sarah/Robert/Lisa to Encompass user IDs; resolves role names for milestone associate display.

## Official Documentation

- [Organizations](https://developer.icemortgagetechnology.com/developer-connect/reference/organizations)
- [V3 Internal Users](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-internal-users)
- [V3 Get List Internal Users](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-list-internal-users)
- [Get All External Users](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-external-users)
- [V3 Get List of Roles](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-list-of-roles)
- [V3 Get List of Personas](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-list-of-personas)

## API Version

**V3** (users, roles, personas) | **V1** (organizations)

## Endpoints

### Organizations (V1)

| Operation | Method | Path |
|-----------|--------|------|
| List orgs | GET | `/encompass/v1/organizations` |
| Root org | GET | `/encompass/v1/organizations/root` |
| Get org | GET | `/encompass/v1/organizations/{orgId}` |
| Children | GET | `/encompass/v1/organizations/{orgId}/children` |

### Internal Users (V3) — added 24.2

| Operation | Method | Path |
|-----------|--------|------|
| List/create | GET/POST | `/encompass/v3/users` |
| Get/update | GET/PATCH | `/encompass/v3/users/{userId}` |
| Eligible roles | GET | `/encompass/v3/users/{userId}/eligibleRoles` |
| Public profile | GET/PATCH | `/encompass/v3/users/{userId}/publicProfile` |
| Compensation | GET/PATCH/POST/DELETE | `/encompass/v3/users/{userId}/compensationPlans` |

Alias: `{userId}` = `me` for calling user.

### External Users (V3)

| Operation | Method | Path |
|-----------|--------|------|
| List/create/update | GET/POST/PATCH | `/encompass/v3/externalUsers` |
| Get user | GET | `/encompass/v3/externalUsers/{userId}` |
| Effective rights | GET | `/encompass/v3/externalUsers/{userId}/effectiveRights` |

### Roles & Personas

| Operation | Method | Path |
|-----------|--------|------|
| List roles | GET | `/encompass/v3/settings/roles` |
| Get role | GET | `/encompass/v3/settings/roles/{roleId}` |
| Role mappings | GET | `/encompass/v3/settings/roles/roleMappings` |
| List personas | GET | `/encompass/v3/settings/personas` |

## Authentication

Bearer OAuth2.

## Internal Users List — Query Parameters (Official)

| Parameter | Description |
|-----------|-------------|
| `orgId` | Organization folder (`0` = root) |
| `isRecursive` | Include child orgs |
| `entities` | `Summary`, `Personas`, `UserGroups`, `Licenses`, `All`, etc. |
| `start`, `limit` | Pagination (max limit 1000) |
| `filter` | Filter object |

## External Users — Query Parameters (Official)

`filter`, `sort`, `entities` — filter fields include FirstName, LastName, EmailId, PersonaId, RoleId, siteId, etc.

## Roles List — Query Parameters (Official — 25.1)

| Parameter | Description |
|-----------|-------------|
| `entities` | Summary (default), Personas, UserGroups, All |
| `start`, `limit` | Pagination (max 1000) |

## Field Reference (Internal User Summary)

**NOT ESTABLISHED** as full table here — use `entities` param to control response sections per OpenAPI.

## Permissions (Official)

Internal Users GET:

- Administrators (admin, Super Administrator, Administrator persona) OR Settings "Organizations/User" persona
- Caller limited to same org or child orgs

## Webhooks

[Orgs and Users webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users)

## Version Dependencies

V3 Internal Users: **24.2** | V3 Roles list: **25.1**

## Production Considerations

- Cache user/role directory; refresh periodically
- Use `me` for integration self-check
- External users require orgId or TPO ID on query (official)

## Common Developer Mistakes

- Assuming any user can call user admin APIs
- Confusing Role (loan team) with Persona (platform access)

## Real Loan Example

Resolve milestone associate `entityId: "jsmith"` via GET users for display name on dashboard.

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompass/v3/users/me?entities=Summary" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- Which entities subset for our user sync job?
- Internal vs external users in TPO channel dashboard?
