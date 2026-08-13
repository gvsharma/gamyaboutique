# Encompass Partner Connect (EPC) API

## Business Purpose

**EPC** integrates third-party partner services with Encompass via service orders and partner webhooks.

## Mortgage Use Case

Appraisal ordered through EPC partner → ServiceOrder fulfilled webhook → dashboard updates appraisal status.

## Official Documentation

- [EPC Webhook Category](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect)
- Partner Connect docs: [partnerconnect.elliemae.com](https://docs.partnerconnect.elliemae.com/partnerconnect/docs/webhooks)

## API Version

**Webhook V1** | Partner REST APIs partially documented on Partner Connect portal

## Webhook Resources (Official)

| Resource | Notes |
|----------|-------|
| `ServiceOrder` | Events when ordered via EPC (e.g. `fulfilled`) |
| `Transaction` | EPC partners only |

Extra payload includes `partnerId`, `productId`, `productListingName` (official webhook category pages).

## REST Endpoints

Loan-scoped service order REST endpoints: **partial documentation** on Developer Connect — consult Partner Connect portal for authoritative service order API.

Enhanced condition `sourceOfCondition` values include `PartnerConnect (Service-to-Service only)` (official Enhanced Condition contract).

## Authentication

Partner and lender credentials per EPC onboarding — see Partner Connect documentation.

## Relationships

ServiceOrder → Loan | PartnerConnect → Enhanced Conditions (automated)

## Webhooks

Subscribe via `/webhook/v1/subscriptions` with EPC resource types per Resources API.

## Production Considerations

- EPC events only when service ordered through EPC (official note)
- Partner-facing vs lender-facing credentials differ

## Common Developer Mistakes

- Expecting EPC webhooks for non-EPC service orders
- Using Developer Connect alone without Partner Connect portal docs

## Questions an Architect Should Ask

- Which partners are EPC-enabled in our lender instance?
- Do we need Partner Connect API credentials separate from Developer Connect?
