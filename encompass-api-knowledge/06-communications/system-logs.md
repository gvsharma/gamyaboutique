# System logs and loan logs

System logs: cannot be edited. Examples: Milestone History Log, HTML Email logs, Lock Action Logs.

Get Loan `view=logs|full`. 24.2: logs no longer leak into entity view.

Field-level history: POST auditTrail (RDB).

**Aggregation strategy for “all meaningful activity” (one loan)** — **INTERNAL ARCHITECTURE RECOMMENDATION**:

1. GET Loan `view=logs` (conversation, milestone history, email, lock actions, condition logs if standard)
2. Enhanced conditions + tracking + comments
3. Documents + document comments
4. GET `/workflow/v1/tasks` filtered to the loan (confirm filter) + comments
5. Disclosure tracking logs
6. Webhook history store (your DB)
7. auditTrail for selected field IDs

Do not call all of these on manager grid. Loan-detail page only, cached.
