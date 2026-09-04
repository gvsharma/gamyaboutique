# 15 — Production integration architecture

**Related:** [13 Webhooks](./13-webhooks-events.md) · [03 EFC](./03-loan-schema-and-fields.md) · [16 Product engineering](./16-bank-product-engineering.md)

**Official constraints used here:** webhook POST JSON, `eventId` uniqueness intent, delayed delivery, Get current resource via `resourceRef` / V3 GETs, loan locks, OAuth bearer tokens.

---

## A. Business meaning

A bank integration must remain correct when Encompass is slow, duplicated, out of order, or partially configured per lender.

Required properties: **idempotent, asynchronous, replayable, observable, auditable, secure, PII-aware, duplicate/delay tolerant.**

## B. John Smith

Mike saves 1003 data (many EFC rows). Sarah uploads two PDFs (`attachment` + `document`). Robert adds a condition (`condition` create + later comment + tracking). Lisa sends LE (Document Order/Delivery + tracking). Your system must not double-apply any of those if ICE retries the POST.

## C. Master runtime diagram

```text
                    ENCOMPASS
                        |
                    Webhooks (signed POST)
                        |
                  API Gateway
                        |
           Webhook Receiver (Lambda or Spring Boot)
                        |
                Signature validation
                eventId dedupe
                persist raw envelope
                        |
                       SQS
                        |
                 Event Processor (worker)
                        |
            +-----------+-----------+
            |                       |
       Raw Event Store        Current State
            |                       |
           S3                   Aurora and/or DynamoDB
            |
        Analytics / downstream banking systems
```

Substitute Azure/GCP equivalents if required. Keep the **stages**.

## D–F. Receiver contract

```http
POST /webhooks/encompass
Content-Type: application/json
```

Validate signing key (**confirm current ICE signature scheme on docs**). Respond **2xx quickly**. Never call Encompass APIs synchronously inside the webhook request thread if that risks timeout.

OAuth for outbound GETs: bearer access token ([Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication)).

Locks: session-less lock for single GET is enough; multi-PATCH needs resource lock APIs.

## G. What to store

| Store | Contents | Why |
|-------|----------|-----|
| Raw | Full webhook JSON | Replay, audit |
| Dedupe | eventId | Idempotency |
| Operational | loan/condition/task/document projections | UX, downstream |
| Secrets | client_id/secret, signing keys | Rotate |

## H. Processing lifecycle (mandatory)

1. Receive event  
2. Validate signature  
3. Deduplicate `eventId`  
4. Persist raw event  
5. Queue  
6. Process asynchronously  
7. Retrieve current resource if needed  
8. Update downstream state  
9. Record processing result  

## I. Events

Subscribe only to resources you will process. EFC = high volume. Skip internal-only events. Treat beta/limited as non-blocking unless licensed.

## J. Java / Spring + AWS sketch (illustrative)

- API Gateway → Spring `WebhookController` or Lambda
- SQS + DLQ
- Worker uses `WebClient` to `GET https://api.elliemae.com/encompass/v3/loans/{id}?view=entity`
- Outbox pattern for downstream publishes
- Micrometer metrics: receive, duplicate, process_fail, get_loan_latency

## K. Production concerns

| Concern | Practice |
|---------|----------|
| Concurrency | Loan locks; optimistic version on your projection |
| Duplicates | eventId unique constraint |
| Retries | Worker retries + DLQ; ICE may also retry POSTs |
| Stale data | GET after event |
| PII | Encrypt S3; redact logs; EFC samples include sensitive values |
| Audit | Raw store + processor result |
| Retention | Bank policy; ICE retention **NOT ESTABLISHED** here |
| Authorization | Least-privilege API user; impersonation audited |
| Throttling | **Confirm current ICE rate-limit docs**; backoff on 429/5xx |
| Pagination | Task/document lists |
| Large payloads | EFC; do not log bodies |
| Eventual consistency | Dashboards show “as of last successful GET” |
| Reconciliation | Nightly pipeline vs projection by loanId |

## L. Common mistakes

1. Synchronous Encompass GET in the webhook handler.
2. No DLQ.
3. Using `view=full` in the worker hot path.
4. No replay from raw store.

## M. Questions

1. What is your idempotency key if `eventId` were reused? (ICE says unique — still design the table.)
2. How do you reprocess one loan from S3?
3. How do lock webhooks reduce polling without removing retries?
