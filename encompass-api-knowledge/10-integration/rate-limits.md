# Concurrency (not RPM)

ICE documents **concurrency**, default **30** simultaneous calls per lender environment. 429 until remaining > 0. Limit increasable via relationship manager (pricing).

Practices: cache, batch webhook work, queue, backoff, super-admin to skip some rules, webhooks vs poll, Pipeline vs Get Loan, EFC vs Get Loan, multi-attachment calls.

Source: [https://developer.icemortgagetechnology.com/developer-connect/docs/concurrency-limits](https://developer.icemortgagetechnology.com/developer-connect/docs/concurrency-limits)
