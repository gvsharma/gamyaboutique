# Enhanced Condition Settings API (Types, Sets, Templates)

## Business Purpose

Administer Enhanced Condition **types**, **sets**, and **templates** — lender configuration that drives condition instances on loans.

## Mortgage Use Case

Lender defines template "Income - Paystubs" with Prior To = Approval; processor applies condition set at submittal via loan Manage API.

## Official Documentation

- [Settings Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-enhanced-conditions)
- [V3 Get All Enhanced Condition Types](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-condition-types)
- [V3 Get All Enhanced Condition Sets](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-condition-sets)
- [V3 Get All Enhanced Condition Templates](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-enhanced-condition-templates)
- [V3 Manage Enhanced Condition Templates](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-condition-templates)

## API Version

**V3**

## Endpoints

### Condition Types

| Operation | Method | Path |
|-----------|--------|------|
| List types | GET | `/encompass/v3/settings/loan/conditions/types` |
| Get type | GET | `/encompass/v3/settings/loan/conditions/types/{typeId}` |
| Manage types | PATCH | `/encompass/v3/settings/loan/conditions/types` |

### Condition Sets

| Operation | Method | Path |
|-----------|--------|------|
| List sets | GET | `/encompass/v3/settings/loan/conditions/set` |
| Get set | GET | `/encompass/v3/settings/loan/conditions/set/{setId}` |

### Condition Templates

| Operation | Method | Path |
|-----------|--------|------|
| List templates | GET | `/encompass/v3/settings/loan/conditions/templates` |
| Get template | GET | `/encompass/v3/settings/loan/conditions/templates/{templateId}` |
| Manage templates | PATCH | `/encompass/v3/settings/loan/conditions/templates` |

### Automated Conditions

| Operation | Method | Path |
|-----------|--------|------|
| Evaluate rules | POST | `/encompass/v3/calculators/automatedConditions` |

## Authentication

Bearer OAuth2. Typically requires admin/settings persona.

## Settings Purpose (Official)

Define:

- Condition types, statuses, sources, recipients, Prior To values
- Actions allowed per template based on **user role**
- Template metadata used when applying to loans (`title` + `conditionType` match)

## Field Reference

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as a complete exported field table in this knowledge base pass. Key template attributes referenced in Manage loan API:

| Concept | Meaning | Configurable? |
|---------|---------|---------------|
| `title` | Template title matched on loan add | **LENDER CONFIGURABLE** |
| `conditionType` | Type association | **LENDER CONFIGURABLE** |
| `allowDuplicate` | Enables duplicate action on loan | **LENDER CONFIGURABLE** |
| Tracking definitions | Status checkpoint schema | **LENDER CONFIGURABLE** |
| Category/Prior To/Recipient definitions | Option lists | **LENDER CONFIGURABLE** |

## Relationships

Template → Type | Set → Templates[] | Template → Condition Instance (on apply)

## Lifecycle

Admin configures settings → templates available → loan Manage API applies → instance on loan file

## Errors

Per-endpoint in reference OpenAPI.

## Pagination

NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION for settings list endpoints.

## Webhooks

Settings changes: NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION. Loan condition webhooks fire on instance changes.

## Permissions

Role-based template actions — **LENDER CONFIGURABLE** in Encompass settings.

## Version Dependencies

Enhanced Conditions feature: Encompass **20.2+**.

## Production Considerations

- Cache templates locally; refresh on schedule
- Template catalog drives dashboard condition type labels

## Common Developer Mistakes

- Editing settings APIs when loan instance API intended
- Assuming template title editable on loan instance

## Real Loan Example

GET templates → find paystub template → PATCH loan conditions add with matching title/type.

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompass/v3/settings/loan/conditions/templates" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- How often do templates change and how do we invalidate cache?
- Do we store templateId or title+type on our condition mirror?
