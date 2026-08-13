# Encompass Developer Connect — Error Handling

## Business Purpose

Standard HTTP status codes signal request outcome. Error handling must account for auth failures, persona restrictions, resource locks, and validation errors.

## Official Documentation

- Per-endpoint OpenAPI on [Developer Connect Reference](https://developer.icemortgagetechnology.com/developer-connect/reference/)
- [V1 vs V3 APIs](https://developer.icemortgagetechnology.com/developer-connect/docs/v1-vs-v3-encompass-apis-whats-the-difference-1)

## Commonly Documented Status Codes

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| **400** | Bad Request | Invalid payload, missing required query param |
| **401** | Unauthorized | Missing/invalid/expired Bearer token |
| **403** | Forbidden | Persona lacks permission; instance ID mismatch (Workflow Tasks) |
| **404** | Not Found | Invalid loanId, milestoneId, conditionId, etc. |
| **409** | Conflict | Create loan conflict; delete task with children without `force=true` |
| **500** | Internal Server Error | Platform error — retry with backoff |

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION:** A single global error body schema across all APIs. Inspect per-endpoint OpenAPI for response schemas.

## Workflow Task-Specific Errors

Official Workflow Task API notes:

- **403** when request user `instanceId` does not match entity `instanceId`
- **409** on DELETE when child entities exist unless `force=true`

## Locking-Related Errors

Resource lock APIs (`/encompass/v1/resourceLocks`, `/encompass/v3/resourceLocks`) document lock acquisition failures when loan already locked.

Loan update without valid `lockId` when lock required: behavior per Encompass lock policy — **LENDER CONFIGURABLE**.

## Webhook Delivery Errors

Official maintenance policy: subscriptions with undeliverable endpoints (>30 days old, >1000 events/week, 5XX, timeouts) are **automatically deleted**.

## Field Reader/Writer Errors

| Parameter | Effect |
|-----------|--------|
| `ignoreInvalidFields` | Ignore invalid field IDs vs fail |
| `invalidFieldBehavior` | `Include`, `Exclude`, or `Fail` |

## Production Considerations

- Implement retry with exponential backoff for 500 and transient network errors
- Do not retry 400/403 without fixing request
- Log correlation IDs when present in webhook payloads (`meta.payload.correlationId`)
- Map 403 to operational alerts (persona misconfiguration)

## Common Developer Mistakes

- Treating 404 as "loan deleted" without checking folder move (soft delete via `move` to trash)
- Ignoring 409 on task delete (need `force=true` or delete children first)
- Retrying 401 without refreshing token
- Assuming error response JSON structure is identical across API families

## Questions an Architect Should Ask

- What is our retry policy per status code?
- How do we surface persona 403 errors to operations?
- Do we need lock retry logic independent of webhooks?
