# Encompass Developer Connect — Production Guidelines

## Business Purpose

Operational patterns for reliable lending dashboard integrations against Encompass in production.

## Official Documentation

- [Webhooks Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
- [SDK to API Migration Guide](https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide)
- [EFC Webhook Features and Usage Notes](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-features-and-usage-notes)
- [Deprecation and Sunset Notices](https://developer.icemortgagetechnology.com/developer-connect/docs/deprecation-and-sunset-notices)

## Recommended Architecture

```
Webhook POST → Queue → Worker → GET resourceRef → Upsert dashboard DB
                     ↓
              Dedupe by eventId
```

## API Version Strategy

| Guidance | Source |
|----------|--------|
| Prefer **V3** for new development | Loan Management, eFolder, Conditions, Milestones |
| V1 remains for some endpoints (conversation logs read, resource locks, pipeline) | Per reference catalog |
| V1 eFolder Attachment APIs sunset in **26.3** | Release notes — migrate to V3 |

See [api-version-matrix.md](./api-version-matrix.md).

## Locking

| Pattern | Detail |
|---------|--------|
| Single-call updates | Session-less lock may auto-apply |
| Multi-call workflows | Acquire lock via `/encompass/v3/resourceLocks`; pass `lockId` on PATCH loan/milestone |
| Lock webhooks | Not real-time — still implement lock retry |

## Data Freshness

| Source | Trust level |
|--------|-------------|
| Webhook payload | Signal only — may be partial |
| GET `meta.resourceRef` | Authoritative current state |
| System logs | Historical, append-only |

## Persona and Permissions

- Integration user persona determines readable/writable fields
- Admin operations (users, settings) require Administrator/Super Administrator or specific Settings personas
- Never assume one integration user can perform all mortgage roles

## Webhook Operations

- Verify notification signature using subscription `signingkey`
- Monitor subscription health — ICE deletes bad endpoints
- Subscriptions cannot overlap in a domain
- `enhancedfieldchange`: subscribe only after reading EFC setup guide; fires on **all** field changes

## Disclosure and Document Order

- Document delivery is **async** — poll order status or use Document Order webhooks
- Regenerated doc sets: exclude documents with `difference: "removed"` from delivery
- Consumer Connect site required for opening packages (official workflows guide)

## Enhanced Conditions

- Check `loan.useEnhancedConditionIndicator` before calling condition APIs
- Enhanced Conditions require Encompass **20.2+** and lender setup

## Rate and Payload Limits

- Field change webhooks may not deliver when triggering payload > **250 KB** (documented release note issue; check current release for resolution)
- Get Loan `view=full` is largest payload — avoid for routine sync

## Common Developer Mistakes

- Building dashboard state from webhook payload alone
- Calling Enhanced Condition APIs on standard-condition loans
- Using sunset V1 attachment APIs
- Ignoring persona field omission on GET loan

## Questions an Architect Should Ask

- What is our reconciliation schedule for webhook drift?
- Which API version is canonical per domain object in our data model?
- How do we handle lock contention in high-touch loan workflows?
- What is our strategy for V1 sunset migrations?
