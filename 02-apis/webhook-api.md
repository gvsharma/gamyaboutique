# Webhook Subscriptions API

## Business Purpose

Register and manage webhook subscriptions so Encompass pushes real-time event notifications to HTTPS endpoints.

## Mortgage Use Case

Dashboard subscribes to Loan `milestone`, `condition`, and `enhancedfieldchange` events; worker processes queue and refreshes John Smith loan cache.

## Official Documentation

- [Webhooks Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
- [Subscriptions](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions)
- [Resources](https://developer.icemortgagetechnology.com/developer-connect/reference/resources)
- [Create a Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-subscription)
- [Default Payload Attributes](https://developer.icemortgagetechnology.com/developer-connect/reference/default-payload-attributes)
- [Signing Keys](https://developer.icemortgagetechnology.com/developer-connect/reference/signing-keys)
- [Custom Authorization](https://developer.icemortgagetechnology.com/developer-connect/reference/custom-authorization)

## API Version

**V1** — `/webhook/v1/`

## Endpoints

| Operation | Method | Path |
|-----------|--------|------|
| List subscriptions | GET | `/webhook/v1/subscriptions` |
| Create subscription | POST | `/webhook/v1/subscriptions` |
| Get subscription | GET | `/webhook/v1/subscriptions/{subscriptionId}` |
| Update subscription | PUT | `/webhook/v1/subscriptions/{subscriptionId}` |
| Delete subscription | DELETE | `/webhook/v1/subscriptions/{subscriptionId}` |
| List resources | GET | `/webhook/v1/resources` |
| Get resource | GET | `/webhook/v1/resources/{name}` |
| List resource events | GET | `/webhook/v1/resources/{resourceName}/events` |
| List event history | GET | `/webhook/v1/events` |
| Get event | GET | `/webhook/v1/events/{eventId}` |

## Authentication

Bearer OAuth2 for subscription management. Inbound notifications validated via **signingkey** signature header.

## Subscription Object (Documented Fields)

| Field | Required | Description |
|-------|----------|-------------|
| `endpoint` | Yes (create) | HTTPS callback URL |
| `signingkey` | No | 32–64 chars; complexity rules apply; default generated if omitted |
| `enableSubscription` | No | boolean, default true |
| `resource` | Yes | e.g. `Loan` |
| `events[]` | Yes | Event names for resource |
| `filters.attributes[]` | No | Max 50 — for `change`/`fieldchange` |
| `deliveryPolicy.backoff` | No | Retry policy |

### Signing Key Rules (Official)

Min 32, max 64 chars; upper+lower+alpha+numeric+special from `!@#$^&*`; no spaces.

## Notification Payload (All Events)

| Field | Description |
|-------|-------------|
| `eventId` | Unique — use for idempotency |
| `eventTime` | ISO 8601 |
| `eventType` | Event name |
| `meta.userId` | Acting user |
| `meta.resourceType` | Resource type |
| `meta.resourceId` | e.g. loan GUID |
| `meta.instanceId` | Encompass instance |
| `meta.resourceRef` | URL to GET current resource |
| `meta.payload` | Extra payload when supported |

## Webhook Resource Categories (Official)

| Category | Reference |
|----------|-----------|
| Loan | [wbhks-re-cat-loan](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) |
| Document Order | wbhks-re-cat-doc-order |
| Document Delivery | wbhks-re-cat-doc-delivery |
| Enhanced Conditions | wbhks-re-cat-enhanced-conditions |
| Orgs and Users | wbhks-re-cat-orgs-users |
| EPC | wbhks-re-cat-partner-connect |
| Schedulers | wbhks-re-cat-schedulers |
| Trades | wbhks-re-cat-trades |
| Workflow Tasks | wbhks-re-cat-workflow-tasks |
| DDA | wbhks-re-cat-dda (limited) |

## Relationships

Subscription → Resource → Events → Consumer GET resourceRef

## Errors

**401** on subscription endpoints. Undeliverable subscriptions auto-deleted (maintenance policy).

## Pagination

GET `/webhook/v1/events` — query history; params per OpenAPI.

## Permissions

Multiple subscriptions per resource allowed; **cannot overlap in a domain** (official).

## Production Considerations

- Verify signature on every inbound POST
- HTTPS endpoint required
- Monitor subscription health — ICE deletes bad endpoints
- Webhooks not guaranteed real-time (lock events note)

## Common Developer Mistakes

- Processing payload without GET reconciliation
- Overlapping subscriptions in same domain
- Weak signing keys

## Real Loan Example

POST subscription: resource=Loan, events=[milestone, condition, update], endpoint=https://dashboard.example/hooks/encompass

## cURL Example — Create Subscription (Illustrative body)

```bash
curl -s -X POST "https://api.elliemae.com/webhook/v1/subscriptions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "Loan",
    "events": ["update", "milestone", "condition"],
    "endpoint": "https://example.com/webhooks/encompass",
    "signingkey": "Abcd1234!Abcd1234!Abcd1234!Abcd1234!"
  }'
```

Body shape illustrative — confirm against Create Subscription OpenAPI.

## Questions an Architect Should Ask

- One subscription per event type or combined?
- Custom Auth required for our security team?
- Event history API for replay vs our own queue?
