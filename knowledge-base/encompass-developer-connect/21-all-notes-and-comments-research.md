# 21 — Special Research: All Notes and Comments for One Loan

**Share this file when:** the requirement is to retrieve every note, comment, communication, or history item for a loan.

**Related:** [19 Matrix](./19-api-research-matrix.md) · [11 Conversation logs vs comments](./11-conversation-logs-comments-notes.md) · [16 Normalized timeline](./16-normalized-communications-timeline.md) · [research/all-notes-and-comments.md](./research/all-notes-and-comments.md)

---

## Purpose

There is **not necessarily one universal “get every comment” endpoint**.

This worksheet determines **exactly** how to retrieve each source below for **one loan**, using only current official ICE Developer Connect documentation.

If official documentation does not answer a question:

> NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION

Do not guess.

## Sources to determine

| # | Source | Worksheet row |
|---|--------|----------------|
| 1 | Conversation Logs | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#1-conversation-logs) |
| 2 | Condition comments | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#2-condition-comments) |
| 3 | Condition tracking | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#3-condition-tracking) |
| 4 | Enhanced Condition comments | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#4-enhanced-condition-comments) |
| 5 | Task comments | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#5-task-comments) |
| 6 | Subtask comments | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#6-subtask-comments) |
| 7 | Document comments | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#7-document-comments) |
| 8 | Milestone comments | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#8-milestone-comments) |
| 9 | Loan editable logs | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#9-loan-editable-logs) |
| 10 | Loan system logs | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#10-loan-system-logs) |
| 11 | HTML email logs | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#11-html-email-logs) |
| 12 | Any explicit Notes resource | [research/all-notes-and-comments.md](./research/all-notes-and-comments.md#12-any-explicit-notes-resource) |

## Fields to record for each source

| Field | Verified value |
|-------|----------------|
| Endpoint | |
| API version | |
| Included in Get Loan? | (`entity` / `log` / `full` / no / NOT ESTABLISHED) |
| Separate API call needed? | |
| Pagination | |
| Timestamp field | |
| Author field | |
| Editability | |
| Deletion behavior | |
| Webhook support | |
| PII sensitivity | |
| Retention behavior | |
| Official documentation URL | |
| Date verified | |

## After the twelve sources

Design a **normalized Loan Timeline** only from verified sources.

Candidate downstream model (integration projection, not an Encompass resource):

```text
LoanTimelineEvent
-----------------
loanId
eventId
eventTime
eventType
resourceType
resourceId
actor
text
previousState
newState
source
rawPayload
```

**Only use event names when confirmed by official documentation.**

See also [16 Normalized communications timeline](./16-normalized-communications-timeline.md).
