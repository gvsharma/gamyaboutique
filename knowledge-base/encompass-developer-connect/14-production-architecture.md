# 14 — Production Architecture

**Share this file when:** reviewing bank integration design, security, or operability.

**Related:** [12 Webhooks](./12-events-and-webhooks.md) · [13 EFC](./13-enhanced-field-change.md) · [16 Timeline](./16-normalized-communications-timeline.md) · [17 Golden rules](./17-golden-rules.md)

---

## Recommended conceptual architecture

```text
                    ENCOMPASS
                        |
                    Webhooks
                        |
                  API Gateway
                        |
                 Webhook Receiver
                        |
                Signature Validation
                        |
                       SQS
                        |
                 Event Processor
                        |
            +-----------+-----------+
            |                       |
       Raw Event Store        Current State
            |                       |
           S3                   Aurora/DynamoDB
            |
        Analytics
```

This is a **conceptual** pattern. Substitute equivalent managed services if the bank standard is not AWS. Keep the properties below.

## Integration properties

The integration should be:

- **idempotent** — duplicates must not double-apply
- **asynchronous** — the HTTP receiver should ack quickly
- **observable** — metrics, traces, dead-letter queues, dashboards
- **replayable** — raw events (when retained) can be reprocessed
- **auditable** — who/what/when for compliance reviews
- **secure** — signing keys, TLS, least privilege, secrets management
- **PII-aware** — field-level sensitivity; redacted logs
- **tolerant of duplicate/delayed events** — out-of-order is normal

## Receiver vs processor

| Component | Responsibility |
|-----------|----------------|
| API Gateway + Webhook Receiver | Auth/signature, schema sanity, persist envelope, enqueue, 2xx quickly |
| Queue (SQS or equivalent) | Buffer, retry, isolation from Encompass retry storms |
| Event Processor | Dedup, fetch current resource, map to domain, write projections |
| Raw Event Store | Immutable notification bodies for audit/replay |
| Current State store | Normalized loan/task/condition/document projections |
| Analytics | SLA, bottlenecks, volumes — preferably on de-identified or minimized data |

## Fetch current state when required

Do not build the system of record solely from webhook bodies.

After processing a notification, fetch:

- loan `entity` or a specific entity collection
- logs via `view=log` or dedicated log APIs
- conditions, tasks, documents via their resource APIs

Choose views carefully. Do not default to `full`. See [03 Loans](./03-loans.md).

## Security and PII

- Validate webhook signatures with the subscription signing key.
- Rotate keys per ICE/bank policy.
- Encrypt raw payloads if they contain PII.
- Do not log full EFC payloads in application logs.
- Restrict who can replay events.

## Failure handling

- Retry with backoff on Encompass API rate limits / 5xx.
- Dead-letter poison messages; alert; do not block the queue.
- Record processor success/failure against `eventId` + `loanId`.
- Provide a manual or scheduled reconciliation job (loan list vs projection).

## Official documentation

- [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- Bank cloud/security standards (internal) — this architecture must fit those, not the reverse
