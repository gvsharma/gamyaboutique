# Communications

## Purpose

Communications in Encompass capture interactions between the loan team, borrowers, and third parties. The primary first-class loan communication object in Developer Connect is the **Conversation Log**.

---

## Conversation Logs

### Definition

Official documentation:

> Conversation log entries track communications with customers, partners, and vendors, and provide an alert mechanism to notify users of required actions and tasks.

Conversation logs are classified as **Editable Logs** in the V3 loan schema:

- Can be created/updated via loan APIs and dedicated conversation log endpoints
- Included in Get Loan with `view=logs|full`
- Generally without Encompass Field IDs

### Key attributes (ConversationLogContract)

| Attribute | Description |
|-----------|-------------|
| `id` | Log entry identifier |
| `comments` | Primary conversation text |
| `commentList[]` | Structured LogCommentContract entries |
| `name` | Contact name |
| `company` | Contact company |
| `phone` / `email` | Contact details |
| `dateUtc` | When conversation occurred |
| `updatedDateUtc` | Last update |
| `isEmailIndicator` | Whether entry is email-related |
| `inLogIndicator` | In-log flag |
| `isSystemSpecificIndicator` | System-generated indicator |
| `alerts[]` | Follow-up alert configuration |
| `userId` | User associated with entry |

### Follow-up alerts

A conversation entry can have two dates:

1. **Conversation date** — when the interaction occurred
2. **Follow-up due date** (optional) — deadline for loan associate action

Official behavior:

> When a conversation entry is marked for follow-up and the due date expires, the entry becomes an alert.

Alert contract includes `dueDate`, `followedUpDate`, assigned `role`, and `createdBy`.

### Example — phone call

Sarah (Processor) logs:

> "Spoke with borrower about large deposit."

This is a **Conversation Log** — not a condition comment, not a task comment.

---

## API endpoints

| Operation | Endpoint |
|-----------|----------|
| Create (V3) | Conversation Log create API |
| List (V1) | `GET /encompass/v1/loans/{loanId}/conversationLogs` |
| Get one (V1) | `GET /encompass/v1/loans/{loanId}/conversationLogs/{logId}` |

Conversation logs support nested `LogCommentContract` with `forRole`, `addedBy`, `reviewedBy`.

---

## HTML Email Logs

**HTML Email Logs** are **System Logs**:

- Cannot be edited by any user
- Included in Get Loan with `view=logs|full`

These capture system-recorded email communications distinct from manually entered conversation logs.

---

## Email Logs vs Conversation Logs

| Dimension | Conversation Log | HTML Email Log |
|-----------|------------------|----------------|
| Classification | Editable Log | System Log |
| User editable | Yes | No |
| Typical source | Manual staff entry | System-captured email |
| Alert support | Yes (follow-up dates) | NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION for equivalent alert mechanism |

---

## Document Delivery communications

Document Order delivery triggers **email notifications** to recipients via Consumer Connect / Loan Connect. These are delivery workflow notifications — not conversation logs.

Official delivery outcomes include email notification with portal link.

---

## Consumer Connect submit event

Loan webhook `submit` event fires when borrower clicks **Submit** on Consumer Connect — a borrower-initiated communication/action event, not a conversation log.

Support: Encompass Consumer Connect only.

---

## Communication vs Comments

**Comments** are attached to specific resources (conditions, documents, tasks, milestones). **Conversation logs** are loan-level communication records with optional alerts.

See comparison table in [comments-notes-logs.md](./comments-notes-logs.md).

---

## John Smith communication timeline

| Date | Type | Content |
|------|------|---------|
| Processing | Conversation log | "Spoke with borrower about large deposit." |
| Processing | Conversation log alert | Follow-up due in 3 days for donor letter |
| Underwriting | Condition comment | "Need donor statement." (on condition, not conversation log) |
| Closing | HTML Email Log | System log of CD delivery email (system-generated) |

---

## Webhook relevance

Conversation log changes may appear as part of broader loan `update` events. Dedicated conversation log webhook category: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** in webhook catalog reviewed — use loan update/change subscriptions and reconcile via GET.

---

## References

- [Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conversation-log-1)
- [V3 Create Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/create-conversation-log)
- [Get All Conversation Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-conversation-logs)
- [Loan Management — Editable vs System Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
