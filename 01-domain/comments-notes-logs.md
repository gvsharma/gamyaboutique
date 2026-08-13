# Comments, Notes, and Logs

## Overview

Encompass uses multiple overlapping concepts for textual annotations and history. **Do not assume notes and conversation logs are equivalent.**

This document compares communication and annotation objects and classifies loan history sources.

---

## Notes vs Conversation Logs — verified distinction

| Concept | Official modeling |
|---------|-------------------|
| **Conversation Log** | Loan-level editable log for communications with customers/partners/vendors; dedicated API; supports alerts |
| **Note** | **Entity-specific** — no single global loan "Note" API documented |

Documented note APIs found in Developer Connect:

| Note type | API | Scope |
|-----------|-----|-------|
| Borrower contact notes | `/encompass/v1/borrowerContacts/{contactId}/notes` | CRM borrower contact |
| Correspondent trade notes | `/secondary/v1/trades/correspondent/{tradeId}/notes` | Secondary marketing trade |

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION:** A first-class loan-file "Note" object equivalent to Conversation Logs. For loan-level free-text communication, use **Conversation Logs**.

---

## Comments

**Comments** are contextual annotations on specific business objects. They use `LogCommentContract` (or resource-specific comment models) across multiple domains.

| Comment type | Parent object | Example |
|--------------|---------------|---------|
| Condition comment | Enhanced/Standard Condition | "Need donor statement." |
| Document comment | eFolder Document | "Signature page unreadable." |
| Task comment | Workflow Task | "Appraisal reviewed." |
| Milestone comment | Milestone log | "Processing complete." |
| Conversation log comment | Conversation Log (`commentList`) | Threaded discussion on a call log |

Common LogCommentContract fields:

- `id`, `comments`, `forRole`, `addedBy`, `addedDate`, `reviewedBy`, `reviewedDate`, `isExternal`

---

## Comparison table

| Object | Purpose | Scope | Author | Timestamp | Editable? | History? | Webhook? | Typical Example |
|--------|---------|-------|--------|-----------|-----------|----------|----------|-----------------|
| **Conversation Log** | Record communication + alerts | Loan | User (staff) | `dateUtc` | Yes (editable log) | Update timestamps | Via loan `update` | "Spoke with borrower about large deposit." |
| **Condition Comment** | Annotate requirement | Condition | User | `addedDate` | Yes | Review tracking | Loan `condition` event | "Need donor statement." |
| **Document Comment** | Annotate document issue | Document | User | Per document API | Yes | Per document | Loan `document` event | "Signature page unreadable." |
| **Task Comment** | Annotate work item | Workflow Task | User | Task API | Yes | Task history | Workflow Task Comment Update | "Appraisal reviewed." |
| **Milestone Comment** | Milestone-level notes | Milestone log | User | Milestone update | Yes (`comments` field) | Milestone history (system) | Loan `milestone` event | "Processing complete." |
| **HTML Email Log** | System email record | Loan | System | System-generated | **No** | Append-only system log | NOT ESTABLISHED | Auto-captured disclosure email |
| **System Log (general)** | Platform audit trail | Loan | System | Event time | **No** | Append-only | Various | Lock actions, milestone history |
| **Field Change** | Data mutation record | Loan field | User/system | Change time | **No** (immutable event) | Via webhooks/audit | `fieldchange`, `enhancedfieldchange` | Field 36 (First Name) changed |
| **Borrower Contact Note** | CRM annotation | Borrower contact | User | `timestamp` | Per contact notes API | Per contact | NOT ESTABLISHED | CRM follow-up note |
| **Trade Note** | Secondary trade annotation | Correspondent trade | User | `createdTimeStamp` | Per trade notes API | Trade history | Trade Updated event | Trade pricing note |

---

## Loan history taxonomy

### Current state

Always fetch via appropriate GET API for authoritative current state:

- Loan entity: `GET /encompass/v3/loans/{loanId}?view=entity`
- Conditions: `GET .../conditions`
- Documents: `GET .../documents`
- Milestones: `GET .../milestones`
- Tasks: `GET /workflow/v1/tasks?...`

### Editable logs (user editable)

| Log | Examples |
|-----|----------|
| Conversation Logs | Phone calls, notes to file |
| AUS Tracking Logs | AUS run history |
| Other editable logs | Per V3 loan schema |

Characteristics:

- No Encompass Field IDs (generally)
- CRUD via dedicated endpoints incrementally
- Included in `view=logs|full`

### System logs (not user editable)

| Log | Examples |
|-----|----------|
| Milestone History Log | Milestone transition audit |
| HTML Email Logs | System-captured emails |
| Lock Action Logs | Exclusive lock/unlock history |

Characteristics:

- **Cannot be edited by any user**
- Append-only from user perspective
- Included in `view=logs|full`

### Field changes

| Mechanism | Description |
|-----------|-------------|
| `fieldchange` webhook | Fires on specified field changes; payload may include cascading field updates |
| `enhancedfieldchange` webhook (EFC) | Includes previous and new values; fires on all loan field changes when subscribed |
| Audit Trail Database | **LENDER CONFIGURABLE** — fieldchange subscription does not require Audit Trail membership; enhancedfieldchange virtual fields require Reporting Database |

Field changes are **events**, not editable records.

### Resource-specific history

| Resource | History source |
|----------|----------------|
| Conditions | `tracking[]`, comments, `sourceOfCondition`, webhook events |
| Tasks | Task status transitions, resolution, comments |
| Documents | `documentStatus` history via webhooks |
| Disclosure logs | Log entries with optional snapshots |
| Trades | Trade Updated events on note changes |

---

## Audibility matrix

| History type | User editable | System generated | Append-only | Resource-specific | Auditable |
|--------------|---------------|------------------|-------------|-------------------|-----------|
| Conversation Log | Yes | No | No | Loan | Partial (updatedDateUtc) |
| Condition tracking | Yes | No | Entries add/remove | Condition | Yes (user/date on entries) |
| Milestone History Log | No | Yes | Yes | Loan | Yes |
| HTML Email Log | No | Yes | Yes | Loan | Yes |
| Lock Action Log | No | Yes | Yes | Loan | Yes |
| Field Change webhook | No | Yes | Yes (event) | Field | Yes (with EFC previous/new) |
| Task completion | Yes (status) | No | No | Task | Yes (started/completed) |

---

## Loan Logs terminology

"Loan Logs" in Encompass refers collectively to log collections on the loan file accessed via `view=log|full`. This includes both **editable logs** and **system logs** — not a single object type.

---

## John Smith examples mapped

| Text | Correct object |
|------|----------------|
| "Spoke with borrower about large deposit." | Conversation Log |
| "Need donor statement." | Condition Comment |
| "Appraisal reviewed." | Task Comment |
| "Processing complete." | Milestone Comment |
| "Signature page unreadable." | Document Comment |
| Borrower first name changed to John | Field Change event |
| CD emailed to borrower | HTML Email Log (system) + Disclosure Tracking |

---

## References

- [Loan Management — Log classifications](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [Conversation Log](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conversation-log-1)
- [Loan Webhooks — fieldchange, enhancedfieldchange](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
- [Create Note (Borrower Contact)](https://developer.icemortgagetechnology.com/developer-connect/reference/create-note)
- [Create Trade Note](https://developer.icemortgagetechnology.com/developer-connect/reference/create-trade-note)
