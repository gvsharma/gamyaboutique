# Cache strategy

Proposed keys:

```
SLV:V1:ENTITY:LOAN:{loanId}
SLV:V1:ENTITY:LOAN:{loanId}:MILESTONE:{milestoneId}
SLV:V1:ENTITY:LOAN:{loanId}:CONDITION:{conditionId}
SLV:V1:ENTITY:LOAN:{loanId}:TASK:{taskId}
SLV:V1:ENTITY:LOAN:{loanId}:DOCUMENT:{documentId}
```

## Verdict (INTERNAL ARCHITECTURE RECOMMENDATION)

**Good:** namespaced, versioned (`V1`), entity-scoped, loan-prefixed (easy wipe).

**Change:**

- Add `SLV:V1:INDEX:HLA:{userId}:LOANS` (sorted set of loanIds)
- Add `SLV:V1:ENTITY:HLA:{userId}` (name, org)
- Add `SLV:V1:INDEX:MGR:{managerId}:HLAS`
- Add `SLV:V1:LOAN:{loanId}:GRID` compact hash for manager row (avoid assembling from 4 hashes)
- Store `projectionRev` / `updatedAt` on each key
- Do not nest unbounded comment arrays in Redis hashes

**Avoid:**

- Full `view=full` JSON
- Attachment bytes
- Using Redis as audit log
- Keys without loanId when you need per-loan invalidation

## TTL

- Grid/index: long TTL (24h) + webhook invalidate (RDB can be stale anyway)
- Loan detail compact: 5–15 min TTL plus webhook
- Download URLs: seconds (pre-signed)
- Schema/canonical: 24h

## Invalidation

| Event | Keys |
| ----- | ---- |
| Loan create/delete/move | HLA index + loan keys |
| milestone | GRID + MILESTONE + loan compact |
| condition* | CONDITION + GRID counts |
| Task* | TASK + GRID |
| document/attachment | DOCUMENT + GRID |
| fieldchange/EFC | patch GRID fields if mapped |
| lock/unlock | GRID lock (then reconcile) |

## Stampede

Single-flight lock `SLV:V1:LOCK:LOAN:{id}` (SET NX PX 5000); coalesced queue; populate Redis before releasing.

## Miss

1. Try Redis GRID
2. If miss, Pipeline for that loanId (`loanIds` filter) or Field Reader
3. If still miss, GET Loan entity
4. Write through Redis

## Eviction / rebuild

Treat eviction as miss. Rebuild HLA index from Pipeline (folder-scoped). Nightly full reconcile. Never “rebuild history from Redis.”
