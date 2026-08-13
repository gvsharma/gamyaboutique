# Schedulers API (Timer Webhooks)

## Business Purpose

Encompass **Schedulers** expose timer-based events via webhooks for time-driven automation (compliance dates, scheduled tasks).

## Mortgage Use Case

Timer fires for TRID waiting period end → integration triggers disclosure compliance check on affected loans.

## Official Documentation

- [Scheduler Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers)
- [Timer Extra Payload](https://developer.icemortgagetechnology.com/developer-connect/reference/extra-payload-attributes-timer)
- [Compliance Calendar Date Calculator](https://developer.icemortgagetechnology.com/developer-connect/docs/comp-cal-date-calc-user-guide)

## API Version

**Webhook V1** (Timer resource)

REST CRUD for scheduler configuration: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** on Developer Connect reference catalog reviewed.

## Webhook Resource

**Timer**

## Events (Official)

| Event | Description |
|-------|-------------|
| Created | Timer created |
| Completed | Timer completed |
| Changed | Timer changed |
| Cancelled | Timer cancelled |

## Extra Payload Fields (Official — Timer)

Documented on extra-payload-attributes-timer reference:

| Field | Meaning |
|-------|---------|
| `name` | Timer name |
| `description` | Description |
| `associations[]` | Related entities (e.g. loan GUID, rule) |
| `completionTime` | Completion timestamp |
| `status` | Timer status |
| `created` | Created timestamp |
| `createdBy` | Creator |
| `resourceRef` | Resource URL |

Exact JSON shape: per official extra payload page.

## Related Calculator API

Compliance Calendar Date Calculator — endpoint documented in user guide (not fully extracted in this pass). Use guide for date computation workflows.

## Authentication

Webhook subscription uses Bearer OAuth2; inbound notifications use signing key.

## Relationships

Timer → Loan (via associations) | Timer → Compliance rules

## Production Considerations

- Subscribe to Timer resource separately from Loan resource
- Combine with Compliance Calendar API for date logic where applicable

## Common Developer Mistakes

- Expecting REST scheduler CRUD on Developer Connect (not documented)
- Missing Timer webhook subscription while using compliance calculator

## Questions an Architect Should Ask

- Do we use Timer webhooks or only loan disclosureTracking events for TRID?
- Where are timers configured — Encompass UI only?
