# Disclosure Tracking (2015) API

## Business Purpose

Manage RESPA-TILA disclosure timelines, tracking dates, history, and snapshots for loans originated on or after October 3, 2015.

## Mortgage Use Case

Initial LE delivery creates disclosure tracking log; revised LE adds new log entry; CD log tracks closing disclosure compliance for John Smith loan.

## Official Documentation

- [Disclosure Tracking (2015)](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015)
- [V3 Get List of Disclosure Tracking Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-list-of-disclosure-tracking-logs)
- [V3 Get a Disclosure Tracking Log](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-disclosure-tracking-log-1)
- [V3 Add a Disclosure Tracking Log](https://developer.icemortgagetechnology.com/developer-connect/reference/add-a-disclosure-tracking-log)

## API Version

**V3** (primary) | **V1** (legacy read)

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| List logs | GET | `/encompass/v3/loans/{loanId}/disclosureTracking2015Logs` |
| Add log | POST | `/encompass/v3/loans/{loanId}/disclosureTracking2015Logs` |
| Get log | GET | `/encompass/v3/loans/{loanId}/disclosureTracking2015Logs/{disclosureLogId}` |
| Update log | PATCH | `/encompass/v3/loans/{loanId}/disclosureTracking2015Logs/{disclosureLogId}` |
| Get snapshot | GET | `.../{disclosureLogId}/snapshot` |
| List snapshots | GET | `.../disclosureTracking2015Logs/snapshots` |
| Email message | GET | `.../{disclosureLogId}/emailMessage` |
| Fulfillments | POST | `.../{disclosureLogId}/fulfillments` |
| Settings | GET | `/encompass/v3/settings/loan/disclosureTracking` |
| V1 list/get | GET | `/encompass/v1/loans/{loanId}/disclosureTracking2015[/{logId}]` |

## Authentication

Bearer OAuth2.

## Query Parameters

| Parameter | Description |
|-----------|-------------|
| `includeSnapshot` | Include snapshot with log (GET/POST) |
| `applicationId` | Borrower pair scope (POST) |

## Response Contract

`EnhancedDisclosureTracking2015LogContract` (official schema name on GET log reference).

## Field Reference

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as a complete field table in this knowledge base extract. Documented concepts:

| Concept | Mortgage Significance |
|---------|----------------------|
| disclosureLogId | Primary key |
| LE / CD tracking dates | TRID compliance |
| Snapshot | Point-in-time loan/disclosure state |
| UseForUCDExport | UCD automation flag (updatable on legacy logs per 22.3) |
| eConsent fields | Updatable via V3 Update Loan and Update Disclosure APIs |

Recipient viewed/completed dates added in **24.3** release notes.

## Relationships

Disclosure log ← Document Order delivery | Disclosure log → Loan | Snapshot → historical state

## Lifecycle

Create (API or delivery) → update dates/eConsent → snapshot for audit → UCD export selection

## Errors

List: `400`, `403` documented.

## Webhooks

Loan `disclosureTracking` — **API (Beta Only)** when Enhanced Disclosure Tracking log created/updated.

## Permissions

Applies to post-2015 origination loans; persona-scoped.

## Version Dependencies

V3 introduced **21.3**; legacy log update support **22.3**; snapshot enhancements **24.3**.

## Production Considerations

- Include snapshot for compliance reconstructions
- eConsent via API may not display in UI until specific release (22.3 note) — data accessible via API

## Common Developer Mistakes

- Using V1 when V3 update needed
- Confusing disclosure log with eFolder document

## Real Loan Example

GET list logs after LE delivery → display earliest LE received date on dashboard.

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompass/v3/loans/${LOAN_ID}/disclosureTracking2015Logs" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- Do we mirror full log contract or compliance date subset?
- Snapshot storage retention policy?
