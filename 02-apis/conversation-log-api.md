# Conversation Log API

## Business Purpose

Create and retrieve **conversation log** entries tracking communications with customers, partners, and vendors, including follow-up alerts.

## Mortgage Use Case

Sarah logs phone call: "Spoke with borrower about large deposit." with optional follow-up alert for donor letter.

## Official Documentation

- [Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conversation-log-1)
- [V3 Create Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/create-conversation-log)
- [Get All Conversation Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-conversation-logs)
- [V1 Get a Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-conversation-log)

## API Version

**V3** (create) | **V1** (read list/single)

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| Create/manage | PATCH | `/encompass/v3/loans/{loanId}/conversationlogs` |
| List logs | GET | `/encompass/v1/loans/{loanId}/conversationLogs` |
| Get log | GET | `/encompass/v1/loans/{loanId}/conversationLogs/{logId}` |

Also included in **V3 Get Loan** with `view=logs|full` as editable log collection.

## Authentication

Bearer OAuth2.

## Path Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `loanId` | Yes | Loan GUID |
| `logId` | Yes | Log ID (V1 get) |

## Field Reference (from V3 schema / contracts)

| Field | Type | R/W | Meaning | Mortgage Significance | Configurable? |
|-------|------|-----|---------|----------------------|---------------|
| `id` | string | R | Log entry ID | Primary key | No |
| `comments` | string | RW | Conversation text | Call/email summary | No |
| `commentList[]` | array | RW | Structured comments | Threaded notes | No |
| `name` | string | RW | Contact name | John Smith | No |
| `company` | string | RW | Contact company | — | No |
| `phone` / `email` | string | RW | Contact info | — | No |
| `dateUtc` | datetime | RW | Conversation date | Timeline | No |
| `updatedDateUtc` | datetime | R | Last update | Sync | No |
| `isEmailIndicator` | boolean | RW | Email-related flag | Filter emails | No |
| `alerts[]` | array | RW | Follow-up alerts | SLA reminders | No |
| `alerts.dueDate` | datetime | RW | Follow-up due | Becomes alert when expired | No |
| `alerts.role` | EntityRef | RW | Assigned role | Processor queue | **LENDER CONFIGURABLE** |

LogCommentContract on `commentList`: `comments`, `forRole`, `addedBy`, `addedDate`, `reviewedBy`, `reviewedDate`

## Relationships

Conversation Log → Loan (editable log) | Distinct from Condition/Task/Document comments

## Lifecycle

Create entry → optional follow-up alert → alert fires when due date expires (official behavior)

## Errors

V1 Get: `400` documented.

## Webhooks

Dedicated conversation log webhooks: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION**. May appear in loan `update` events.

## Permissions

Editable log — persona allowing conversation log access.

## Locking

Inherits loan lock on create via loan APIs.

## Version Dependencies

Dedicated V3 endpoints for full CRUD "incrementally" per loan-management overview.

## Production Considerations

- Do not confuse with HTML Email Logs (system log, read-only via Get Loan logs)
- Sync via `view=logs` vs V1 list — choose one canonical path

## Common Developer Mistakes

- Treating conversation logs as loan-level "Notes" API
- Expecting fieldchange webhooks for log entries (logs lack Field IDs)

## Real Loan Example

PATCH create conversation log after borrower call during processing.

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompass/v1/loans/${LOAN_ID}/conversationLogs" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- V1 read vs V3 create — unified model in our DB?
- How do we display alerts vs completed follow-ups?
