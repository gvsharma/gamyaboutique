# Conversation Logs

Loan-level **editable logs** for communications with customers, partners, and vendors — with optional follow-up alerts.

**Official classification:** Editable Log (V3 loan schema) — distinct from system logs and resource comments.

---

## Official documentation

- [Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conversation-log-1)
- [V3 Create Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/create-conversation-log)
- [Get All Conversation Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-conversation-logs)
- [Loan Management — log types](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)

---

## API endpoints

| Operation | Version | Method | Path |
|-----------|---------|--------|------|
| List all | V1 | GET | `/encompass/v1/loans/{loanId}/conversationLogs` |
| Get one | V1 | GET | `/encompass/v1/loans/{loanId}/conversationLogs/{logId}` |
| Create / manage | V3 | PATCH | `/encompass/v3/loans/{loanId}/conversationlogs` |
| Embedded in loan | V3 | GET | `/encompass/v3/loans/{loanId}?view=logs\|full` |

**Integration note:** V3 create + V1 read is the documented pattern. Pick one canonical sync path for your ingestion layer.

---

## Field reference

| Field | R/W | Timeline use |
|-------|-----|--------------|
| `id` | R | `resourceId` |
| `comments` | RW | Primary description text |
| `commentList[]` | RW | Threaded LogCommentContract entries |
| `name`, `company`, `phone`, `email` | RW | Contact context — **PII** |
| `dateUtc` | RW | **`eventTime`** (conversation occurred) |
| `updatedDateUtc` | R | Last modification |
| `user` / `userId` | RW | **Actor** |
| `isEmailIndicator` | RW | Filter email-related entries |
| `showInLoanLog` | RW | Visibility in loan log UI |
| `isSystemSpecificIndicator` | RW | System vs user origin |
| `alerts[]` | RW | Follow-up SLA — separate timeline events recommended |

### LogCommentContract on `commentList`

| Field | Purpose |
|-------|---------|
| `comments` | Thread text |
| `forRole` | Role assignment |
| `addedBy` / `addedDate` | Author |
| `reviewedBy` / `reviewedDate` | Review audit |
| `isExternal` | External visibility |

Each `commentList` item may become a separate timeline row: **NORMALIZED INTERNAL EVENT TYPE** `CONVERSATION_LOG_COMMENT_ADDED`.

---

## Alerts (follow-up mechanism)

Official behavior:

> When a conversation entry is marked for follow-up and the due date expires, the entry becomes an alert.

| Alert field | Meaning |
|-------------|---------|
| `dueDate` | Follow-up deadline |
| `followedUpDate` | When completed |
| `role` | Assigned role — **LENDER CONFIGURABLE** |
| `createdBy` | Who set alert |

Recommend separate timeline events:

- **NORMALIZED INTERNAL EVENT TYPE** `CONVERSATION_ALERT_CREATED`
- **NORMALIZED INTERNAL EVENT TYPE** `CONVERSATION_ALERT_DUE` (derived from `dueDate`)
- **NORMALIZED INTERNAL EVENT TYPE** `CONVERSATION_ALERT_COMPLETED` (when `followedUpDate` set)

---

## Who writes / reads

| | |
|--|--|
| **Writes** | Staff with conversation log persona permissions |
| **Reads** | Loan team; entries with `showInLoanLog` appear in standard loan log views |

---

## Editable / deletable / historical

| Property | Value |
|----------|-------|
| **Editable** | Yes — staff can update entries |
| **Deletable** | **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** |
| **Historical** | `updatedDateUtc` tracks edits; prior versions **NOT ESTABLISHED** as version API |
| **Immutable audit** | No — unlike system logs |

---

## Webhooks

Dedicated Conversation Log webhook category: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION**.

Practical approach:

1. Subscribe to Loan `update` (broad — requires diff logic)
2. Poll `GET conversationLogs` on schedule
3. Compare `updatedDateUtc` / hash for changes

---

## vs HTML Email Log

| | Conversation Log | HTML Email Log |
|--|------------------|----------------|
| Classification | Editable log | System log |
| User can edit | Yes | **No** |
| Manual phone call | Primary use case | No |
| System-sent disclosure email | Sometimes flagged (`isEmailIndicator`) | Primary use case |

Do not merge into one dashboard category without labeling.

---

## Timeline mapping

### Log entry created

```json
{
  "loanId": "{loanGuid}",
  "eventId": "{internal-uuid}",
  "eventTime": "{dateUtc}",
  "eventType": "CONVERSATION_LOG_CREATED",
  "resourceType": "CONVERSATION_LOG",
  "resourceId": "{logId}",
  "actor": "{user}",
  "actorType": "USER",
  "title": "Conversation with {name}",
  "description": "{comments}",
  "source": "encompass:loan:v1:conversationLogs",
  "rawReference": "/encompass/v1/loans/{loanId}/conversationLogs/{logId}",
  "encompassEventType": null
}
```

`eventType` is **NORMALIZED INTERNAL EVENT TYPE** — no official Encompass event named `CONVERSATION_LOG_CREATED`.

---

## John Smith example

Sarah logs after borrower call:

> "Spoke with borrower about large deposit."

With 3-day follow-up alert for donor letter:

- Timeline row 1: `CONVERSATION_LOG_CREATED` at call time
- Timeline row 2: `CONVERSATION_ALERT_CREATED` with due date +3 days
- When donor letter condition comment added later — separate `CONDITION_COMMENTED` event (not this log)

---

## Production considerations

1. **PII** — `phone`, `email`, `name` require masking policies in dashboard
2. **V1 vs V3 path casing** — `conversationLogs` (V1 GET) vs `conversationlogs` (V3 PATCH)
3. **Dedupe** — same log from `view=logs` and V1 list must map to one `resourceId`
4. **Locking** — create via loan API inherits loan lock rules

---

## References

- [02-apis/conversation-log-api.md](../02-apis/conversation-log-api.md)
- [comments-vs-notes-vs-conversations.md](./comments-vs-notes-vs-conversations.md)
- [01-domain/communications.md](../01-domain/communications.md)
