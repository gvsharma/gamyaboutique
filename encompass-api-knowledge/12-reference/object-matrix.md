# Object matrix

| Object | Business meaning | API | Primary ID | Parent | Children | Relationships | Current state | History | Comments | Events | Webhook resource | Configurable | PII |
| ------ | ---------------- | --- | ---------- | ------ | -------- | ------------- | ------------- | ------- | -------- | ------ | ---------------- | ------------ | --- |
| Loan | Origination file | Loan Management / Pipeline | loan GUID | Folder | Apps, logs, docs, conditions, tasks | Associates, contacts | Get Loan entity; Pipeline columns | view=logs; auditTrail | via child objects | create/update/move/delete/change/EFC | Loan | templates, folders | High |
| Pipeline row | RDB projection | Pipeline | loanId | n/a | n/a | Canonical fields | Pipeline | Cursor snapshot only | No | Indirect via loan | Loan | RDB columns | Medium |
| Loan folder | Pipeline grouping | Loan Folders | folderName | Settings | Loans | move webhook | GET folder | NE | No | move | Loan | Settings (not API create) | Low |
| Loan associate | Role assignment on a loan | Associates / milestones | logId + userId | Loan, Role | n/a | Fixed roles LO/Processor/Closer/UW | GET associates | NE as dedicated history | No | via milestone update | Loan/milestone | Roles **LENDER CONFIGURABLE** | Medium |
| Milestone | Workflow step | V3 milestones | milestoneId | Loan | Associates | 13 predefined names | GET milestones | Milestone History system log | entityType Milestone | milestone update/finish | Loan | Names/templates **LC** | Low |
| Workflow task | Assignable unit of work | `/workflow/v1/tasks` | taskId | Loan (assoc) | Subtasks, comments | Templates, user groups | GET task | NE native | Task comments | Task C/U/D | Task | Templates **LC** | Low |
| Subtask | Child work | subtasks APIs | subTaskId | Task | Comments | | GET subtask | | Yes | Subtask C/U/D | SubTask | | Low |
| Standard condition | eFolder condition (legacy) | V1 conditions/* | conditionId | Loan | Documents | Types UW/PC/Prelim | GET conditions | logs if present | Yes | Prefer enhanced events | Loan | **LC** | Low |
| Enhanced condition | Customizable condition | V3 conditions | conditionId | Loan | Tracking, comments, documents | Types/sets/templates | GET conditions | tracking entries | Yes | condition subevents | Loan + template/type | **LC** | Low |
| Tracking entry | Condition status step | tracking API | entry id | Enhanced condition | | Delegated statuses 26.2 | GET tracking | the entries themselves | | status change | Loan | Types **LC** | Low |
| eFolder document | Tracker “folder” | Documents V3 | documentId | Loan | Attachments, comments | Conditions M:N | GET documents | document events | Yes | document subevents | Loan | Templates | Medium |
| Attachment | File bytes | Attachments V3 | attachmentId | Loan; 1 document | | | GET attachment meta | | | attachmentCreated | Loan | | High |
| Document order | Generated package | encompassdocs | orderId | Loan | Documents in package | Delivery, DT | order webhooks | order events | | DocumentOrder events | DocumentOrder | | Medium |
| Delivery package | Fulfillment | delivery/v3 | packageId | Loan | Recipients | Order | GET packages | packageUpdated | | DocumentDelivery | DocumentDelivery | | Medium |
| Disclosure tracking log | LE/CD send record | DT 2015 APIs | disclosureLogId | Loan | Snapshot | Orders | GET logs | snapshots | | disclosureTracking beta | Loan | Settings **LC** | Medium |
| Conversation log | Communication + follow-up alert | Conversation Logs | log id | Loan | Alerts | | GET logs | system/editable | in log | NE dedicated | via Loan logs | | High |
| Comment | Note on an entity | LogCommentContract | comment id | Document/Condition/Task/… | | forRole | GET comments | addedDate | itself | condition comment; TaskComment | varies | | Medium |
| Internal user | Encompass user / HLA candidate | Users V3 | user Id | Organization | Personas, groups | Associates | GET users | | | InternalUsers C/U/D | InternalUsers | Personas **LC** | High |
| Persona | Rights pack | Personas | persona id | Settings | Rights categories | Users | GET persona | | | | | **LC** | Low |
| Role | Milestone/free role | Associates / settings | roleId | Settings | Associates | Fixed four names | GET associates | | | | | **LC** | Low |
| User group | Group assignment | Webhook UserGroup | group id | Settings | Members | Task Pipeline | NE CRUD page | | | UserGroup events | UserGroup | **LC** | Low |
| Contact | Borrower/business party | Contacts | contactId | Loan relationships | | | GET contact | | | | | | High |
| Canonical field | Pipeline column | Canonical Names | canonicalName | RDB | | Field IDs | GET canonicalFields | | | | | RDB **LC** | varies |
| Webhook subscription | Callback registration | Subscriptions | subscriptionId | Client | events[] | signing key | GET subscription | | | n/a | | | Low |
