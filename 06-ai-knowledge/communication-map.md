# Communication Map

## Purpose

**Loan-level communications** vs comments vs system email records.

## Scope

Conversation logs, HTML email logs, notes, delivery notifications.

## Key concepts

| Mechanism | Classification | Editable |
|-----------|----------------|----------|
| Conversation Log | **OFFICIAL_DOCUMENTATION** | Yes |
| HTML Email Log | **OFFICIAL_DOCUMENTATION** system log | No |
| Trade / Contact Note | **OFFICIAL_DOCUMENTATION** entity-scoped | Partial |
| Document delivery email | **OFFICIAL_DOCUMENTATION** side effect | N/A |
| Consumer Connect submit | **OFFICIAL_DOCUMENTATION** WH `submit` | N/A |

## Definitions

**Follow-up alert:** conversation log `alerts[]` — due date → alert when expired — **OFFICIAL_DOCUMENTATION**

## Relationships

Borrower communication history = conversation logs + HTML email logs + relevant timeline events — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

## API references

- V1: `GET .../conversationLogs` — **OFFICIAL_DOCUMENTATION**
- V3: `PATCH .../conversationlogs` — **OFFICIAL_DOCUMENTATION**
- Embedded: `GET loan?view=logs` — **OFFICIAL_DOCUMENTATION**

Docs: [03-loan-communications/conversation-logs.md](../03-loan-communications/conversation-logs.md) · [02-apis/conversation-log-api.md](../02-apis/conversation-log-api.md)

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** "Spoke with borrower about large deposit." → Conversation Log.

## Production notes

Dedicated conversation log webhook — **NOT_ESTABLISHED**; use loan `update` + poll — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

PII in contact fields — [05-dashboard-architecture/security.md](../05-dashboard-architecture/security.md)

## Common mistakes

- Equating Notes API with loan file communication — **NOT_ESTABLISHED** global loan notes

## FAQ

See [product-faq.md](./product-faq.md).

## Related documents

- [comment-map.md](./comment-map.md) · [03-loan-communications/notes.md](../03-loan-communications/notes.md)

## Source references

- [Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conversation-log-1) — Last verified 2026-08-13
