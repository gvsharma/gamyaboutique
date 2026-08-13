# API Version Matrix

Cross-reference of Encompass Developer Connect API families, recommended versions, and migration notes.

**Source:** [Developer Connect Reference](https://developer.icemortgagetechnology.com/developer-connect/reference/) and release notes.

| Domain | Recommended Version | Legacy Version | Base Path | Migration Notes |
|--------|--------------------|--------------------|-----------|-----------------|
| Loan CRUD | **V3** | V1 | `/encompass/v3/loans` | Different contract — migration effort required |
| Loan Schema | **V3** | V1 | `/encompass/v3/schemas/loan` | V3 uses JSON paths |
| Field Reader/Writer | **V3** | V1 | `/encompass/v3/loans/{id}/fieldReader` | Prefer V3 |
| Loan Pipeline | **V3** | V1 | `/encompass/v3/loanPipeline` | Both available |
| Borrower Pairs | V1 | — | `/encompass/v1/loans/{id}/applications` | Embedded in V3 loan also |
| Milestones | **V3** | V1 | `/encompass/v3/loans/{id}/milestones` | Prefer V3 |
| Milestone Settings | **V3** | — | `/encompass/v3/settings/milestones` | Added 25.1 |
| Associates | V1 | — | `/encompass/v1/loans/{id}/associates` | V3 via milestone update |
| Workflow Tasks | **V1** | — | `/workflow/v1/tasks` | Only workflow version |
| Task Templates | **V1** | — | `/workflow/v1/templates/task/items` | — |
| Standard Conditions | V1 | — | `/encompass/v1/loans/{id}/conditions/{type}` | When enhanced indicator false |
| Enhanced Conditions | **V3** | — | `/encompass/v3/loans/{id}/conditions` | Encompass 20.2+ |
| Condition Settings | **V3** | — | `/encompass/v3/settings/loan/conditions/*` | — |
| eFolder Documents | **V3** | V1 | `/encompass/v3/loans/{id}/documents` | `documentStatus` replaces `status` (26.1) |
| eFolder Attachments | **V3** | V1 | `/encompass/v3/loans/{id}/attachments` | **V1 sunset 26.3** |
| Conversation Logs (read) | V1 | — | `/encompass/v1/loans/{id}/conversationLogs` | — |
| Conversation Logs (create) | **V3** | — | `/encompass/v3/loans/{id}/conversationlogs` | — |
| Disclosure Tracking | **V3** | V1 | `/encompass/v3/loans/{id}/disclosureTracking2015Logs` | Legacy log update supported 22.3+ |
| Document Orders | **V1** | — | `/encompassdocs/v1/documentOrders/*` | Encompass Docs family |
| Document Delivery | **V1** | — | `.../delivery` | Async |
| Internal Users | **V3** | V1 | `/encompass/v3/users` | V3 added 24.2 |
| External Users | **V3** | — | `/encompass/v3/externalUsers` | — |
| Roles / Personas | **V3** | V1 | `/encompass/v3/settings/roles` | Roles API 25.1 |
| Organizations | V1 | — | `/encompass/v1/organizations` | — |
| Resource Locks | **V3** | V1 | `/encompass/v3/resourceLocks` | Loan locking |
| Webhooks | **V1** | — | `/webhook/v1/subscriptions` | — |
| Trades | **V1** | — | `/secondary/v1/trades/*` | Secondary marketing |
| OAuth | **V1** | — | `/oauth2/v1/token` | — |
| EPC | Webhooks | Partner API | Partner Connect portal | Partial on Developer Connect |
| DDA | Webhooks | — | wbhks-re-cat-dda | Limited availability |
| Schedulers | Webhooks | — | Timer resource | No REST CRUD documented |

## Environment URLs

| Environment | API Base |
|-------------|----------|
| Production | `https://api.elliemae.com` |
| UAT | `https://concept.api.elliemae.com` |

## Version Selection Rule

1. If **V3** exists for the operation → use V3 for new code
2. Check **deprecation/sunset** notices before using V1
3. Check loan-level flags (`useEnhancedConditionIndicator`) before condition APIs
4. Confirm **release notes** for field renames (e.g. `documentStatus`)

## References

- [V1 vs V3 APIs](https://developer.icemortgagetechnology.com/developer-connect/docs/v1-vs-v3-encompass-apis-whats-the-difference-1)
- [Deprecation and Sunset Notices](https://developer.icemortgagetechnology.com/developer-connect/docs/deprecation-and-sunset-notices)
- [Release Notes / Changelog](https://developer.icemortgagetechnology.com/developer-connect/changelog)
