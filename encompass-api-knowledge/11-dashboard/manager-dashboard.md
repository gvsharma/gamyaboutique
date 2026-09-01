# Manager dashboard data flow

```text
Manager
  +-- HLA list          GET /encompass/v3/users (cached)
       +-- HLA n
            +-- 50-100 loans   Redis index from Pipeline
```

Grid columns from Pipeline fields (after canonical discovery): loan number, borrower, amount, last modified, folder, lock (include=LockInfo), milestone **if** in canonical list else maintained by milestone webhooks.

Aggregates (loan count, overdue, at-risk): **computed in our app** from stored dates — ICE has no MTT API (**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION**).

Do not N+1 Get Loan. One Pipeline call per HLA is enough for 50–100 loans **if filter works**.
