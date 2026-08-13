# Production Gotchas

## Purpose

Non-obvious production behaviors that cause incidents if ignored.

## Scope

Verified gotchas with classification.

---

| Gotcha | Classification | Mitigation |
|--------|----------------|------------|
| No global loan notes/comments API | **NOT_ESTABLISHED** | Multi-API aggregation |
| `conversationLogs` vs `conversationlogs` path casing | **OFFICIAL_DOCUMENTATION** | Canonical paths per verb |
| Milestone `comments` overwrites | **OFFICIAL_DOCUMENTATION** | Don't treat as thread |
| EC loan-level `title` retrieve-only | **OFFICIAL_DOCUMENTATION** | Don't PATCH title |
| document `status` deprecated | **VERSION_DEPENDENT** 26.1 | Use documentStatus |
| V1 attachment sunset | **VERSION_DEPENDENT** 26.3 | Migrate to V3 |
| EFC cannot use filters | **OFFICIAL_DOCUMENTATION** | Separate subscription strategy |
| fieldchange max 50 filters; invalid ignored silently | **OFFICIAL_DOCUMENTATION** | Validate filter list |
| Webhook ≠ current truth | **OFFICIAL_DOCUMENTATION** | Always GET |
| enhancedfieldchange high volume | **OFFICIAL_DOCUMENTATION** | Dedicated workers |
| Task delete 409 with subtasks | **OFFICIAL_DOCUMENTATION** | force=true |
| Subtasks not separately assignable | **OFFICIAL_DOCUMENTATION** | UX design |
| Disclosure WH beta | **OFFICIAL_DOCUMENTATION** | Confirm prod availability |
| DDA webhooks limited | **OFFICIAL_DOCUMENTATION** | Contact CSM |
| Overlapping webhook subscriptions same domain | **OFFICIAL_DOCUMENTATION** | One sub per domain |
| Lock webhooks not real-time | **OFFICIAL_DOCUMENTATION** | Poll logs |
| Persona hides fields on GET | **OFFICIAL_DOCUMENTATION** | Service account setup |
| Standard condition WH gap | **NOT_ESTABLISHED** | Poll when EC off |
| Conversation log delete API | **NOT_ESTABLISHED** | Confirm before UI delete |
| Rate lock vs exclusive lock | **OFFICIAL_DOCUMENTATION** | Separate event types |

---

## Related documents

[troubleshooting.md](./troubleshooting.md) · [02-apis/api-production-guidelines.md](../02-apis/api-production-guidelines.md)

## Source references

Repository phases 1–5 audit — Last verified 2026-08-13
