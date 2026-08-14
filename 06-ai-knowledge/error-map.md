# Error Map

## Purpose

HTTP errors, integration failures, and remediation patterns.

## Scope

Developer Connect API errors + dashboard ingestion errors.

## Key concepts

| HTTP | Typical cause | Classification |
|------|---------------|----------------|
| 401 | Invalid/expired OAuth token | **OFFICIAL_DOCUMENTATION** |
| 403 | Persona/permission denied | **OFFICIAL_DOCUMENTATION** |
| 404 | Resource deleted or wrong id | **OFFICIAL_DOCUMENTATION** |
| 409 | Task delete with children | **OFFICIAL_DOCUMENTATION** |
| 429 | Rate limit | **OFFICIAL_DOCUMENTATION** (handle backoff) |
| 500 | ICE server error | **OFFICIAL_DOCUMENTATION** |

## Definitions

- Webhook invalid signature → 403 at receiver — **INTERNAL_ARCHITECTURE_RECOMMENDATION**
- SQS DLQ after max retries — **INTERNAL_ARCHITECTURE_RECOMMENDATION**
- `integration_error` table — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

## Relationships

Failure handling: [05-dashboard-architecture/failure-handling.md](../05-dashboard-architecture/failure-handling.md)

## API references

[02-apis/api-error-handling.md](../02-apis/api-error-handling.md)

## Examples

Task DELETE 409 → use `force=true` if intentional — **OFFICIAL_DOCUMENTATION**

## Production notes

Do not retry 403 without permission fix — **INTERNAL_ARCHITECTURE_RECOMMENDATION**
Refresh OAuth on 401 once — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

## Common mistakes

- Treating Encompass 403 as transient — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

## FAQ

See [troubleshooting.md](./troubleshooting.md).

## Related documents

- [integration-map.md](./integration-map.md) · [observability](../05-dashboard-architecture/observability.md)

## Source references

- [02-apis/api-error-handling.md](../02-apis/api-error-handling.md) — Last verified 2026-08-13
