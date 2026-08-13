# Master Event Matrix

**Last verified:** 2026-08-13 · Sources: [01-domain/events.md](../01-domain/events.md), [03-loan-communications/timeline-data-model.md](../03-loan-communications/timeline-data-model.md)

| Event | Resource | Official/Normalized | Trigger | Payload | Actor | Timestamp | Current State API | Idempotency Key | Retry | Ordering | Dashboard Impact |
|-------|----------|---------------------|---------|---------|-------|-----------|-------------------|-----------------|-------|----------|------------------|
| `create` | Loan | **OFFICIAL** | Loan created via API/SC | meta.resourceRef, eventId | meta.userId | eventTime | GET /v3/loans/{id} | encompass eventId | ICE retries WH | Not guaranteed | New loan in pipeline |
| `update` | Loan | **OFFICIAL** | Loan file changed | meta.resourceRef | meta.userId | eventTime | GET loan | eventId | Yes | Out of order OK with GET | Refresh overview; may include logs |
| `move` | Loan | **OFFICIAL** | Folder/trash move | meta.resourceRef | meta.userId | eventTime | GET loan | eventId | Yes | — | Hide/show loan |
| `delete` | Loan | **OFFICIAL** | Permanent delete | meta.resourceRef | meta.userId | eventTime | 404 | eventId | Yes | — | Remove from dashboard |
| `submit` | Loan | **OFFICIAL** | Consumer Connect submit | meta.payload | Borrower context | eventTime | GET loan | eventId | Yes | — | Borrower action timeline |
| `milestone` → updateMilestones | Loan | **OFFICIAL** subevent | Milestone PATCH | id, title in payload | meta.userId | eventTime | GET .../milestones/{id} | eventId + milestone id | Yes | — | Stage change, SLA |
| `milestone` → finishMilestones | Loan | **OFFICIAL** subevent | doneIndicator true | id, title | meta.userId | eventTime | GET milestone + view=logs | eventId | Yes | — | Milestone complete |
| `condition` create/update/comment/status | Loan | **OFFICIAL** subevents | EC PATCH | condition refs | meta.userId | eventTime | GET .../conditions | eventId + subevent | Yes | — | Condition dashboard |
| `document` createDocuments/updateDocuments | Loan | **OFFICIAL** subevents | Document PATCH | document ids | meta.userId | eventTime | GET .../documents | eventId | Yes | — | Document dashboard |
| `document` documentStatusUpdates | Loan | **OFFICIAL** subevent | Status change | status history sample | meta.userId | eventTime | GET document | eventId | Yes | — | Status chips |
| `attachment` create | Loan | **OFFICIAL** | File uploaded | attachment ref | meta.userId | eventTime | GET attachments | eventId | Yes | — | Document received |
| `fieldchange` | Loan | **OFFICIAL** | Filtered field edits | field ids in payload | meta.userId | eventTime | GET loan / fieldReader | eventId | Yes; may skip if payload >250KB **VERSION_DEPENDENT** | Cascades may co-fire | Field history (filtered) |
| `enhancedfieldchange` | Loan | **OFFICIAL** | Any field edit (EFC) | fieldChangeEvents[] prev/new | meta.userId | eventTime | meta.resourceRef | eventId per field event **INTERNAL_ARCHITECTURE_RECOMMENDATION** | Yes | High volume | Full field mirror |
| `change` | Loan | **OFFICIAL** | JSON path change | filtered attributes | meta.userId | eventTime | GET loan | eventId | Yes | — | Targeted sync |
| `lock` / `unlock` | Loan | **OFFICIAL** | Exclusive lock | lock ref | meta.userId | eventTime | resourceLocks / logs | eventId | Yes; not real-time note **OFFICIAL_DOCUMENTATION** | — | Lock indicator |
| `disclosureTracking` | Loan | **OFFICIAL** Beta | Disclosure log CRUD | log ref | meta.userId | eventTime | GET disclosureTracking2015Logs | eventId | Yes | — | Disclosure status |
| `alertchange` | Loan | **OFFICIAL** Limited | Compliance alert | alert payload | meta.userId | eventTime | GET loan | eventId | Yes | — | Compliance banner |
| Task Create/Update/Delete | Workflow Tasks | **OFFICIAL** | Task API | task ref | meta.userId | eventTime | GET /workflow/v1/tasks/{id} | eventId | Yes | — | Task dashboard |
| Task Comment Update | Workflow Tasks | **OFFICIAL** 24.2+ | Comment POST | commentText, createdBy | createdBy | eventTime | GET .../comments | eventId | Yes | — | Task activity |
| Document Delivery WH | Document Delivery | **OFFICIAL** | Delivery complete | delivery ref | meta.userId | eventTime | Order/delivery APIs | eventId | Yes | Async | Disclosure + docs |
| Trade Updated | Trades | **OFFICIAL** | Trade/note change | trade ref | meta.userId | eventTime | GET trade | eventId | Yes | — | Secondary desk |
| `CONDITION_COMMENTED` | Condition | **NORMALIZED** | Mapper after GET | comment body | addedBy | addedDate | GET .../comments | idempotency_key **INTERNAL_ARCHITECTURE_RECOMMENDATION** | App retry | — | Timeline row |
| `LOAN_FIELD_CHANGED` | Loan field | **NORMALIZED** | EFC mapper | prev/new values | meta.userId | eventTime | auditTrail | eventId:fieldId | App retry | — | Audit tab |
| `CONVERSATION_LOG_CREATED` | Conversation Log | **NORMALIZED** | Poll/PATCH detect | comments | user | dateUtc | GET conversationLogs | source:id:time **INTERNAL_ARCHITECTURE_RECOMMENDATION** | Poll | — | Comm timeline |
| `TASK_OVERDUE` (derived) | Task | **NORMALIZED** | Scheduled job | due_date vs now | — | computed | GET tasks | job run id **INTERNAL_ARCHITECTURE_RECOMMENDATION** | Job | — | Workload widget |

---

## Idempotency (INTERNAL_ARCHITECTURE_RECOMMENDATION)

1. Webhook: `encompass_event_id` UNIQUE
2. Timeline: `{encompassEventId}:{eventType}:{resourceId}`
3. Projection: UPSERT on Encompass primary ID + `sync_version`

See [05-dashboard-architecture/reconciliation.md](../05-dashboard-architecture/reconciliation.md).

---

## Related documents

- [event-map.md](./event-map.md)
- [integration-map.md](./integration-map.md)

## Source references

- [Loan Webhook Events](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) — **OFFICIAL_DOCUMENTATION**
- [Workflow Tasks Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-workflow-tasks) — **OFFICIAL_DOCUMENTATION**
