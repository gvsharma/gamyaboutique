# Loan Pipeline family

The Pipeline APIs search **loans the caller can see** and return **loan IDs plus selected canonical fields**. They are the supported way to retrieve many loans without opening each file.

Source: [Loan Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-pipeline)

## Problem they solve

“Retrieve a long list of loans from the server but you cannot afford to pull all of these items to the client.” Pagination (`start`, `limit`, cursor) exists for that.

## When to use

- Manager/HLA **grid** hydration (loan number, amount, borrower name, dates, lock)
- Reconciliation sweeps against Redis
- Avoiding N+1 Get Loan (ICE concurrency guide)

## When not to use

- Full loan JSON, logs, attachments, condition tracking detail
- Strictly live post-save reads (RDB is async)
- Heavy reporting snapshots → use `/encompass/v3/loanPipeline/report` instead
- Production UI should not use **Preview** Pipeline View APIs

## Endpoints

| Official name | Method / path | Doc |
| ------------- | ------------- | --- |
| V1 Loan Pipeline | `POST /encompass/v1/loanPipeline` | [view-pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline) |
| V1 Create Cursor | `POST /encompass/v1/loanPipeline?cursorType=randomAccess&limit=` | [create-cursor](https://developer.icemortgagetechnology.com/developer-connect/reference/create-cursor) |
| V1 Loan Pipeline (with Pagination) | `POST /encompass/v1/loanPipeline?cursor=&start=&limit=` | [post-encompass-v1-loanpipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/post-encompass-v1-loanpipeline) |
| V1 Get Canonical Names | `GET /encompass/v1/loanPipeline/fieldDefinitions` | [v1-get-canonical-fields](https://developer.icemortgagetechnology.com/developer-connect/reference/v1-get-canonical-fields) |
| V3 Loan Pipeline (with Pagination) | `POST /encompass/v3/loanPipeline` | [view-pipeline-with-pagination-1](https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline-with-pagination-1) |
| V3 Loan Pipeline for Reports | `POST /encompass/v3/loanPipeline/report` | [v3-create-cursor](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-create-cursor) |
| V3 Get Canonical Names | `GET /encompass/v3/loanPipeline/canonicalFields` | [get-canonical-names](https://developer.icemortgagetechnology.com/developer-connect/reference/get-canonical-names) |
| Preview V3 Create Pipeline View | `POST /encompass/v3/users/me/views/pipelineViews` | [v3-create-pipeline-view](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-create-pipeline-view) |
| Preview V3 Update Pipeline View | `PATCH /encompass/v3/users/me/views/pipelineViews/{viewId}` | [update-pipeline-view](https://developer.icemortgagetechnology.com/developer-connect/reference/update-pipeline-view) |

## Pagination vocabulary

| Term | Meaning (official) |
| ---- | ------------------ |
| `limit` | Page size. Server **may override** based on loans × fields. V3: **max 1000 per page**. |
| `start` | Zero-based index of the first row on the page (reports: “starting record number”). |
| `cursor` / `cursorId` / `X-Cursor` | Server snapshot handle. Idle **5 minutes**. V1 max lifespan **12 hours** with use. V3 reports max **1 hour** with use. Max **10** pipeline cursors. 24.3: extra cursor → **409**. |
| `X-Total-Count` | Total matches. Can be skipped with `calculateTotalCount=NoWait` (best practices). |

## Real-time vs report vs cursor vs Get Loan

| Mode | Endpoint | Behavior |
| ---- | -------- | -------- |
| “Real-time pipeline” | `POST /encompass/v3/loanPipeline` | ICE: use this for real-time pipeline results **instead of** `/report`. Still **RDB-async**. |
| Report pipeline | `POST /encompass/v3/loanPipeline/report` | Snapshot for reports; filter cached; not for live UI. |
| Cursor pipeline (V1) | Create Cursor then paginate | Snapshot at cursor create. |
| Loan detail | `GET /encompass/v3/loans/{loanId}` | Transactional loan file, not a list API. |

## Filtering and sorting

Filter terms: `canonicalName`, `value`, `matchType`, `terms`, `operator`, `precision`, `include`.

V1 `matchType` examples: greaterThanOrEquals, exact, greaterThan, isNotEmpty, isEmpty, lessThan, lessThanOrEquals, equals, notEquals, startsWith, contains.

V3 schema also documents **MultiValue**.

`include: false` is NOT. Precision applies to dates (V1 default documented as exact on view-pipeline; V3 schema default **Day** on some pages — **VERSION/DOC INCONSISTENCY**, treat as documented per endpoint).

Sort: V1 `Asc`/`Desc`; V3 `Ascending`/`Descending`. Best practice: avoid sort if unused.

Either `filter` **or** `loanGuids`/`loanIds`, not both (V1 stated).

## HLA / Loan Officer / Processor / associate

**NOT ESTABLISHED** as a named canonical field in ICE pipeline examples.

Discovery: Get Canonical Names on the instance, then filter `exact` on user id if a LO/HLA field exists in RDB.

Per-loan confirmation: `GET /encompass/v1/loans/{id}/associates?userId=` — **not** a bulk list.

V3 `loanOwnership=MyLoans` only if the token **is** the HLA.

Official filter examples that **do** exist: `Loan.LoanFolder`, `Loan.LastModified`, `Loan.LoanNumber` (including MultiValue), `Loan.LoanRate`.

## RDB freshness

Quoted on every pipeline page: RDB updates asynchronously; cursor data is a snapshot at creation.

## Performance

- Admin persona not required but “significant performance increase.”
- `loanFolders` (24.1+) to scope folders.
- Archived loans excluded by default (24.2); `includeArchivedLoans` + persona “Access to Archive Loans.”
- First page small payload, later pages larger limit (best practices).
- Cache client-side (best practices) — aligns with Redis projection.

## Auth and errors

Bearer token. V1 pages list 400/401/403/404/500. V3 pipeline lists 400/403/404/409. Application error bodies: see [error-handling.md](../10-integration/error-handling.md).

## Licensing

API key + Encompass client; Pipeline itself has no extra license called out. **NOT ESTABLISHED** as a separate Pipeline SKU.

## Dashboard use

**INTERNAL ARCHITECTURE RECOMMENDATION:** one V3 Pipeline call per HLA (50–100 loans, small `fields`) to hydrate Redis. Do not hit Pipeline on every 2-second UI poll.
