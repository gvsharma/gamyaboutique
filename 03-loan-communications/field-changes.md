# Field Changes & Audit Trail

Immutable **data mutation events** on loan fields — not conversational comments.

---

## Delivery mechanisms

| Mechanism | API version | Use case |
|-----------|-------------|----------|
| `fieldchange` webhook | Webhook V1 | Subscribe to specific field IDs (max 50 filters) |
| `enhancedfieldchange` webhook (EFC) | Webhook V1 | All field changes with previous/new values |
| `change` webhook | Webhook V1 | JSON path attribute changes with wildcards |
| Audit Trail POST | V3 | Historical backfill / compliance archive |
| Field Reader | V3 | Point-in-time read — not history |

There is **no REST CRUD** to create or edit field change events — they are system-emitted.

---

## Webhook event types (official)

From [Loan Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan):

| eventType | Filters | Payload |
|-----------|---------|---------|
| `fieldchange` | Yes — max 50 field IDs in `filters.attributes` | Modified fields; cascaded fields may appear |
| `enhancedfieldchange` | **No filters allowed** | All changes with previous/new values |
| `change` | Yes — JSON paths with wildcards | Attribute-level changes |

### Enhanced Field Change payload (official structure)

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

Official fields: `modifiedField`, `parentFieldId`, `encompass.previousValue`, `encompass.newValue`, `v3LoanModel.previousValue`, `v3LoanModel.newValue`.

---

## Audit Trail API

```
POST /encompass/v3/loans/{loanId}/auditTrail
```

Documented query/body parameters include:

| Parameter | Purpose |
|-----------|---------|
| `start` / `limit` | Pagination |
| `includeHistoricalData` | Historical scope |
| `ignoreInvalidFields` | Tolerance for invalid field IDs |

**LENDER CONFIGURABLE:** Audit Trail Database membership — fieldchange subscription does **not** require Audit Trail; EFC virtual fields require Reporting Database inclusion (official EFC guide).

---

## Who is the actor?

Webhook notifications include `meta.userId` — user or integration that triggered the change.

Audit trail entries include user context per audit contract (confirm OpenAPI for exact field names).

---

## Timeline mapping

Each `fieldChangeEvents[]` item → one timeline row:

```json
{
  "eventType": "LOAN_FIELD_CHANGED",
  "resourceType": "LOAN_FIELD",
  "resourceId": "36#2",
  "previousValue": "",
  "newValue": "John",
  "actor": "{meta.userId}",
  "source": "encompass:webhook:enhancedfieldchange",
  "encompassEventType": "enhancedfieldchange",
  "rawReference": "/encompass/v3/loans/{loanId}/enhancedFieldChange"
}
```

| Field | Internal vs official |
|-------|---------------------|
| `eventType: LOAN_FIELD_CHANGED` | **NORMALIZED INTERNAL EVENT TYPE** |
| `encompassEventType: enhancedfieldchange` | **Official** Encompass webhook eventType |
| `modifiedField` | **Official** — store in `resourceId` or `metadata.modifiedField` |
| `previousValue` / `newValue` | **Official** (EFC) |

---

## Rate lock vs loan lock

| Concept | Mechanism |
|---------|-----------|
| **Exclusive loan lock** | Resource Lock API; webhooks `lock`/`unlock`; Lock Action Log |
| **Rate lock** | Loan **field(s)** — fieldchange/EFC; field IDs **LENDER CONFIGURABLE** |

Do not conflate in timeline — use `LOAN_LOCK_CHANGED` for exclusive lock and `LOAN_FIELD_CHANGED` (or internal `LOCK_CHANGED`) for rate lock fields with explicit field ID mapping.

---

## Cascaded fields

Official: `fieldchange` may include **cascaded** derived field updates in the same event. Emit one timeline row per `fieldChangeEvents` item — do not collapse.

---

## Production constraints (official)

- EFC fires on **all** field changes — high volume; read EFC setup guide before subscribing
- Webhook may **not deliver** if triggering loan create/update payload > **250 KB** (release note — verify current release)
- Invalid filter attributes **silently ignored** (max 50)
- Virtual fields for EFC require Reporting Database

---

## Reconciliation pattern

```
Webhook received
  → dedupe on eventId
  → optionally GET meta.resourceRef
  → map field IDs to dashboard columns
  → insert LOAN_FIELD_CHANGED rows
  → periodic auditTrail backfill for gaps
```

**Never** treat webhook as sole source of truth without GET reconciliation (official integration guidance).

---

## Field Change vs Comment in UI

| Show as | Content |
|---------|---------|
| Field change row | "Loan Amount: $380,000 → $400,000" |
| Comment row | Free-text annotation on object |

Filtering `communication type = comments` must **exclude** field change events.

---

## John Smith example

Borrower first name set to John:

- EFC: `modifiedField: "36#2"`, `newValue: "John"`
- Timeline: `LOAN_FIELD_CHANGED` with field label resolved from your field dictionary

Loan amount changed to $400,000:

- Same pattern — different `modifiedField`

---

## References

- [02-apis/field-change-api.md](../02-apis/field-change-api.md)
- [EFC Webhook Features and Usage Notes](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes)
- [V3 Pull Loan Field Audit Data](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-pull-loan-field-audit-data)
