# Trades API (Secondary Marketing)

## Business Purpose

Manage **correspondent trades** and **loan trades** in secondary marketing — pipeline, loan assignment, notes, documents, event history.

## Mortgage Use Case

Correspondent desk commits bulk purchase of closed loans; notes pricing exception on trade; assigns John Smith loan to trade batch.

## Official Documentation

- [Get Trade Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/get-trade-pipeline-of-correspondent-trade)
- [Create Correspondent Trade](https://developer.icemortgagetechnology.com/developer-connect/reference/create-correspondent-trade)
- [Trades Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades)

## API Version

**V1** — `/secondary/v1/`

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| Trade pipeline | POST | `/secondary/v1/tradePipeline` |
| Canonical fields | GET | `/secondary/v1/tradePipeline/canonicalFields` |
| Create trade | POST | `/secondary/v1/trades/correspondent` |
| Get/update trade | GET/PATCH | `/secondary/v1/trades/correspondent/{tradeId}` |
| Event history | GET | `/secondary/v1/trades/correspondent/{tradeId}/eventHistory` |
| Assign loans | PUT | `/secondary/v1/trades/correspondent/{tradeId}/loans` |
| Unassign loans | DELETE | `/secondary/v1/trades/correspondent/{tradeId}/loans` |
| Extend trade | PUT | `/secondary/v1/trades/correspondent/{tradeId}/loans/extend` |
| Update assigned loans | PUT | `/secondary/v1/trades/correspondent/{tradeId}/loans/update` |
| Trade notes | GET/PUT/PATCH | `/secondary/v1/trades/correspondent/{tradeId}/notes` |
| Statistics | GET | `/secondary/v1/trades/correspondent/{tradeId}/statistics` |
| Download URL | POST | `/secondary/v1/trades/downloadUrlGenerator` |
| Upload URL | POST | `/secondary/v1/trades/urlGenerator` |
| Loan trade documents | POST/PATCH | `/secondary/v1/trades/loanTrades/{tradeId}/documents` |

## Authentication

Bearer OAuth2.

## Trade Pipeline — Query Parameters (Official)

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | `correspondentTrade` or `loanTrade` |
| `view` | No | `None`, `Current`, `Archived`, `Voided` |
| `start`, `limit` | No | Pagination |
| `fields` | No | Field projection |
| `ignoreInvalidFields` | No | Ignore invalid field names |

## Request Body (Trade Pipeline)

`TradePipelineQueryContract` with `filter` (QueryCriterionContract), `sortOrder[]`, `fields[]`

## Field Reference

Use `GET /secondary/v1/tradePipeline/canonicalFields` for authoritative field definitions.

## Webhooks

[Trades webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades) — includes trade update events when notes change (official 21.3).

## Permissions

Edit Correspondent Trades persona checkbox — **LENDER CONFIGURABLE**.

## Errors

Trade pipeline: `401`, `403`, `500` documented.

## Relationships

Trade → Loans (assignment) | Trade → Notes | Separate from primary loan origination domain

## Production Considerations

- Secondary domain separate from origination dashboard unless unified investor view
- TradeId = ID (official note on notes API)

## Common Developer Mistakes

- Confusing loan trades with loan origination loanId
- Missing persona for trade mutations

## cURL Example

```bash
curl -s -X POST "https://api.elliemae.com/secondary/v1/tradePipeline?type=correspondentTrade&start=0&limit=20" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"filter": {}, "sortOrder": [], "fields": []}'
```

Illustrative empty filter — use QueryCriterionContract per OpenAPI.

## Questions an Architect Should Ask

- Does our dashboard include secondary marketing or origination only?
- Trade webhook vs pipeline poll for trade desk UI?
