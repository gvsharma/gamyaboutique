# V1 Loan Pipeline

## V1 Loan Pipeline (simple)

| Item | Value |
| ---- | ----- |
| Official name | V1 Loan Pipeline |
| Version | V1 |
| Method | POST |
| Endpoint | `/encompass/v1/loanPipeline` (docs also show `/encompass/v1/loanPipeline?limit=`) |
| URL | https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline |
| Purpose | Loan GUIDs + specified fields for loans the user can access |
| Domain | Pipeline / RDB |
| Auth | Bearer |
| Pagination | Not this call; use Create Cursor + paginated variant |
| Filtering | Body `filter` (canonicalName, matchType, value, …) |
| Sorting | Body `sortOrder` |
| Permissions | Any pipeline-capable persona; admin faster |
| Errors | 400, 401, 403, 404, 500 |
| Deprecation | Title renamed from “V1 View Pipeline” in 24.2 (EDC-1040). Not sunset. |

Must send `filter` **or** `loanGuids`, not both. Specify `fields`.

Example filter from ICE:

```json
{
  "canonicalName": "Loan.LoanFolder",
  "value": "My Pipeline",
  "matchType": "exact",
  "include": true
}
```

ICE: “to return only the loans in My Pipeline, filter by canonical name or user ID.” The **user ID canonical name is not given**. Discover via Get Canonical Names.

## V1 Create Cursor

| Item | Value |
| ---- | ----- |
| Official name | V1 Create Cursor |
| Method | POST |
| Endpoint | `/encompass/v1/loanPipeline?cursorType=randomAccess&limit=<count>` |
| URL | https://developer.icemortgagetechnology.com/developer-connect/reference/create-cursor |
| Purpose | Create a random-access cursor for large sets |
| Requires | Encompass **17.3+** |
| Cursor idle | 5 minutes |
| Max life | 12 hours with continuous use |
| Max cursors | 10 (24.3: not shared with contact APIs; 409 if exceeded) |
| Headers | `x-cursor`, `x-total-count` |
| Note | When `cursorType` is set, request can only include a **filter** attribute (usage notes) |

`limit` may be overridden by the server.

## V1 Loan Pipeline (with Pagination)

| Item | Value |
| ---- | ----- |
| Official name | V1 Loan Pipeline (with Pagination) |
| Method | POST |
| Endpoint | `/encompass/v1/loanPipeline` |
| URL | https://developer.icemortgagetechnology.com/developer-connect/reference/post-encompass-v1-loanpipeline |
| Query | `cursor` (required), `start` (default 0), `limit`, `ignoreInvalidFields` (default false) |
| Body | **Only `fields`** on this call |
| Snapshot | Yes — from cursor creation |

Live sample (ICE):

```json
[
  {
    "loanGuid": "b9e4651c-a326-4288-884d-224f862a77e9",
    "fields": {
      "Loan.LoanFolder": "My Pipeline",
      "Loan.LoanNumber": "",
      "Loan.LoanRate": "8.25000",
      "Loan.LoanAmount": "57000.0000",
      "Fields.4002": "Example",
      "Loan.LastModified": "5/4/2021 3:24:50 AM",
      "Loan.BorrowerName": "Example, FHA Fixed"
    }
  }
]
```

## V1 Get Pipeline Canonical Names

`GET /encompass/v1/loanPipeline/fieldDefinitions`

Maps pipeline `canonicalName` ← response `criterionFieldName`.

ICE sample names include `Loan.LoanFolder`, `Loan.DateofFinalAction`, `Loan.CreditScore`, `Fields.2608` — **not** Loan Officer.

## Webhooks

None specific to Pipeline queries. Loan webhooks update the **loan file**; Pipeline lags until RDB catches up.
