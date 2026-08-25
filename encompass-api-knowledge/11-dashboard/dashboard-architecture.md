# Dashboard architecture

**INTERNAL ARCHITECTURE RECOMMENDATION** using only ICE-supported read/event APIs.

```mermaid
flowchart TB
  enc[Encompass SoR]
  enc --> pipe[POST v3/loanPipeline]
  enc --> wh[Webhooks]
  pipe --> sync[Initial / reconcile worker]
  wh --> recv[Event receiver ECS]
  sync --> redis[(ElastiCache current state)]
  recv --> redis
  recv --> hist[(Historical store)]
  ui[Lending Manager UI] --> redis
  ui -->|cache miss loan detail| loan[GET v3/loans or fieldReader]
```

- Redis: current projection only
- History: Postgres/OpenSearch + raw webhook log
- Hot path 2s: Redis only
- Encompass: hydrate, miss, reconcile

Concurrency: default 30 — serialize ICE calls via queue.
