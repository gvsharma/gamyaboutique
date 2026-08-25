# Loan Management

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)

## Endpoints (V3)

| Name | Method | Path | Doc |
| ---- | ------ | ---- | --- |
| Create Loan | POST | `/encompass/v3/loans` | create-loan-1 |
| Get Loan | GET | `/encompass/v3/loans/{loanId}` | get-loan-1 |
| Update Loan | PATCH | `/encompass/v3/loans/{loanId}` | update-loan-1 |
| Delete Loan | DELETE | `/encompass/v3/loans/{loanId}` | delete-loan-1 |
| Field Reader | POST | `/encompass/v3/loans/{loanId}/fieldReader` | v3-field-reader |
| Field Writer | POST | `/encompass/v3/loans/{loanId}/fieldWriter` | v3-field-writer |
| Resource locks | GET/POST/DELETE | `/encompass/v3/resourceLocks` | get-a-resource-lock |

Loan ID: 32-digit GUID assigned at create; lifetime stable.

## Views

| view | Official meaning |
| ---- | ---------------- |
| entity | Everything except log entries |
| logs / log | Only log entries |
| full | Content + logs (largest) |
| id | IDs of created/updated resources (create/update only) |
| omitted on create/update | 204 No Content |

As of **24.2**, log entities only appear for `view=logs` or `full`. **VERSION DEPENDENT**

Get Loan query params (official): `entities`, `includeEmpty`, `includeRemoved`, `view`.

Update also: `action` (incl. TPO actions), `templateType`, `templatePath`, `preview`, `lockId`.

## Four entity types (V3 contract)

| Type | Official behavior | Examples |
| ---- | ----------------- | -------- |
| Fixed collections | Pre-populated; never truly deleted; no reorder; standard field IDs | File Contacts, Fixed Assets, Custom Fields |
| Variable collections | Generated ids; add/update/remove/reorder; nested URL patterns | VoD, VoL, VoE |
| Editable logs | No field IDs generally; CRUD via dedicated endpoints incrementally | AUS Tracking, Conversation Logs |
| System logs | Cannot be edited | Milestone History, HTML Email, Lock Action |

## Which API for what

| Need | API |
| ---- | --- |
| Loan **list** | Pipeline, not Get Loan |
| **One** loan | GET V3 Get Loan with the smallest `view`/`entities` |
| Logs | GET Loan `view=logs` or dedicated log APIs |
| History of fields | POST auditTrail |
| Schema | GET `/encompass/v3/schemas/loan` |
| Custom field defs | GET `/encompass/v3/settings/loan/customFields` |
| Field metadata | GET `/encompass/v3/schemas/loan/standardFields` |

V1 Get Loan still exists (`/encompass/v1/loans/{loanId}`) with export `format` values. V1 importer deprecated 26.1 → V3 converter.

## Permissions / limits

Persona + loan access. **LENDER CONFIGURABLE**. 40 MB loan-file cap. 6 MB response cap.

## Webhooks

Loan resource events: create, update, submit, move, document, attachment, condition, milestone, change, fieldchange, enhancedfieldchange, delete, lock, unlock, alertchange, disclosureTracking (beta). Internal: reportingdbupdate, milestoneupdate.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
