# API matrix

Research date: 2026-08-25. Empty cells or “NE” = **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION**. URLs are under `https://developer.icemortgagetechnology.com/developer-connect/reference/` unless noted as `/docs/`.

Legend: R=read W=write P=pagination F=filter S=sort WH=webhook

| Domain | API | Ver | Endpoint | Method | Purpose | Primary object | R | W | P | F | S | WH | Event | Dashboard | Reporting | Notes |
| ------ | --- | --- | -------- | ------ | ------- | -------------- | - | - | - | - | - | -- | ----- | --------- | --------- | ----- |
| Auth | Token issuance | oauth2 | `/oauth2/v1/token` | POST | Access token | Token | | Y | | | | | | Required | | Password grant for lenders |
| Auth | Introspect | oauth2 | `/oauth2/v1/token/introspection` | POST | Validate token | Token | Y | | | | | | | Ops | | |
| Pipeline | V1 Loan Pipeline | v1 | `/encompass/v1/loanPipeline` | POST | Search loans | Loan summary | Y | | | Y | Y | | | Hydrate | | RDB async |
| Pipeline | V1 Create Cursor | v1 | `/encompass/v1/loanPipeline?cursorType=randomAccess` | POST | Large-set cursor | Cursor | Y | | Y | Y | Y | | | Bulk hydrate | | 10 cursors; 5 min idle; 12 h max |
| Pipeline | V1 Pipeline pages | v1 | `/encompass/v1/loanPipeline?cursor=` | POST | Page cursor | Loan summary | Y | | Y | | | | | Bulk hydrate | | Body fields only |
| Pipeline | V1 Canonical names | v1 | `/encompass/v1/loanPipeline/fieldDefinitions` | GET | Field catalog | Field def | Y | | | | | | | Once/cache | | criterionFieldName |
| Pipeline | V3 Loan Pipeline | v3 | `/encompass/v3/loanPipeline` | POST | Real-time pipeline pages | Loan summary | Y | | Y | Y | Y | | | **Primary list** | | Max 1000/page |
| Pipeline | V3 Pipeline report | v3 | `/encompass/v3/loanPipeline/report` | POST | Snapshot reports | Loan summary | Y | | Y | Y | Y | | | Avoid UI | **Yes** | GA 24.3; 1 h cursor |
| Pipeline | V3 Canonical names | v3 | `/encompass/v3/loanPipeline/canonicalFields` | GET | Field catalog | Field def | Y | | | Y | | | | Discover HLA field | | |
| Pipeline | Create Pipeline View | v3 | `/encompass/v3/users/me/views/pipelineViews` | POST | Save view | PipelineView | | Y | | Y | Y | | | No — Preview | | Not production |
| Loan | V3 Get Loan | v3 | `/encompass/v3/loans/{loanId}` | GET | Loan file | Loan | Y | | | entities | | Loan | many | Detail miss | | views entity/logs/full |
| Loan | V3 Create Loan | v3 | `/encompass/v3/loans` | POST | Create | Loan | | Y | | | | Loan | create | No | | |
| Loan | V3 Update Loan | v3 | `/encompass/v3/loans/{loanId}` | PATCH | Update | Loan | | Y | | | | Loan | update/change | No | | TPO actions |
| Loan | V3 Delete Loan | v3 | `/encompass/v3/loans/{loanId}` | DELETE | Permanent delete | Loan | | Y | | | | Loan | delete | No | | |
| Loan | Field Reader | v3 | `/encompass/v3/loans/{loanId}/fieldReader` | POST | Field IDs | Fields | Y | | | | | | | Targeted miss | | Default Fail 24.2 |
| Loan | Field Writer | v3 | `/encompass/v3/loans/{loanId}/fieldWriter` | POST | Write fields | Fields | | Y | | | | | | No | | |
| Loan | Loan schema | v3 | `/encompass/v3/schemas/loan` | GET | JSON schema | Schema | Y | | | entities | | | | Cache | | No virtuals in dictionary |
| Loan | Field schema | v3 | `/encompass/v3/schemas/loan/standardFields` | GET | Standard fields | Field def | Y | | Y | Y | | | | Cache | | jsonPath |
| Loan | Virtual fields | v3 | `/encompass/v3/schemas/loan/virtualFields` | GET | Virtual fields | Field def | Y | | | Y | | | | Cache | | LoanAssociate type |
| Loan | Custom fields | v3 | `/encompass/v3/settings/loan/customFields` | GET | Custom defs | Field def | Y | | | Y | | | | Cache | | |
| Loan | Audit trail | v3 | `/encompass/v3/loans/{loanId}/auditTrail` | POST | Field history | Audit | Y | | Y | | | | | History store | | RDB |
| Loan | Batch update | v1 | `/encompass/v1/loanBatch/updateRequests` | POST | Mass write | Batch | | Y | | Y | | delayed | | No | | Admin; no calcs/rules |
| Folders | List folders | v3 | `/encompass/v3/loanFolders` | GET | Folder list | Folder | Y | | | | | Loan | move | Filter UI | | Created in Settings |
| Associates | List associates | v1 | `/encompass/v1/loans/{id}/associates` | GET | Roles on one loan | Associate | Y | | | userId/roleId | | | | Detail | | Not bulk HLA list |
| Associates | Assign | v1 | `/encompass/v1/loans/{id}/associates/{logId}` | PUT | Assign user | Associate | | Y | | | | | | No | | |
| Milestones | List logs | v3 | `/encompass/v3/loans/{loanId}/milestones` | GET | Worksheet | Milestone | Y | | | | | Loan | milestone | Detail + GRID | | GA 24.1 |
| Milestones | Update log | v3 | `/encompass/v3/loans/{loanId}/milestones/{milestoneId}` | PATCH | Update/assign | Milestone | | Y | | | | Loan | milestone | No | | |
| Tasks | Get tasks | wf | `/workflow/v1/tasks` | GET | Task instances | Task | Y | | Y | Y | Y | Task | create/update/delete | Detail | | |
| Tasks | Task pipeline | wf | `/workflow/v1/taskPipeline` | GET | Caller’s open tasks | Task | Y | | Y | | Y | | | HLA queue if impersonating | | Not all-loan |
| Tasks | Create task | wf | `/workflow/v1/tasks` | POST | Create | Task | | Y | | | | Task | create | No | | |
| Conditions | UW/PC/Prelim | v1 | `/encompass/v1/loans/{id}/conditions/*` | GET/POST/PATCH | Standard | Condition | Y | Y | Y | Y | Y | | | If not enhanced | | |
| Conditions | Enhanced list | v3 | `/encompass/v3/loans/{id}/conditions` | GET | Enhanced | Condition | Y | | | | | Loan | condition | If enhanced | | Flag ENHANCEDCOND.X1 |
| Conditions | Enhanced manage | v3 | `/encompass/v3/loans/{id}/conditions` | PATCH | Add/update/remove/dup | Condition | | Y | | | | Loan | condition | No | | |
| Conditions | Tracking | v3 | `.../conditions/{id}/tracking` | GET/PATCH | Status history | Tracking | Y | Y | | | | Loan | status change | Detail | | |
| Conditions | Automated eval | v3 | `/encompass/v3/calculators/automatedConditions` | POST | Rule templates | Template | Y | | | | | | | No | | |
| eFolder | Documents | v3 | `/encompass/v3/loans/{id}/documents` | GET/PATCH | Document trackers | Document | Y | Y | Y | | | Loan | document | Detail | | documentStatus 26.1 |
| eFolder | Attachments | v3 | `/encompass/v3/loans/{id}/attachments` | GET/PATCH | Files | Attachment | Y | Y | Y | | | Loan | attachment | On demand | | V1 sunset 26.3 |
| Docs | Document order | docs | `/encompassdocs/v1/documentOrders/*` | POST | Generate/send pkgs | Order | | Y | | | | DocumentOrder | many | No | | |
| Docs | Delivery packages | v3 | `/delivery/v3/loans/{id}/packages` | GET | Delivery status | Package | Y | | | | | DocumentDelivery | package* | Detail | | 24.3 |
| Docs | DT 2015 | v3 | `/encompass/v3/loans/{id}/disclosureTracking2015Logs` | GET/POST/PATCH | LE/CD tracking | DT log | Y | Y | | | | Loan | disclosureTracking beta | Detail | | Verify path |
| Comms | Conversation logs | v3 | `/encompass/v3/loans/{id}/conversationLogs` | GET/PATCH | Conversations | Conv log | Y | Y | | | | | | Detail | | Also view=logs |
| People | Internal users | v3 | `/encompass/v3/users` | GET/POST | Users | User | Y | Y | | org | | InternalUsers | CRUD | HLA list | | 24.2 |
| People | Personas | v3 | `/encompass/v3/settings/personas` | GET | Personas | Persona | Y | | Y | type | | | | Cache | | limit max 1000 |
| People | Effective rights | v1 | `/encompass/v1/company/users/{userId}/effectiveRights` | GET | Rights union | Rights | Y | | | | | | | AuthZ | | |
| Events | Subscriptions | wh | `/webhook/v1/subscriptions` | POST/GET/PUT | Subscribe | Subscription | Y | Y | | | | n/a | | Required | | Auto-delete 30d |
| Events | Resources | wh | `/webhook/v1/resources` | GET | Catalog | Resource | Y | | | | | | | | | |
| Secondary | ICE PPE rates | epps | `/epps/v2/*` | POST/GET | Pricing | Rate | Y | Y | | | | | | Later | | Separate account |
| Services | Batch status | v1 | `/encompass/v1/loanBatch/updateRequests/{id}` | GET | Job status | Batch | Y | | | | | delayed | | Ops | | |

Concurrency default 30. Source: `/docs/concurrency-limits`.
