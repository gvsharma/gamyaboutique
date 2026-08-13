# Master Comment Matrix

**Last verified:** 2026-08-13 · Source: [03-loan-communications/comment-source-matrix.md](../03-loan-communications/comment-source-matrix.md)

| Comment Type | Object | API | Source | Author | Timestamp | Editable | Delete | Webhook | PII | Dashboard Display |
|--------------|--------|-----|--------|--------|-----------|----------|--------|---------|-----|-------------------|
| Enhanced condition comment | Enhanced Condition | V3 `GET/PATCH .../conditions/{id}/comments` | LogCommentContract | addedBy | addedDate | Yes **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** per-comment | Loan `condition` / addCommentsToConditions | Possible | Condition detail thread |
| Standard condition comment | Standard Condition | V1 `PATCH .../conditions/{type}/{id}/comments` | Condition API | Partial | Partial | Yes **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** | **NOT_ESTABLISHED** | Possible | Condition detail (legacy) |
| Document comment | eFolder Document | V3 GET `documents?view=detail/full`; PATCH update | Document API | Per contract | Per contract | Yes **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** | Loan `document` updateDocuments | Possible | Document QC panel |
| Task comment | Workflow Task | V1 `GET/POST .../tasks/{id}/comments` | Task API | createdBy (WH) | Task API | Yes **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** | Task Comment Update **OFFICIAL** 24.2+ | Possible | Task activity |
| Subtask comment | Subtask | V1 `.../subtasks/{id}/comments` | Task API | Same pattern | Same | Yes **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** | **NOT_ESTABLISHED** dedicated | Possible | Subtask detail |
| Milestone comment | Milestone log | V3 PATCH `milestones/{id}` field `comments` | Single string | User on PATCH | Partial | Yes **OFFICIAL_DOCUMENTATION** | Clear string | Loan `milestone` | Possible | Milestone note (overwrites) |
| Conversation log body | Conversation Log | V3 PATCH / V1 GET | ConversationLogContract | user/userId | dateUtc | Yes **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** | loan `update` partial | Often | Comm timeline primary |
| Conversation log thread | Conversation Log | `commentList[]` LogCommentContract | Same API | addedBy | addedDate | Yes **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** | partial | Possible | Thread under log entry |
| Task disposition comment | Workflow Task | PATCH task `resolutionComment` | Task fields | Assignee | completed | Yes **OFFICIAL_DOCUMENTATION** | With task | Task Update | Possible | Completion note (not thread) |
| Trade note body | Correspondent Trade | V1 `/secondary/v1/trades/.../notes` | TradeNoteContract | createdBy | createdTimeStamp | Yes **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** | Trade Updated | Possible | Secondary desk (not loan API) |
| Borrower contact note | BorrowerContact | V1 `borrowerContacts/{id}/notes` | Contact notes | Author | timestamp | Partial (create documented) | **NOT_ESTABLISHED** | **NOT_ESTABLISHED** | Often | CRM (join to loan) |

**Not comments:** Field changes, system logs, condition tracking labels, disclosure logs (**NOT_ESTABLISHED** as comment APIs).

**No global API:** `GET /loans/{loanId}/comments` — **NOT_ESTABLISHED** · Aggregate in timeline service **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

---

## Related documents

- [comment-map.md](./comment-map.md)
- [communication-map.md](./communication-map.md)
- [03-loan-communications/comments-vs-notes-vs-conversations.md](../03-loan-communications/comments-vs-notes-vs-conversations.md)

## Source references

- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions) — **OFFICIAL_DOCUMENTATION**
- [Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conversation-log-1) — **OFFICIAL_DOCUMENTATION**
- [Get Tasks / Task Comments](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks) — **OFFICIAL_DOCUMENTATION**
