# V3 Loan Pipeline (with Pagination)

| Item | Value |
| ---- | ----- |
| Official name | V3 Loan Pipeline (with Pagination) |
| Version | V3 |
| Method | POST |
| Endpoint | `/encompass/v3/loanPipeline` |
| URL | https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline-with-pagination-1 |
| Purpose | Pages of loan IDs + fields from the Pipeline (ICE: **real-time pipeline results** vs `/report`) |
| Domain | Pipeline / RDB |
| Auth | Bearer |
| Query | `start` (required, default 0), `limit` (required; server may override), `include` (`LockInfo` only documented), `ignoreInvalidFields` (default **true**) |
| Body (`LoanPipelineQueryContract`) | `loanIds`, `fields`, `sortOrder`, `filter`, `orgType` (Internal/TPO, default Internal), `tpoId`, `loanOwnership` (AllLoans/MyLoans, default AllLoans), `loanFolders`, `includeArchivedLoans` (default false) |
| Page cap | **Maximum of 1000 loans per page** |
| Errors documented | 400, 403, 404, 409 |
| Renamed | 24.2: “V3 View Pipeline…” → “V3 Loan Pipeline…” |

## Critical: 50–100 loans for one HLA

Yes, **volume** is fine (100 ≪ 1000). Efficiency depends on a **valid canonical filter** for that HLA’s user id or name.

**Official canonical field for HLA/Loan Officer: NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION.**

Procedure:

1. `GET /encompass/v3/loanPipeline/canonicalFields`
2. Find the field whose description/fieldId matches Loan Officer / HLA in **your** RDB
3. POST pipeline with that `canonicalName` and `matchType` `exact` (or `Equals` per V3 schema spelling — use the spelling the endpoint schema lists)

### Request pattern (placeholder canonical name)

```http
POST https://api.elliemae.com/encompass/v3/loanPipeline?start=0&limit=100
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "loanFolders": ["My Pipeline"],
  "loanOwnership": "AllLoans",
  "orgType": "Internal",
  "includeArchivedLoans": false,
  "fields": [
    "Loan.LoanNumber",
    "Loan.BorrowerName",
    "Loan.LoanAmount",
    "Loan.LastModified",
    "Loan.LoanFolder"
  ],
  "filter": {
    "canonicalName": "<from Get Canonical Names>",
    "value": "<hlaUserId>",
    "matchType": "exact"
  }
}
```

Do **not** add sort unless the UI needs it.

Optional ICE example using folders + MultiValue loan numbers:

```json
{
  "fields": ["Loan.LoanNumber", "Loan.LoanType", "Loan.LoanPurpose", "Loan.BorrowerName"],
  "loanFolders": ["My Pipeline", "Prospects"],
  "filter": {
    "canonicalName": "Loan.LoanNumber",
    "value": ["1001", "1002"],
    "matchType": "Multivalue"
  }
}
```

Source: same V3 page (examples). MatchType spelling in that example is `Multivalue`.

### Example response shape

V3 items use `loanId` (not `loanGuid`):

```json
[
  {
    "loanId": "string",
    "fields": {
      "Loan.LoanFolder": "My Pipeline",
      "Loan.LoanNumber": "12345",
      "Loan.BorrowerName": "Example, Conv Fixed"
    }
  }
]
```

Lock info only if `include=LockInfo`.

### Pagination

- Page 1: `start=0&limit=100` (or 1000)
- If `X-Total-Count` or array length says more, `start=100`, etc.
- For 50–100 loans, **one page**
- Server may return fewer than `limit`

### How many fields?

ICE: server calculates optimal limit from **number of loans and fields**. Best practices: reduce payload; first call limited payload. **INTERNAL ARCHITECTURE RECOMMENDATION:** ≤10–15 grid columns.

### Performance

- Admin user faster
- `loanFolders` (24.1+)
- `calculateTotalCount=NoWait` if you do not need total (best practices page)
- Exclude archived unless needed
- Cache results (ICE) / Redis (our architecture)

### Stale data / RDB

Pipeline is **not** Get Loan. RDB async. No published refresh interval. **NOT ESTABLISHED.**

For a 2-second dashboard: **INTERNAL ARCHITECTURE RECOMMENDATION** — do not block UI on this call; serve Redis; refresh via webhooks + periodic Pipeline.

### Doc inconsistency

Usage note “Only the fields attribute is accepted in the request body” appears on this page **and** the page still documents `filter`, `loanFolders`, etc. Reproduced, not guessed. Prefer the **schema/examples** for the non-cursor V3 call; the “fields only” note is clearly copied from the V1 **paginated-with-cursor** API.

### Webhooks

None for the query itself. Subscribe to Loan events to know when to re-query.
