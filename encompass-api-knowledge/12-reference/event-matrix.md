# Event matrix

Loan events source: [wbhks-re-cat-loan](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan). Others as cited. Retry policy numeric: **NOT ESTABLISHED**. Dedup: `eventId`. Envelope: eventId, eventTime, eventType, meta.* .

| Resource | Event | Trigger (official) | Extra payload | Actor | Dashboard effect | Enablement |
| -------- | ----- | ------------------ | ------------- | ----- | ---------------- | ---------- |
| Loan | create | New loan started | | userId | Add to HLA index if filter matches | Subscribe |
| Loan | update | Loan file update | | | Refresh compact loan | Subscribe |
| Loan | submit | ECC Submit clicked | | | Status/channel | ECC |
| Loan | move | Folder change incl. Trash | prior/new folder | | Re-index folder; maybe drop from grid | Subscribe |
| Loan | document | create/update/assignAttachments | | | Document activity | API |
| Loan | attachment | attachmentCreated | | | Document activity | API |
| Loan | condition | create/update/assign/assignDocument/remove/comment/status change | | | Condition counts/aging | API |
| Loan | reportingdbupdate | Internal | | | Ignore | N/A |
| Loan | milestone | updateMilestones, finishMilestones | id+title list | | Milestone column, duration | API |
| Loan | milestoneupdate | Internal | | | Ignore | N/A |
| Loan | change | Filtered JSON paths | changed attrs | | Patch GRID | filters required |
| Loan | fieldchange | Filtered fields | subject + downstream | | Patch GRID | filters.attributes |
| Loan | enhancedfieldchange | Create or change | previous+new; multipart possible | | Patch GRID without Get Loan | Support ticket + subscribe |
| Loan | delete | Permanent delete | | | Remove keys | Subscribe |
| Loan | lock | Exclusive lock | | | Lock column; reconcile | Not guaranteed RT |
| Loan | unlock | Unlock | | | Lock column | Not guaranteed RT |
| Loan | alertchange | Compliance alert open/clear | | | Optional badge | Limited Availability |
| Loan | disclosureTracking | DT log C/U | | | Disclosure tab | Beta |
| EnhancedConditionTemplate | Create/Update/Delete | Template admin | | | Refresh config cache | Support ticket |
| EnhancedConditionType | Create/Update/Delete | Type admin | | | Refresh config | Support ticket |
| Task | Create/Update/Delete | Task instance | | | Task counts | Subscribe |
| SubTask | Create/Update/Delete | Subtask | | | Task detail | Subscribe |
| TaskComment | Update | Comment or disposition | modifiedAttributes | | Activity | 24.2 |
| TaskGroup | C/U/D | Groups | | | Avoid — Task Groups deprecated 24.3 | |
| DocumentOrder | opening/closing/forms *completed/*failed | Package pipeline | | | Delivery/disclosure | API |
| DocumentDelivery | packageCreated/Updated | eDelivery | fulfillment fields | | Delivery status | 24.2 |
| DocumentDelivery | fulfillmentCreated/Updated | Fulfillment | | | Limited Availability | |
| InternalUsers | C/U/D | User admin | | | HLA roster | Subscribe |
| ExternalUsers | C/U/D | TPO users | | | If TPO dashboard | |
| External Organizations | C/U | TPO orgs | | | | Smart Client |
| UserGroup | C/U/D | Group membership | members[] | | Task Pipeline membership | Smart Client |
| Timer | Created/Completed/Changed/Cancelled | Scheduler | status, associations | | SLA timers if used | Templates+rules |
| Trade | Create/Publish/Update/Loan Assignment Complete | Secondary | | | Out of HLA MVP | API; Void/Update Status not supported |
| ServiceOrder | placed/acknowledged/fulfilled/… | EPC | partnerId, productId | | Services later | EPC only |
| DDA * | various | Analyzers/mail | | | If licensed | Limited; CSM |

Signature headers: `Elli-Signature`, `Elli-SubscriptionId`, `Elli-Environment=prod`. Source: signing-keys.
