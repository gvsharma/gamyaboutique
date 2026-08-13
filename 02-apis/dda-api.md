# Data & Document Automation (DDA) API

## Business Purpose

**DDA** (formerly AIQ) provides document automation and analyzer capabilities with webhook notifications for DDA customers.

## Mortgage Use Case

Analyzer validates income document → `AnalyzerResult` webhook → processor task auto-completed on pass.

## Official Documentation

- [DDA Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-dda)

## API Version

**Webhook V1** — **Limited availability** (DDA customers only; contact CSM/RM per official note)

## Webhook Resources (Official)

| Resource | Description |
|----------|-------------|
| `AnalyzerDocumentValidationResult` | Document validation results |
| `AnalyzerResult` | Analyzer output |
| `DataSource` | Data source events |
| `Document` | Document events |
| `eFolder` | eFolder events |
| `ReceivedMailItem` | Received mail processing |

Exact event names per resource: see wbhks-re-cat-dda reference page.

## REST Endpoints

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** on Developer Connect for DDA REST CRUD — webhook catalog primary integration surface reviewed.

## Side Effect on Loan Webhooks (Official)

When DDA enabled, Smart Client loan updates may also trigger Loan resource webhook events (loan webhook category note).

## Authentication

DDA subscription requires DDA entitlement — **LENDER CONFIGURABLE** / contractual.

## Production Considerations

- Confirm DDA entitlement before building DDA webhook handlers
- Limited availability — not all environments expose DDA resources

## Common Developer Mistakes

- Subscribing to DDA resources without customer entitlement
- Assuming DDA REST parity with webhook resources

## Questions an Architect Should Ask

- Is our lender instance DDA-enabled?
- Which AnalyzerResult fields do we persist vs display inline?
