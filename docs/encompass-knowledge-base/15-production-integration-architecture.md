# 15 — Production Integration Architecture

> **Official sources:** [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) · [API Keys](https://developer.icemortgagetechnology.com/developer-connect/docs/get-an-api-key) · [Loan Locks](https://developer.icemortgagetechnology.com/developer-connect/docs/loan-locks-bp) · [Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1) · [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) · [Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) · [SDK to API Migration](https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide)

Architecture patterns for banks integrating Encompass Developer Connect into regulated production environments.

---

## Authentication and API keys

### OAuth 2.0 flows

Source: [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication).

| Flow | Typical use | Lender vs ISV |
|------|-------------|---------------|
| **Authorization Code** | User-present UI integrations, SSO | Lenders (SSO: `grant_type=authorization_code`) |
| **Resource Owner Password** | Server-to-server with user context | Lenders (`grant_type=password`) |
| **Client Credentials** | Partner integrations, token exchange base | **ISV partners only** — lenders must use password grant |
| **Token Exchange** | User impersonation | Lenders with password grant |

**Token endpoint:** `POST https://api.elliemae.com/oauth2/v1/token`

**Scope:** `lp` (Lending Platform)

**Client authentication:** HTTP Basic with Base64(`client_id:client_secret`) from API key.

### API key management

| Practice | Rationale |
|----------|-----------|
| Provision via Encompass super administrator | API key ties to persona and instance |
| Treat `client_secret` as password — never share externally | Official security warning on auth docs |
| Rotate via API Key Management; old secret expires immediately | Plan coordinated rollout |
| Separate keys per environment (UAT `concept.api.elliemae.com` vs prod) | Prevent cross-environment leakage |
| Store secrets in AWS Secrets Manager / Parameter Store | No secrets in code or CI logs |

### User impersonation

Privileged users can exchange tokens to act as another Encompass user ([User Impersonation Guide](https://developer.icemortgagetechnology.com/developer-connect/docs/user-impersonation)). Use when audit requires actions attributed to a specific loan officer or processor persona.

---

## V1 vs V3 API strategy

Source: [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management).

| Aspect | V1 | V3 |
|--------|----|----|
| Loan contract | Legacy flat contract | Entity-classified schema (fixed/variable collections, editable/system logs) |
| Recommendation | Legacy integrations, some pipeline/move operations | **Preferred** for create/update loan, eFolder, enhanced conditions |
| `resourceRef` in webhooks | May reference `/encompass/v1/loans/{id}` | Often `/encompass/v3/loans/{id}` |
| Coexistence | V1 and V3 eFolder APIs can be used together | V3 backward compatible for documents |

**Migration pattern:** Replace SDK polling with webhooks + targeted V3 GET/PATCH ([SDK to API Migration Guide](https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide)).

**Field values in EFC:** `encompass` and `v3LoanModel` blocks may differ (e.g. Y/N vs true/false) — reconcile using the representation your integration writes.

---

## Loan locks and concurrency

Source: [Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1), [Loan Locks BP](https://developer.icemortgagetechnology.com/developer-connect/docs/loan-locks-bp), [Desktop Shared Lock](https://developer.icemortgagetechnology.com/developer-connect/docs/encompass-desktop-shared-lock-and-restricted-operations).

### Lock types (V3)

| lockType | Behavior |
|----------|----------|
| `exclusive` | Only lock holder can write; others read-only. Use carefully — blocks users and APIs. |
| `NGSharedLock` | Allows API updates while app user has loan open; merge on save; last update wins on conflict |
| `NGSharedLock` + `restricted: true` | Desktop shared lock (26.1+); certain ops return 409 Conflict |

### When to request explicit locks

> Resource lock requests are only required when you need to hold a lock through **multiple API calls**; otherwise a session-less lock applies for the duration of a single API call.

**V3 endpoints:**

- `GET /encompass/v3/resourceLocks`
- `GET /encompass/v3/resourceLocks/{lockId}`
- `POST /encompass/v3/resourceLocks`
- `DELETE /encompass/v3/resourceLocks/{lockId}`

### Webhook-assisted lock strategy

Subscribe to Loan `lock` / `unlock` events to reduce polling, but:

- Notifications are **not real-time**
- Intervening locks possible between notification and your lock attempt
- Always handle **409 Conflict** and exclusive-lock errors with retry + backoff

### Restricted operations (desktop open)

While loan open in Encompass desktop with restricted NGShared lock:

- V1 Create/Delete Borrower Pair — prohibited
- V1 Swap/Move Borrowers — prohibited
- API returns **409 Conflict**

---

## Concurrency model for bank integrations

```
┌──────────────┐     webhook      ┌─────────────────┐
│  Encompass   │ ───────────────► │ Ingestion (SQS) │
│  (many users)│                  └────────┬────────┘
└──────────────┘                           │
       │                                   ▼
       │         ┌──────────────────────────────────────┐
       │         │ Per-loan partition / optimistic lock │
       │         │ - SQS messageGroupId = loanId        │
       │         │ - DB row version or updatedAt check  │
       └────────►│ - Explicit resourceLock if multi-PATCH│
                 └──────────────────────────────────────┘
```

| Pattern | Use when |
|---------|----------|
| Per-loan queue partition | Prevent parallel workers corrupting same loan |
| Optimistic concurrency | Single-field updates with EFC previous/new validation |
| Explicit exclusive lock | Multi-step business transaction across several API calls |
| Idempotent PATCH | Safe retry after timeout |

---

## Idempotency

| Layer | Key | Notes |
|-------|-----|-------|
| Webhook ingestion | `(instanceId, eventId)` | Official dedup identifier |
| EFC chunks | `(instanceId, chunkId)` + all parts `1/x…x/x` | Different `eventId` per chunk |
| Business operations | `(loanId, operationType, businessKey)` | e.g. conditionId, packageId, tradeId |
| API retries | Same PATCH body | V3 update should be safe to retry for scalar fields |

Return HTTP 200–499 to ICE after **durable enqueue**, not after downstream core banking commit — separate idempotency for external systems.

---

## Audit and observability

| Signal | Capture |
|--------|---------|
| `meta.userId` | Who triggered change in Encompass |
| `meta.payload.correlationId` | Transaction correlation when present |
| `eventTime` vs processing time | Lag monitoring |
| `Elli-SubscriptionId` | Which subscription received event |
| OAuth token subject | Which API user performed reconciliation GET/PATCH |
| Resource lock events | Lock contention audit trail |

**Pipeline caveat:** [Loan Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-pipeline) reads Reporting Database asynchronously — not suitable for immediate post-webhook verification of all fields.

---

## PII and data protection

| Source of PII | Mitigation |
|---------------|------------|
| EFC webhooks | Full loan field changes including SSN, names — persona-gated |
| Loan GET `view=full` | Largest payload; includes logs — avoid unless required |
| Webhook raw store | Encrypt at rest; restrict IAM |
| Operational DB | Store GUIDs + non-PII indexes; fetch PII on demand |
| Logs | Never log raw webhook bodies in application logs |

Official: [EFC Access Controls](https://developer.icemortgagetechnology.com/developer-connect/docs/efc-webhook-access-controls-to-data).

---

## Retention

ICE documentation does not specify webhook event retention periods for lender-side storage. Bank policy should define:

| Data class | Typical regulatory driver |
|------------|---------------------------|
| Raw webhook payloads | SOC audit, dispute resolution (often 7 years mortgage) |
| Dedup index (`eventId`) | Min retention = max ICE exponential retry window (8h) + processing lag; practical: 30–90 days |
| Operational loan snapshots | Loan servicing / HMDA retention rules |
| API audit logs | FFIEC / internal policy |

Webhook **history API** (`GET /webhook/v1/events`) may support operational replay — confirm current behavior in [Webhook reference](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook).

---

## Bank integration patterns

### Pattern A — Event-driven reconciliation (recommended)

1. Webhook triggers work item
2. `GET` `resourceRef` or domain API
3. Upsert operational store
4. Emit to core systems

**Pros:** Always aligned with Encompass truth. **Cons:** Higher API volume for EFC-heavy instances.

### Pattern B — EFC-direct for field sync

1. Subscribe to `enhancedfieldchange` only
2. Apply `fieldChangeEvents` to downstream field map
3. Periodic full reconciliation job

**Pros:** Lower GET volume. **Cons:** Chunk assembly, PII exposure, no filter — all fields fire.

### Pattern C — Filtered change subscriptions

1. Multiple `change` / `fieldchange` subscriptions (≤50 attributes each)
2. Route by `Elli-SubscriptionId` to workflows ([Webhooks BP](https://developer.icemortgagetechnology.com/developer-connect/docs/webhooks-bp))

**Pros:** Precise triggers. **Cons:** Subscription sprawl toward 25 limit.

### Pattern D — Hybrid disclosure tracking

1. `DocumentOrder` webhooks for async disclosure steps
2. Loan `document` / `condition` for eFolder linkage
3. `DocumentDelivery` for eDelivery package status

**Pros:** Matches disclosure workflow boundaries. **Cons:** Multiple handlers must correlate on `loanId`.

### Pattern E — Correspondent / trades

1. `Trade` webhooks for capital markets
2. Loan `update` for loan-level field changes on assigned loans

---

## Environment topology

| Tier | API base | Webhook endpoint |
|------|----------|------------------|
| UAT | `https://concept.api.elliemae.com` | Separate URL; separate subscriptions |
| Production | `https://api.elliemae.com` | Production ALB + WAF |

**Never** share signing keys or subscriptions across environments.

---

## Production checklist

| Item | Verified |
|------|----------|
| ≤25 webhook subscriptions; unused removed | |
| Exponential backoff on critical subscriptions | |
| Signature validation on every request | |
| 200 response < 30s (ICE timeout) | |
| Per-loan concurrency control | |
| Lock/unlock + 409 handling | |
| PII encryption and persona review for EFC | |
| API secret rotation runbook | |
| ICE bad-subscription monitoring (5xx rates) | |
| UAT parity for event subscriptions | |
