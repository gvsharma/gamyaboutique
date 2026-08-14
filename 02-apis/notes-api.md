# Notes API (Entity-Scoped)

## Business Purpose

Encompass exposes **Notes** on specific entities — not as a single global loan-file Notes API. Documented note APIs include **correspondent trade notes** and **borrower contact notes**.

## Mortgage Use Case

Secondary desk adds pricing note to correspondent trade. CRM user adds note to borrower contact record (separate from loan conversation log).

## Official Documentation

- [Get Notes (Correspondent Trade)](https://developer.icemortgagetechnology.com/developer-connect/reference/get-correspondent-trade-notes)
- [Create a Trade Note](https://developer.icemortgagetechnology.com/developer-connect/reference/create-trade-note)
- Borrower contact notes: reference page exists at [create-note](https://developer.icemortgagetechnology.com/developer-connect/reference/create-note)

## API Version

**V1** — Secondary marketing `/secondary/v1/...` | Borrower contacts `/encompass/v1/borrowerContacts/...`

## Endpoints

### Correspondent Trade Notes

| Operation | Method | Path |
|-----------|--------|------|
| Get notes | GET | `/secondary/v1/trades/correspondent/{tradeId}/notes` |
| Create note | POST | `/secondary/v1/trades/correspondent/{tradeId}/notes` |
| Manage notes | PUT/PATCH | `/secondary/v1/trades/correspondent/{tradeId}/notes` |

### Borrower Contact Notes

| Operation | Method | Path |
|-----------|--------|------|
| Create note | POST | `/encompass/v1/borrowerContacts/{contactId}/notes` |

Additional borrower contact note operations: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** in pages reviewed beyond create schema.

## Authentication

Bearer OAuth2. Trade notes require persona with Edit Correspondent Trades (official 21.3 release notes).

## Trade Note — Field Reference (TradeNoteContract)

| Field | Type | Required | R/W | Meaning | Mortgage Significance | Configurable? |
|-------|------|----------|-----|---------|----------------------|---------------|
| `id` | string | — | R | Note ID | Primary key | No |
| `details` | string | — | RW | Note text | Free-form | No |
| `createdBy` | EntityRef | — | R | Author | Audit | No |
| `createdTimeStamp` | datetime | — | R | Created time | Timeline | No |
| `entityRemove` | boolean | — | W | Delete flag | Soft delete | No |
| `timezoneAbbrev` | string | — | R | Timezone | Display | No |

## Borrower Contact Note — Field Reference (Borrowercontactnotes schema)

| Field | Type | R/W | Meaning |
|-------|------|-----|---------|
| `noteId` | string | R | Note identifier |
| `subject` | string | RW | Note title |
| `timestamp` | string | R | Created/updated UTC |
| `details` | string | RW | Note body |

## Loan-Level Notes

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** — use [Conversation Log API](./conversation-log-api.md) for loan communications.

## Relationships

Trade Note → Correspondent Trade | Borrower Contact Note → BorrowerContact (CRM)

## Webhooks

Trade note create/update/delete triggers **Trade Updated** event in trade history (official 21.3 notes).

## Permissions

Correspondent trades edit checkbox in persona — **LENDER CONFIGURABLE**.

## Production Considerations

- Model notes by parent entity type in dashboard
- Do not merge trade notes with loan conversation logs

## Common Developer Mistakes

- Searching for `GET /loans/{id}/notes` (does not exist per official docs reviewed)
- Equating notes with conversation logs

## Real Loan Example

N/A for loan file — use conversation log. Trade desk uses trade notes on correspondent commit.

## cURL Example (Trade Notes)

```bash
curl -s "https://api.elliemae.com/secondary/v1/trades/correspondent/${TRADE_ID}/notes" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- Does our dashboard need trade notes or only loan communications?
- Where do borrower contact notes surface relative to active loans?
