# Master Lifecycle Matrix

Lifecycle states labeled **OFFICIAL_DOCUMENTATION** only when documented in ICE Developer Connect. Others: **ILLUSTRATIVE_BUSINESS_EXAMPLE** or **LENDER_CONFIGURABLE**.

**Last verified:** 2026-08-13

---

## Loan

| State | Label | Trigger / API | Notes |
|-------|-------|---------------|-------|
| Created | **OFFICIAL_DOCUMENTATION** | POST /v3/loans; WH `create` | Requires loanFolder |
| Updated | **OFFICIAL_DOCUMENTATION** | PATCH loan; WH `update` | Broad |
| Moved (incl. trash) | **OFFICIAL_DOCUMENTATION** | Move APIs; WH `move` | Soft delete to trash |
| Permanently deleted | **OFFICIAL_DOCUMENTATION** | DELETE loan; WH `delete` | Irreversible |
| Locked (exclusive) | **OFFICIAL_DOCUMENTATION** | resourceLocks; WH `lock`/`unlock` | Not rate lock |
| Submitted (borrower) | **OFFICIAL_DOCUMENTATION** | WH `submit` | Consumer Connect |
| In Processing milestone | **ILLUSTRATIVE_BUSINESS_EXAMPLE** | Milestone active | Stage name **LENDER_CONFIGURABLE** |
| Funded | **ILLUSTRATIVE_BUSINESS_EXAMPLE** | Milestone + field conventions | Lender-specific |

---

## Milestone

| State | Label | Trigger / API | Notes |
|-------|-------|---------------|-------|
| Not started | **ILLUSTRATIVE_BUSINESS_EXAMPLE** | No startDate, not done | Infer from GET list |
| Started | **OFFICIAL_DOCUMENTATION** | `startDate` set; PATCH milestone | API field |
| In progress | **ILLUSTRATIVE_BUSINESS_EXAMPLE** | Started, not done | Business view |
| Finished | **OFFICIAL_DOCUMENTATION** | `doneIndicator: true`; WH `finishMilestones` | |
| Reviewed | **OFFICIAL_DOCUMENTATION** | `reviewedIndicator` | QC flag |
| Associate assigned | **OFFICIAL_DOCUMENTATION** | `loanAssociate` on PATCH | WH updateMilestones |
| Transition logged | **OFFICIAL_DOCUMENTATION** | Milestone History Log | System log — not editable |

---

## Workflow Task

| State | Label | Trigger / API | Notes |
|-------|-------|---------------|-------|
| Created | **OFFICIAL_DOCUMENTATION** | POST /workflow/v1/tasks; WH Create | |
| Not started | **OFFICIAL_DOCUMENTATION** | status value | Template-driven labels **LENDER_CONFIGURABLE** |
| In progress | **OFFICIAL_DOCUMENTATION** | status | |
| Completed | **OFFICIAL_DOCUMENTATION** | status + `completed` datetime | |
| Assigned | **OFFICIAL_DOCUMENTATION** | assignee on PATCH | WH Update |
| Disposition recorded | **OFFICIAL_DOCUMENTATION** | `resolution`, `resolutionComment` | Codes **LENDER_CONFIGURABLE** |
| Deleted | **OFFICIAL_DOCUMENTATION** | DELETE task; WH Delete | Hard delete |
| Overdue | **INTERNAL_ARCHITECTURE_RECOMMENDATION** | due < now ∧ not completed | Derived for dashboard |

---

## Enhanced Condition

| State | Label | Trigger / API | Notes |
|-------|-------|---------------|-------|
| Added | **OFFICIAL_DOCUMENTATION** | PATCH conditions `add` | Manual/template/set/automated |
| Requested | **LENDER_CONFIGURABLE** | status label | Common not universal |
| Updated | **OFFICIAL_DOCUMENTATION** | PATCH; WH update | |
| Tracking checkpoint checked | **OFFICIAL_DOCUMENTATION** | PATCH tracking | WH updateStatusTrackingInConditions |
| Comment added | **OFFICIAL_DOCUMENTATION** | PATCH comments | WH addCommentsToConditions |
| Document assigned | **OFFICIAL_DOCUMENTATION** | PATCH documents on condition | WH assignDocument |
| Satisfied / cleared | **LENDER_CONFIGURABLE** | status + statusOpen | Label varies |
| Re-requested | **ILLUSTRATIVE_BUSINESS_EXAMPLE** | Status regression | Business term |
| Removed (soft) | **OFFICIAL_DOCUMENTATION** | `isRemoved: true` | includeRemoved on GET |

---

## Standard Condition

| State | Label | Notes |
|-------|-------|-------|
| Added | **OFFICIAL_DOCUMENTATION** | POST .../conditions/{type} |
| Status changed | **OFFICIAL_DOCUMENTATION** | eFolder status — values **LENDER_CONFIGURABLE** |
| Comment added | **OFFICIAL_DOCUMENTATION** | PATCH comments |
| Webhook events | **NOT_ESTABLISHED** | Use Enhanced path when EC enabled |

---

## Document (eFolder)

| State | Label | Trigger / API | Notes |
|-------|-------|---------------|-------|
| Created | **OFFICIAL_DOCUMENTATION** | POST documents; WH createDocuments | Container only |
| Attachment assigned | **OFFICIAL_DOCUMENTATION** | PATCH attachments; WH assignAttachmentsToDocument | File linked |
| Status updated | **OFFICIAL_DOCUMENTATION** | documentStatus; WH documentStatusUpdates | **VERSION_DEPENDENT** 26.1+ use documentStatus not status |
| Comment added | **OFFICIAL_DOCUMENTATION** | PATCH/GET comments | |
| Removed | **OFFICIAL_DOCUMENTATION** | includeRemoved flag | Soft remove |
| Received (business) | **ILLUSTRATIVE_BUSINESS_EXAMPLE** | Status label **LENDER_CONFIGURABLE** | |

---

## Disclosure (2015)

| State | Label | Trigger / API | Notes |
|-------|-------|---------------|-------|
| Log created | **OFFICIAL_DOCUMENTATION** | POST disclosureTracking2015Logs | |
| Log updated | **OFFICIAL_DOCUMENTATION** | PATCH log | |
| Delivered (package) | **OFFICIAL_DOCUMENTATION** | Document delivery success creates log | Async |
| Snapshot captured | **OFFICIAL_DOCUMENTATION** | GET snapshots | Point-in-time |
| Recipient viewed | **VERSION_DEPENDENT** | 24.3+ fields per release notes | Confirm current docs |

---

## Conversation Log

| State | Label | Trigger / API | Notes |
|-------|-------|---------------|-------|
| Created | **OFFICIAL_DOCUMENTATION** | PATCH conversationlogs | |
| Updated | **OFFICIAL_DOCUMENTATION** | PATCH; updatedDateUtc | |
| Alert set | **OFFICIAL_DOCUMENTATION** | alerts[] with dueDate | |
| Alert due / followed up | **OFFICIAL_DOCUMENTATION** | dueDate / followedUpDate behavior | |
| Thread comment added | **OFFICIAL_DOCUMENTATION** | commentList[] | LogCommentContract |
| Deleted | **NOT_ESTABLISHED** | — | |

---

## Related documents

- [lifecycle-map.md](./lifecycle-map.md)
- [01-domain/mortgage-lifecycle.md](../01-domain/mortgage-lifecycle.md)

## Source references

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) — **OFFICIAL_DOCUMENTATION**
- [V3 Update Milestone Log](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-update-milestone-log) — **OFFICIAL_DOCUMENTATION**
- [Manage Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1) — **OFFICIAL_DOCUMENTATION**
