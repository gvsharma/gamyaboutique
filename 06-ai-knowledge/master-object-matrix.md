# Master Object Matrix

**Last verified:** 2026-08-13 · Sources: [02-apis/API-INDEX.md](../02-apis/API-INDEX.md), [03-loan-communications/comment-source-matrix.md](../03-loan-communications/comment-source-matrix.md)

| Object | Business Meaning | API | API Version | Primary ID | Parent | Children | Relationships | Lifecycle | Comments | History | Events | Webhook | Configuration | Permissions | PII | Editable | Soft Delete | Notes |
|--------|------------------|-----|-------------|------------|--------|----------|---------------|-----------|----------|---------|--------|---------|---------------|-------------|-----|----------|-------------|-------|
| **Loan** | Mortgage transaction root aggregate | Loan Management | V3 (+ V1 legacy) | `loan.id` (GUID) | — | Applications, milestones, conditions, documents, logs | Parent of all loan-scoped objects | create/update/move/delete **OFFICIAL_DOCUMENTATION** | No loan-level comment API **NOT_ESTABLISHED** | System + editable logs via `view=logs` | create, update, fieldchange, EFC, etc. | Loan resource | Folders, templates **LENDER_CONFIGURABLE** | Persona field access | Partial | Entity yes; events no | Trash via `move` |
| **Application** | Borrower pair | V3 loan body / V1 applications | V3/V1 | Application id in loan | Loan | Borrower, CoBorrower, Property, financial collections | 1..n per loan | Embedded in loan lifecycle | — | Via loan | `change` | Loan `change` | — | Persona | Yes (borrower) | Via loan PATCH | Via loan |
| **Borrower** | Primary applicant | V3 loan `applications[]` | V3 | Borrower id in application | Application | Income, employment, assets | 1 per application | **ILLUSTRATIVE_BUSINESS_EXAMPLE** stages | — | Field changes | EFC/fieldchange | Loan webhooks | — | Persona | Yes | Via loan | Via loan |
| **Property** | Subject property | V3 loan application | V3 | Property in application | Application | — | 1 per application | — | — | Field changes | EFC | — | — | Address PII | Via loan | Via loan |
| **Associate** | Loan team member on role | V1 associates / V3 milestone | V1/V3 | Associate log id | Loan / Milestone | — | User/Group ↔ Role | Assign/reassign **OFFICIAL_DOCUMENTATION** | — | Milestone history | `milestone` updateMilestones | Loan `milestone` | Roles **LENDER_CONFIGURABLE** | Persona | Yes | — | Milestone-free roles separate API |
| **Milestone Log** | Workflow stage instance | Milestones API | V3 | `milestones[].id` | Loan | Associate, comments string | → MilestoneSetting | start/finish **OFFICIAL_DOCUMENTATION** | Single `comments` string (not thread) | Milestone History Log (system) | `updateMilestones`, `finishMilestones` | Loan `milestone` | Names/order **LENDER_CONFIGURABLE** | Milestone finish rules | Partial | Overwrite comments | No |
| **Workflow Task** | Assignable work item | Workflow Task | V1 | Task `id` | Loan (workEntity) / associations | Subtasks, comments | ↔ Condition via URN | Create/update/complete **OFFICIAL_DOCUMENTATION** | `/tasks/{id}/comments` | Status, resolution | Create, Update, Delete | Workflow Tasks | Templates **LENDER_CONFIGURABLE** | Assignee + template auth | Partial | Yes | Hard delete |
| **Subtask** | Child of workflow task | Workflow Task | V1 | Subtask `id` | Task | Comments | Same assignee as parent **OFFICIAL_DOCUMENTATION** | Same as task | `/subtasks/{id}/comments` | Partial | Subtask CRUD WH | Workflow Tasks | Template | Task access | Partial | Yes | Hard delete |
| **Standard Condition** | eFolder requirement (legacy) | Standard Conditions | V1 | `conditionId` | Loan | Documents | n:m documents | Status in eFolder **OFFICIAL_DOCUMENTATION** | PATCH comments | Partial | **NOT_ESTABLISHED** dedicated WH | Use EC when enabled | Types **LENDER_CONFIGURABLE** | eFolder persona | Partial | Yes | **NOT_ESTABLISHED** |
| **Enhanced Condition** | Rich condition model | Enhanced Conditions | V3 | `id` | Loan | tracking, comments, documents | assignedTo → Documents | add/update/remove **OFFICIAL_DOCUMENTATION** | `/conditions/{id}/comments` | tracking[], statusDate | condition subevents | Loan `condition` | Templates/sets **LENDER_CONFIGURABLE** | Role actions on templates | Partial | Yes | `isRemoved` |
| **Document** | eFolder container | eFolder Document | V3 | `documentId` | Loan | Attachments, comments | ↔ Conditions n:m | create/update/status **OFFICIAL_DOCUMENTATION** | In GET `view=detail/full` | eFolder history API | document subevents | Loan `document` | Status labels **LENDER_CONFIGURABLE** | eFolder roles | Partial | Yes | `includeRemoved` |
| **Attachment** | Electronic file | eFolder Attachment | V3 | Attachment `id` | Document (assigned) | — | 1 doc at a time **OFFICIAL_DOCUMENTATION** | Upload/assign **OFFICIAL_DOCUMENTATION** | — | Via document | `attachment` create | Loan `attachment` | — | eFolder persona | File PII | Yes | — |
| **Conversation Log** | Loan communication record | Conversation Log | V3 PATCH / V1 GET | Log `id` | Loan | commentList[], alerts | Editable log | create/update **OFFICIAL_DOCUMENTATION** | body + LogCommentContract | updatedDateUtc | loan `update` partial | **NOT_ESTABLISHED** dedicated WH | Alert roles **LENDER_CONFIGURABLE** | Conversation log persona | Often | Yes | **NOT_ESTABLISHED** |
| **Note (Trade)** | Secondary trade annotation | Trade Notes | V1 | Note `id` | Correspondent Trade | — | Trade ↔ loans | Trade Updated **OFFICIAL_DOCUMENTATION** | `details` | Trade history | Trade Updated | Trades | — | Trade edit persona | Possible | Yes | **NOT_ESTABLISHED** delete |
| **Note (Contact)** | CRM contact note | Borrower Contacts | V1 | `noteId` | BorrowerContact | — | Contact ↔ loans indirect | Create **OFFICIAL_DOCUMENTATION** | subject/details | Partial | **NOT_ESTABLISHED** | — | — | CRM persona | Often | Partial | **NOT_ESTABLISHED** |
| **Disclosure Log (2015)** | TRID tracking entry | Disclosure Tracking | V3 | Log id | Loan | Snapshots | ↔ Document Order delivery | POST/PATCH logs **OFFICIAL_DOCUMENTATION** | **NOT_ESTABLISHED** comment API | Snapshots | `disclosureTracking` Beta | Loan WH Beta | Disclosure settings | Compliance persona | Often | Yes | — |
| **Document Order** | Generate LE/CD package | Encompass Docs | V1 | docSetOrder_id | Loan | Document package | → Delivery | Async generate **OFFICIAL_DOCUMENTATION** | — | Order status | Document Order WH | Doc Order | **LENDER_CONFIGURABLE** | Order persona | — | — | Async |
| **Document Delivery** | Send package to recipients | Encompass Docs | V1 | deliveryOrderID | Document Order | — | → Disclosure + eFolder | POST delivery **OFFICIAL_DOCUMENTATION** | — | Delivery WH | Document Delivery | — | Delivery persona | Often | — | — |
| **Field Change** | Loan field mutation event | Webhook + auditTrail | WH V1 / V3 | modifiedField | Loan field | — | — | Immutable event **OFFICIAL_DOCUMENTATION** | — | auditTrail POST | fieldchange, EFC | Loan WH | Field dictionary **LENDER_CONFIGURABLE** | Persona on GET | Often | **No** | N/A |
| **HTML Email Log** | System email record | Loan GET logs | V3 | Log entry id | Loan | — | System log | System-generated **OFFICIAL_DOCUMENTATION** | — | Append-only | **NOT_ESTABLISHED** | — | — | Read-only | Often | **No** | N/A |
| **Lock Action Log** | Exclusive lock audit | Loan GET logs | V3 | Log entry id | Loan | — | System log | lock/unlock **OFFICIAL_DOCUMENTATION** | — | Append-only | lock, unlock | Loan WH | — | — | No | **No** | N/A |
| **Organization** | Company hierarchy | Organizations | V1 | Org id | — | Users, branches | — | CRUD **OFFICIAL_DOCUMENTATION** | — | — | Orgs/Users WH | Orgs/Users | Admin | No | Admin | — |
| **User** | Internal/external account | Users | V3 | User id | Organization | — | → Associate | CRUD **OFFICIAL_DOCUMENTATION** | — | — | Orgs/Users WH | — | Persona **LENDER_CONFIGURABLE** | PII | Admin | — |
| **Trade** | Secondary marketing batch | Trades | V1 | tradeId | — | Notes, loans | ↔ Loan assignment | Trade CRUD **OFFICIAL_DOCUMENTATION** | Trade notes | Trade history | Trade Updated | Trades | — | Trade persona | Partial | — |

---

## Related documents

- [object-map.md](./object-map.md)
- [api-map.md](./api-map.md)
- [relationship-map.md](./relationship-map.md)

## Source references

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) — **OFFICIAL_DOCUMENTATION**
- [Workflow Task Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy) — **OFFICIAL_DOCUMENTATION**
- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions) — **OFFICIAL_DOCUMENTATION**
