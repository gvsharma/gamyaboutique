# Field Change & Enhanced Field Change (EFC)

## Business Purpose

Receive notifications when loan data fields change. **Enhanced Field Change** includes previous and new values for integration sync and audit.

## Mortgage Use Case

Dashboard updates John Smith loan amount when field `1109` (or mapped V3 path) changes via `enhancedfieldchange` webhook, then verifies via GET loan.

## Official Documentation

- [Loan Webhook Events — fieldchange, enhancedfieldchange, change](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
- [EFC Webhook Features and Usage Notes](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes)
- [Create a Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-subscription)
- [V3 Pull Loan Field Audit Data](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-pull-loan-field-audit-data)

## API Version

**Webhook V1** (events) | **V3** (audit trail POST)

## REST Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| Field audit pull | POST | `/encompass/v3/loans/{loanId}/auditTrail` |
| Field Reader | POST | `/encompass/v3/loans/{loanId}/fieldReader` |
| Field Writer | POST | `/encompass/v3/loans/{loanId}/fieldWriter` |

There is **no standalone REST CRUD** for field change events — delivery is via webhooks.

## Webhook Event Types (Loan Resource)

| eventType | Description | Filters |
|-----------|-------------|---------|
| `fieldchange` | Specified field changes; cascaded fields included | `filters.attributes` — field IDs, max 50 |
| `enhancedfieldchange` | All field changes with previous/new values | **Cannot** use filters — all changes |
| `change` | Specified JSON path attribute changes | `filters.attributes` with wildcards |

## Subscription Filter (Official)

- Max **50** attributes per subscription
- Invalid filter attributes **silently ignored**
- Virtual fields for EFC require Reporting Database inclusion
- Field does **not** need Audit Trail Database for fieldchange subscription

## Enhanced Field Change Payload (Official Sample)

```json
{
  "eventType": "enhancedfieldchange",
  "meta": {
    "resourceRef": "/encompass/v3/loans/{loanId}/enhancedFieldChange",
    "payload": {
      "event": {
        "fieldChangeEvents": [
          {
            "modifiedField": "36#2",
            "parentFieldId": "36",
            "encompass": {
              "previousValue": "",
              "newValue": "John"
            },
            "v3LoanModel": {
              "newValue": "John"
            }
          }
        ]
      }
    }
  }
}
```

## Field Reference (fieldChangeEvents items)

| Field | Type | Meaning | Mortgage Significance |
|-------|------|---------|----------------------|
| `modifiedField` | string | Field ID (may include index) | Sync key |
| `parentFieldId` | string | Parent field | Multi-instance fields |
| `encompass.previousValue` | string | Old value | Audit |
| `encompass.newValue` | string | New value | Dashboard update |
| `v3LoanModel.previousValue` | string | V3 model old value | JSON path mapping |
| `v3LoanModel.newValue` | string | V3 model new value | JSON path mapping |

## Audit Trail API

POST auditTrail supports `start`, `limit`, `includeHistoricalData`, `ignoreInvalidFields` (documented on loan management pages).

## Relationships

Field change → Loan | May cascade to derived fields in same event

## Lifecycle

User/API updates field → webhook emitted → consumer GETs resourceRef for truth

## Errors

Field change webhook may **not deliver** if triggering loan create/update payload > **250 KB** (documented release note — check current release for fix status).

## Permissions

Subscriber OAuth credentials; field visibility still persona-scoped on subsequent GET.

## Production Considerations

- Read EFC setup guide before subscribing to `enhancedfieldchange` (fires on **all** changes)
- Dedupe via `eventId`
- Do not treat webhook as sole source of truth

## Common Developer Mistakes

- Using enhancedfieldchange with attribute filters (not supported)
- Storing webhook newValue without GET reconciliation
- Ignoring cascaded fields in fieldchange payload

## Real Loan Example

Subscribe to `fieldchange` for pipeline-critical fields only; use EFC for full mirror sync with caution on volume.

## Questions an Architect Should Ask

- fieldchange (filtered) vs enhancedfieldchange (full firehose)?
- How do we map Encompass field IDs to our column model?
- Audit trail POST vs webhook for compliance archive?
