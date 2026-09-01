# V3 Loan Pipeline for Reports

| Item | Value |
| ---- | ----- |
| Official name | V3 Loan Pipeline for Reports |
| Version | V3 (GA 24.3; docs: GA 2024-12-15) |
| Method | POST |
| Endpoint | `/encompass/v3/loanPipeline/report` |
| URL | https://developer.icemortgagetechnology.com/developer-connect/reference/v3-create-cursor |
| Purpose | Report generation from a **snapshot** cursor |
| Not for | “all real time pipeline results” — use `POST /encompass/v3/loanPipeline` |
| Auth | Bearer |
| Query | `ignoreInvalidFields`, `start`, `limit`, `cursorId` |
| Body | `LoanPipelineQueryBaseContract`: fields, sortOrder, filter, orgType, tpoId, loanOwnership, loanFolders, includeArchivedLoans |
| Cursor idle | 5 minutes |
| Max life with use | **1 hour** (this page; V1 create-cursor says 12 hours — **VERSION DEPENDENT** / different APIs) |
| Max cursors | 10 per instance; 11th removes oldest *or* 409 as of 24.3 (both statements exist; treat 409 as current) |
| Errors | 200, 400, 403, 404, 409 |

## Two-step orchestration

1. POST **without** `cursorId` + full filter → response page + header `X-Cursor`
2. POST with `cursorId`, `start`, `limit`; filter cached server-side

## Dashboard

**INTERNAL ARCHITECTURE RECOMMENDATION:** do **not** use `/report` for the manager grid. Use it for exports, MTT batch jobs, overnight snapshots.

## Webhooks

None specific.
