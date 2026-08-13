# Unified Loan Timeline — Architecture

End-to-end design for answering **"What happened on this loan?"** by aggregating Encompass sources into one chronological stream.

---

## Problem statement

Encompass stores activity across:

- Loan entity updates and **logs** (`view=logs`)
- **Conditions** (comments, tracking, status)
- **Documents** (comments, status, attachments)
- **Workflow tasks** (comments, disposition)
- **Milestones** (current state + system history)
- **Conversation logs**
- **Disclosure tracking**
- **Field changes** (webhooks + audit)
- **Delivery** and **email** system records

No single API returns this aggregate. The dashboard requires an **ingestion → normalization → timeline service** architecture.

---

## Architecture diagram

```mermaid
flowchart TB
  subgraph Encompass["Encompass Developer Connect"]
    direction TB
    L[Loan API<br/>view=entity/logs/full]
    C[Condition API V1/V3]
    T[Workflow Task API V1]
    M[Milestone API V3]
    D[Document API V3]
    CL[Conversation Log API]
    DT[Disclosure Tracking V3]
    AT[Audit Trail POST]
    EF[eFolder History GET]
    WH[Webhooks V1]
  end

  subgraph Ingestion["Ingestion Layer"]
    WHE[Webhook HTTPS Receiver]
    SCH[Scheduled Pollers]
    BF[Backfill Jobs]
    VAL[Signature Validator]
  end

  subgraph Queue["Message Queue"]
    Q[(SQS / RabbitMQ / Kafka)]
  end

  subgraph RawStore["Raw Event Store"]
    RAW[(raw_encompass_events<br/>immutable JSON)]
  end

  subgraph Normalize["Normalization Service"]
    MAP[Resource Mappers]
    DED[Dedupe eventId + source key]
    ENR[Enrich field labels / users]
  end

  subgraph TimelineDB["Loan Timeline Store"]
    TL[(loan_timeline_events<br/>indexed)]
    IDX[Full-text index]
  end

  subgraph Service["Loan Timeline Service"]
    API[Timeline REST/GraphQL]
    FIL[Filters & Search]
  end

  DASH[Lending Dashboard]

  WH --> WHE --> VAL --> Q
  L --> SCH --> Q
  C --> SCH
  T --> SCH
  M --> SCH
  D --> SCH
  CL --> SCH
  DT --> SCH
  AT --> BF --> Q
  EF --> BF

  Q --> RAW --> MAP --> DED --> ENR --> TL
  TL --> IDX
  TL --> API --> FIL --> DASH
```

---

## Component responsibilities

### Webhook receiver

- Validate signing key on every POST (official requirement)
- Return 2xx quickly; enqueue payload
- Store raw body in `raw_encompass_events` before ack

### Scheduled pollers

| Poller | Frequency | Source |
|--------|-----------|--------|
| Loan logs | 5–15 min | `view=logs` |
| Conditions | 5–15 min | `GET conditions?view=Full` (if EC) |
| Documents | 15–30 min | `GET documents?view=detail` |
| Tasks | 5–15 min | `tasks?associationEntityId={loanId}` |
| Milestones | 15 min | `GET milestones` |
| Conversation logs | 5–15 min | V1 list |

Webhooks are not guaranteed real-time (official note on lock events applies broadly).

### Backfill jobs

- `POST auditTrail` with pagination for historical field changes
- `GET histories/eFolder` for document audit
- Disclosure snapshots for compliance point-in-time

### Normalization

- Map each raw payload → zero or more `LoanTimelineEvent` rows
- Preserve **official** Encompass identifiers alongside **internal** taxonomy
- Never delete raw payloads

### Timeline service

- Query by `loanId` + filters
- Sort by `eventTime` descending (default)
- Support cursor pagination on `(eventTime, eventId)`

---

## Data flow (webhook path)

```mermaid
sequenceDiagram
  participant ENC as Encompass
  participant RC as Webhook Receiver
  participant Q as Queue
  participant RAW as Raw Store
  participant N as Normalizer
  participant TL as Timeline DB
  participant API as Timeline API
  participant UI as Dashboard

  ENC->>RC: POST notification eventId
  RC->>RAW: INSERT raw payload
  RC->>Q: enqueue eventId
  RC-->>ENC: 200 OK

  Q->>N: process eventId
  N->>ENC: GET meta.resourceRef
  ENC-->>N: current resource state
  N->>TL: UPSERT LoanTimelineEvent rows
  UI->>API: GET /loans/{id}/timeline
  API->>TL: query + filter
  TL-->>API: events
  API-->>UI: JSON timeline
```

---

## Source preservation (question 20)

Every normalized event MUST include:

| Field | Purpose |
|-------|---------|
| `source` | API family + version (e.g., `encompass:loan:v3:condition`) |
| `rawReference` | Encompass URL or path to authoritative resource |
| `rawEventId` | Official `eventId` from webhook when applicable |
| `rawPayloadRef` | FK to `raw_encompass_events.id` |

Reconstruct original Encompass state by following `rawReference` — timeline rows are a **projection**, not a replacement.

---

## Multi-event fan-out

One webhook may produce multiple timeline rows:

| Webhook | Fan-out |
|---------|---------|
| `enhancedfieldchange` | One row per `fieldChangeEvents[]` item |
| `condition` update | Status + comment + tracking rows if multiple aspects changed |
| `document` updateDocuments | Status change + comment additions |
| `milestone` finishMilestones | Finish event + optional comment update |

---

## Idempotency

| Key | Use |
|-----|-----|
| Webhook `eventId` | Primary dedupe for webhook-sourced rows |
| `{source}:{resourceType}:{resourceId}:{subResourceId}:{eventTime}:{eventType}` | Poll-sourced dedupe |
| Content hash | Comment text re-sync |

---

## Stage / milestone correlation

Attach `metadata.milestoneName` to events by:

1. Reading current milestone state at ingest time
2. Mapping `eventTime` to active milestone from Milestone History Log
3. Storing pipeline stage from loan folder / milestone at index time

Milestone name on webhook payload: partial (`title` in milestone subevents) — enrich via GET.

---

## What the unified timeline includes

From the core requirement checklist:

| Requirement | Primary source(s) |
|-------------|-------------------|
| Loan changes | `update`, `create`, `move` webhooks |
| Field changes | EFC / fieldchange / auditTrail |
| Milestone changes | Milestone API + Milestone History Log + `milestone` WH |
| Task create/assign/complete | Workflow Task API + WH |
| Task comments | Task comments API + Task Comment WH |
| Condition create/status/comments/tracking | Enhanced Condition API + `condition` WH |
| Documents add/upload/comments/condition assign | Document + Attachment + Condition APIs |
| Conversation logs | Conversation Log API + `view=logs` |
| Notes | Trade / Contact notes (linked loans) |
| Email logs | HTML Email Log via `view=logs` |
| Disclosure events | Disclosure Tracking API + WH (Beta) |
| Document delivery | Document Delivery WH + disclosure side effects |
| System history | System logs + eFolder history + webhook history |

---

## Deployment considerations

- **Persona-scoped GET** — integration user must have field/log visibility matching dashboard needs
- **Volume** — EFC on all loans may require dedicated worker pool
- **Loan lock** — write APIs inherit lock; ingestion is read-heavy
- **Enhanced vs Standard conditions** — branch pollers on `useEnhancedConditionIndicator`

---

## References

- [timeline-data-model.md](./timeline-data-model.md)
- [timeline-api-strategy.md](./timeline-api-strategy.md)
- [search-strategy.md](./search-strategy.md)
- [01-domain/events.md](../01-domain/events.md)
