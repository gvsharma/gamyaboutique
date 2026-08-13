# Document Delivery API (Encompass Docs)

## Business Purpose

Send committed document packages to borrowers, co-borrowers, NBOs, and settlement agents via Consumer Connect / Loan Connect.

## Mortgage Use Case

Lisa sends closing package to John Smith; on success Disclosure Tracking log and eFolder containers created; borrower receives email notification.

## Official Documentation

- [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages)
- [Workflows](https://developer.icemortgagetechnology.com/developer-connect/docs/workflows-1)
- [Send Document Package / Delivery endpoints](https://developer.icemortgagetechnology.com/developer-connect/reference/send-documents-order)

## API Version

**V1** — `/encompassdocs/v1/documentOrders/.../delivery`

## Endpoints

| Package | Method | Path |
|---------|--------|------|
| Opening delivery | POST | `/encompassdocs/v1/documentOrders/opening/{docSetOrder_id}/delivery` |
| Closing delivery | POST | `/encompassdocs/v1/documentOrders/closing/{docSetOrder_id}/delivery` |
| Forms delivery | POST | `/encompassdocs/v1/documentOrders/forms/{docSetOrder_id}/delivery` |

## Authentication

Bearer OAuth2.

## Request

Requires **docSetOrder_id** and **parties** from generate/status response (official workflows guide).

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** in this pass: complete delivery request body schema — consult Send Opening/Closing Package reference OpenAPI.

## Response

Async — returns **deliveryOrderID** (official workflows guide).

## On Successful Delivery (Official)

- Disclosure Tracking entry created in Encompass
- Document containers created in eFolder
- Recipients receive email notification (Consumer Connect / Loan Connect)
- Closing packages directed to Loan Connect for settlement agent

## Relationships

Delivery → Disclosure Tracking | Delivery → eFolder Documents | Delivery → Document Order

## Lifecycle

Generate order → confirm parties → POST delivery → poll / webhook → TRID clocks start

## Errors

Delivery fails if regenerated order includes `difference: "removed"` documents in payload (official order status notes).

## Webhooks

[Document Delivery webhook category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery)

## Permissions

Same user constraints as order creation for status; delivery persona permissions — **LENDER CONFIGURABLE**.

## Production Considerations

- Schedule Fulfillment For setting supported on opening/forms delivery (release notes)
- Async completion — do not assume synchronous eFolder update

## Common Developer Mistakes

- Delivering before order status confirms ready
- Omitting party payload from generate response

## Real Loan Example

Opening LE delivery after audit pass → POST opening delivery → monitor disclosure tracking webhook.

## cURL Example (Illustrative — body per official OpenAPI)

```bash
curl -s -X POST "https://api.elliemae.com/encompassdocs/v1/documentOrders/opening/${DOC_SET_ORDER_ID}/delivery" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d @delivery-payload.json
```

## Questions an Architect Should Ask

- How do we correlate deliveryOrderID to disclosure log ID?
- eConsent updates via disclosure PATCH — included in our flow?
