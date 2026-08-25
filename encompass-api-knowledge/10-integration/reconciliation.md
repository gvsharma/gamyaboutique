# Reconciliation (INTERNAL ARCHITECTURE RECOMMENDATION)

Because RDB lags and webhooks are not guaranteed real-time:

1. Hourly/nightly Pipeline per HLA or folder vs Redis membership
2. On mismatch, GET Loan + list APIs for that loan
3. Rebuild HLA index from Pipeline
4. Inventory webhook subscriptions (30-day auto-delete)
5. Compare lock state (lock webhooks delayed)
6. After Batch Update, force loan refresh (webhooks may coalesce)

Do not use Redis as history SoR.
