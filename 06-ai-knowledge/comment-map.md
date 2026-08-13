# Comment Map

## Purpose

Where **comments** live in Encompass and how to aggregate them for a unified timeline.

## Scope

Resource-scoped comments only. Matrix → [master-comment-matrix.md](./master-comment-matrix.md).

## Key concepts

- **No global loan comments API** — **NOT_ESTABLISHED**
- **LogCommentContract** shared shape — **OFFICIAL_DOCUMENTATION**: `comments`, `addedBy`, `addedDate`, `reviewedBy`, `forRole`, `isExternal`
- **Milestone comment** = single string field, not collection — **OFFICIAL_DOCUMENTATION**

## Definitions

| Type | API endpoint pattern |
|------|---------------------|
| Condition (EC) | `.../conditions/{id}/comments` — **OFFICIAL_DOCUMENTATION** |
| Document | embedded in `GET documents?view=detail/full` — **OFFICIAL_DOCUMENTATION** |
| Task | `GET/POST .../tasks/{id}/comments` — **OFFICIAL_DOCUMENTATION** |
| Conversation thread | `commentList[]` on log — **OFFICIAL_DOCUMENTATION** |

## Relationships

vs Notes vs Conversation: [03-loan-communications/comments-vs-notes-vs-conversations.md](../03-loan-communications/comments-vs-notes-vs-conversations.md)

## API references

Deep dive: [03-loan-communications/comments.md](../03-loan-communications/comments.md)

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** "Need donor statement." → condition comment, not conversation log.

## Production notes

Timeline fan-out: one condition update → multiple event types — **INTERNAL_ARCHITECTURE_RECOMMENDATION**

## Common mistakes

- Single `comments` table without `resourceType` — **INTERNAL_ARCHITECTURE_RECOMMENDATION** anti-pattern

## FAQ

**Q: All comments one API?** A: **NOT_ESTABLISHED** — see [developer-faq.md](./developer-faq.md).

## Related documents

- [communication-map.md](./communication-map.md) · [master-comment-matrix.md](./master-comment-matrix.md)

## Source references

- [03-loan-communications/comment-source-matrix.md](../03-loan-communications/comment-source-matrix.md) — Last verified 2026-08-13
