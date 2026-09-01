# Errors

Documented HTTP: 400, 401, 403, 404, 405, 409, 410, 413, 415, 418, 429, 500.

V3 body often:

```json
{"summary":"Bad Request","details":"Request Payload has errors","errors":[{"summary":"contract.field","details":"..."}]}
```

429: concurrency exhausted — exponential backoff. Headers `X-Concurrency-Limit-Limit`, `X-Concurrency-Limit-Remaining`. Lenders keep utilization ≤80%; ISVs ≤20%.

Loan too large: EBS-5006. Response >6 MB: 400 message about 6 MB.

Sources: http-status-codes, concurrency-limits, response-payload-size-limit
