# Document Order API (Encompass Docs)

## Business Purpose

Generate opening, closing, and on-demand form document packages for a loan — async doc set creation with compliance audit support.

## Mortgage Use Case

Lisa generates Closing Doc Set for John Smith purchase; polls order status before delivery.

## Official Documentation

- [Send Encompass Docs Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/send-docs)
- [Workflows — Document Orders](https://developer.icemortgagetechnology.com/developer-connect/docs/workflows-1)
- [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages)
- [Generate Opening Doc Set](https://developer.icemortgagetechnology.com/developer-connect/reference/generate-opening-doc-set)
- [Get Opening Order Status](https://developer.icemortgagetechnology.com/developer-connect/reference/get-order-status)

## API Version

**V1** — base path `/encompassdocs/v1/`

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| Get plan codes | GET | `/encompassdocs/v1/planCodes` |
| Evaluate plan code | POST | `/encompassdocs/v1/planCodes/{planCodeID}/evaluator` |
| Audit opening | POST | `/encompassdocs/v1/documentAudits/opening` |
| Audit closing | POST | `/encompassdocs/v1/documentAudits/closing` |
| Generate opening order | POST | `/encompassdocs/v1/documentOrders/opening` |
| Opening order status | GET | `/encompassdocs/v1/documentOrders/opening/{orderId}` |
| Add docs to opening | POST | `/encompassdocs/v1/documentOrders/opening/{orderId}/documents` |
| Generate closing order | POST | `/encompassdocs/v1/documentOrders/closing` |
| Closing order status | GET | `/encompassdocs/v1/documentOrders/closing/{orderId}` |
| Add docs to closing | POST | `/encompassdocs/v1/documentOrders/closing/{orderId}/documents` |
| Generate forms order | POST | `/encompassdocs/v1/documentOrders/forms` |
| Get print order | GET | `/encompassdocs/v1/documentOrders/ondemand/{orderId}` |

Related: `GET /encompass/v3/loans/{loanId}/recipients` — recipients and auth codes

## Authentication

Bearer OAuth2.

## Async Flow (Official)

1. Generate doc set → returns **Doc Set ID** / order ID
2. Poll status or subscribe to Document Order webhooks
3. Optionally add eFolder documents to order
4. Send delivery (separate API — [document-delivery-api.md](./document-delivery-api.md))

## GET Opening Order Status — Usage Notes (Official)

- **Only user who created order** can retrieve status
- If `difference: "removed"` on any document after regeneration → **exclude** those documents from delivery request

## difference Attribute (Official — 23.2+)

| Value | Meaning |
|-------|---------|
| NoDiff | No changes |
| Diff | Changes exist |
| Removed | Document removed from regenerated set |

## Field Reference

| Field | Meaning | Mortgage Significance |
|-------|---------|----------------------|
| orderId / doc set id | Order identifier | Poll key |
| auditId | Compliance audit reference | Opening/closing audit step |
| difference | Regeneration delta | Pre-delivery validation |

Full request bodies: `orderDocumentInput` etc. — per Generate Opening Doc Set OpenAPI.

## Relationships

Document Order → Disclosure Tracking log (on delivery) | Document Order → eFolder documents (on delivery)

## Lifecycle

Plan code → audit (optional opening / included closing) → generate → add docs → deliver

## Errors

Generate Opening: `401`, `403`, `500` documented.

## Webhooks

[Document Order webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order)

## Permissions

Consumer Connect site required for opening packages (workflows guide). eClose required for closing.

## Version Dependencies

Mavent audit on closing included; opening audit optional.

## Production Considerations

- Async — never block UI on generate call
- Handle regeneration `removed` documents before delivery

## Common Developer Mistakes

- Including removed documents in delivery payload
- Wrong user polling order status

## Real Loan Example

Lisa POST closing generate → poll GET closing/{orderId} until ready → deliver.

## cURL Example

```bash
curl -s "https://api.elliemae.com/encompassdocs/v1/documentOrders/opening/${ORDER_ID}" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Questions an Architect Should Ask

- Webhook vs poll for order completion?
- How do we store auditId and orderId correlation?
