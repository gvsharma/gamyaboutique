# Condition tracking

Enhanced: `PATCH/GET /encompass/v3/loans/{loanId}/conditions/{conditionId}/tracking` — add/remove tracking-status entries (`action=add|remove`).

26.2 delegated tracking statuses.

Standard conditions tracking: use standard condition objects + eFolder; dedicated V3 tracking path is enhanced-only as documented here.

Satisfaction, rejection, re-request, reopen: **LENDER CONFIGURABLE** status values from Condition Types. Do not invent. History = tracking entries + comments + webhooks, plus GET Loan logs if present.
