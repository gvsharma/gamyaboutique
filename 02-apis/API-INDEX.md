# Encompass Developer Connect — API Index

Complete API matrix mapping domain objects to official Developer Connect endpoints.

**Primary source:** [Encompass Developer Connect](https://developer.icemortgagetechnology.com/developer-connect/reference/)

## API Matrix

| Domain | API | Version | Endpoint | Purpose | Read | Write | Events | Webhook | Notes |
|--------|-----|---------|----------|---------|------|-------|--------|---------|-------|
| Loan | V3 Get Loan | V3 | `GET /encompass/v3/loans/{loanId}` | Retrieve loan file | ✓ | | update, change, EFC | ✓ | `view=entity\|logs\|full` |
| Loan | V3 Create Loan | V3 | `POST /encompass/v3/loans` | Create loan | | ✓ | create | ✓ | Requires `loanFolder` |
| Loan | V3 Update Loan | V3 | `PATCH /encompass/v3/loans/{loanId}` | Update loan data | | ✓ | update, change, EFC | ✓ | Supports `lockId` |
| Loan | V3 Delete Loan | V3 | `DELETE /encompass/v3/loans/{loanId}` | Delete loan | | ✓ | delete | ✓ | Permanent delete |
| Loan Fields | V3 Field Reader | V3 | `POST .../fieldReader` | Read field IDs | ✓ | | fieldchange | ✓ | Persona-scoped |
| Loan Fields | V3 Field Writer | V3 | `POST .../fieldWriter` | Write field IDs | | ✓ | fieldchange, EFC | ✓ | |
| Loan Fields | V3 Audit Trail | V3 | `POST .../auditTrail` | Field audit history | ✓ | | | | Pagination: start/limit |
| Loan Schema | V3 Get Loan Schema | V3 | `GET /encompass/v3/schemas/loan` | Data contract | ✓ | | | | |
| Loan Pipeline | V3 Loan Pipeline | V3 | `POST /encompass/v3/loanPipeline` | Search pipeline | ✓ | | | | Cursor pagination |
| Application | V1 Borrower Pairs | V1 | `GET/POST .../applications` | Borrower pairs | ✓ | ✓ | change | ✓ | Also in V3 loan body |
| Borrower | V3 Loan (embedded) | V3 | `GET /encompass/v3/loans/{loanId}` | Borrower data | ✓ | ✓ | change, EFC | ✓ | Under applications[] |
| Assets | V3 Loan (embedded) | V3 | Loan PATCH / apps | VODs, assets | ✓ | ✓ | change | ✓ | Variable collection |
| Liabilities | V3 Loan (embedded) | V3 | Loan PATCH / apps | VOLs | ✓ | ✓ | change | ✓ | Variable collection |
| Employment | V3 Loan (embedded) | V3 | Loan PATCH / apps | VoEs, employment | ✓ | ✓ | change | ✓ | Applicant-scoped paths |
| Contacts | Business Contact Settings | V3 | `/encompass/v3/settings/contacts/...` | Contact field defs | ✓ | | | | |
| Associates | V1 Associates | V1 | `GET .../associates` | Loan team | ✓ | ✓ | update | ✓ | |
| Associates | V3 Milestone Associate | V3 | `PATCH .../milestones/{id}` | Assign on milestone | | ✓ | milestone | ✓ | loanAssociate object |
| Milestones | V3 Milestones | V3 | `GET/PATCH .../milestones` | Workflow stages | ✓ | ✓ | milestone | ✓ | doneIndicator |
| Milestones | V3 Settings | V3 | `GET /encompass/v3/settings/milestones` | Milestone config | ✓ | | | | LENDER CONFIGURABLE |
| Workflow Tasks | Task Instances | V1 | `/workflow/v1/tasks` | Work items | ✓ | ✓ | | ✓ | Task Create/Update/Delete |
| Workflow Tasks | Task Pipeline | V1 | `GET /workflow/v1/taskPipeline` | User queue | ✓ | | | | Incomplete tasks only |
| Task Templates | Task Templates | V1 | `/workflow/v1/templates/task/items` | Template config | ✓ | ✓ | | | Admin |
| Subtasks | Subtask API | V1 | `.../tasks/{id}/subtasks` | Child tasks | ✓ | ✓ | | ✓ | Same assignee as parent |
| Conditions | V1 Standard | V1 | `.../conditions/{type}` | Standard conditions | ✓ | ✓ | | | If enhanced=false |
| Enhanced Conditions | V3 Conditions | V3 | `GET/PATCH .../conditions` | Enhanced conditions | ✓ | ✓ | condition | ✓ | If enhanced=true |
| Enhanced Condition Types | Settings Types | V3 | `.../settings/loan/conditions/types` | Type config | ✓ | ✓ | | | LENDER CONFIGURABLE |
| Enhanced Condition Sets | Settings Sets | V3 | `.../settings/loan/conditions/set` | Set config | ✓ | | | | |
| Enhanced Condition Templates | Settings Templates | V3 | `.../settings/loan/conditions/templates` | Templates | ✓ | ✓ | | | |
| Automated Conditions | Evaluator | V3 | `POST .../calculators/automatedConditions` | Rule evaluation | ✓ | | | | Returns applicable templates |
| Documents | V3 Documents | V3 | `GET/PATCH .../documents` | eFolder docs | ✓ | ✓ | document | ✓ | documentStatus 26.1+ |
| eFolder | V3 eFolder History | V3 | `GET .../histories/eFolder` | eFolder history | ✓ | | | | |
| Attachments | V3 Attachments | V3 | `GET .../attachments` | Files | ✓ | ✓ | attachment | ✓ | V1 sunset 26.3 |
| Attachments | Upload URL | V3 | `POST .../attachmentUploadUrl` | Cloud upload | | ✓ | attachment | ✓ | |
| Document Orders | Opening Order | V1 | `POST .../documentOrders/opening` | Generate LE package | | ✓ | | ✓ | Async doc set ID |
| Document Orders | Closing Order | V1 | `POST .../documentOrders/closing` | Generate CD package | | ✓ | | ✓ | Requires eClose |
| Document Delivery | Opening Delivery | V1 | `POST .../opening/{id}/delivery` | Send LE package | | ✓ | | ✓ | Creates disclosure log |
| Document Delivery | Closing Delivery | V1 | `POST .../closing/{id}/delivery` | Send CD package | | ✓ | | ✓ | Async deliveryOrderID |
| Disclosure Tracking | V3 2015 Logs | V3 | `.../disclosureTracking2015Logs` | TRID tracking | ✓ | ✓ | disclosureTracking | ✓ | Beta webhook |
| Conversation Logs | V1 List/Get | V1 | `.../conversationLogs` | Read comm logs | ✓ | | update | | Editable log |
| Conversation Logs | V3 Create | V3 | `PATCH .../conversationlogs` | Create comm logs | | ✓ | update | | Alerts supported |
| Notes | Trade Notes | V1 | `/secondary/v1/trades/.../notes` | Trade annotations | ✓ | ✓ | | ✓ | Trade Updated |
| Notes | Borrower Contact Notes | V1 | `.../borrowerContacts/{id}/notes` | CRM notes | | ✓ | | | Not loan-level |
| Comments | Condition Comments | V3 | `.../conditions/{id}/comments` | Condition notes | ✓ | ✓ | condition | ✓ | LogCommentContract |
| Comments | Task Comments | V1 | `.../tasks/{id}/comments` | Task notes | ✓ | ✓ | | ✓ | Task Comment Update |
| Loan Logs | V3 Get Loan logs | V3 | `GET ...?view=logs` | Editable + system logs | ✓ | | | | System logs read-only |
| Field Changes | fieldchange webhook | V1 | Subscription filter | Field notifications | | | fieldchange | ✓ | Max 50 filters |
| Enhanced Field Change | EFC webhook | V1 | Subscription | All field changes | | | enhancedfieldchange | ✓ | Previous+new values |
| Organizations | V1 Organizations | V1 | `/encompass/v1/organizations` | Org hierarchy | ✓ | | | ✓ | |
| Users | V3 Internal Users | V3 | `/encompass/v3/users` | Employee accounts | ✓ | ✓ | | ✓ | Added 24.2 |
| Users | V3 External Users | V3 | `/encompass/v3/externalUsers` | TPO users | ✓ | ✓ | | ✓ | |
| Roles | V3 Roles | V3 | `/encompass/v3/settings/roles` | Loan roles | ✓ | | | | Added 25.1 |
| Schedulers | Timer webhooks | V1 | Timer resource | Scheduled events | | | | ✓ | No REST CRUD documented |
| EPC | ServiceOrder webhooks | V1 | EPC resources | Partner orders | | | | ✓ | EPC orders only |
| DDA | DDA webhooks | V1 | DDA resources | Automation | | | | ✓ | Limited availability |
| Trades | Correspondent Trades | V1 | `/secondary/v1/trades/correspondent` | Secondary trades | ✓ | ✓ | | ✓ | |
| Webhooks | Subscriptions | V1 | `/webhook/v1/subscriptions` | Event subscriptions | ✓ | ✓ | | | signingkey required |
| Webhooks | Resources/Events | V1 | `/webhook/v1/resources` | Catalog | ✓ | | | | |
| Locking | V3 Resource Locks | V3 | `/encompass/v3/resourceLocks` | Exclusive lock | ✓ | ✓ | lock, unlock | ✓ | Loan only |

## Documentation Map

| File | Coverage |
|------|----------|
| [loan-api.md](./loan-api.md) | Loan Management, fields, schema |
| [milestone-api.md](./milestone-api.md) | Milestones & associates |
| [task-api.md](./task-api.md) | Workflow tasks, subtasks, templates |
| [condition-api.md](./condition-api.md) | Standard conditions |
| [enhanced-condition-api.md](./enhanced-condition-api.md) | Enhanced condition instances |
| [condition-template-api.md](./condition-template-api.md) | Types, sets, templates, automated |
| [document-api.md](./document-api.md) | eFolder documents |
| [attachment-api.md](./attachment-api.md) | Attachments & upload/download |
| [document-order-api.md](./document-order-api.md) | Encompass Docs orders |
| [document-delivery-api.md](./document-delivery-api.md) | Package delivery |
| [disclosure-api.md](./disclosure-api.md) | Disclosure Tracking 2015 |
| [conversation-log-api.md](./conversation-log-api.md) | Conversation logs |
| [notes-api.md](./notes-api.md) | Entity-scoped notes |
| [field-change-api.md](./field-change-api.md) | Field change & EFC |
| [webhook-api.md](./webhook-api.md) | Subscriptions & notifications |
| [users-organizations-api.md](./users-organizations-api.md) | Orgs, users, roles |
| [scheduler-api.md](./scheduler-api.md) | Timer webhooks |
| [epc-api.md](./epc-api.md) | Partner Connect |
| [dda-api.md](./dda-api.md) | Data & Document Automation |
| [trades-api.md](./trades-api.md) | Secondary marketing |
| [api-authentication.md](./api-authentication.md) | OAuth 2.0 |
| [api-error-handling.md](./api-error-handling.md) | HTTP errors |
| [api-pagination.md](./api-pagination.md) | Pagination & filters |
| [api-version-matrix.md](./api-version-matrix.md) | Version cross-reference |
| [api-production-guidelines.md](./api-production-guidelines.md) | Production patterns |

## Domain Model Cross-Reference

See [01-domain/README.md](../01-domain/README.md) for business domain documentation.

## Legend

| Symbol | Meaning |
|--------|---------|
| ✓ | Supported per official documentation |
| (empty) | Not applicable or not primary mechanism |
| EFC | enhancedfieldchange webhook |

## Gaps (NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION)

- Global loan-level Notes REST API
- Schedulers REST CRUD
- DDA REST API (webhook-only in catalog reviewed)
- Complete standard condition field contract in single reference table
