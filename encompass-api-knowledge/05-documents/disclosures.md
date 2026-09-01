# Disclosure tracking 2015

| Operation | Path (verify live explorer — changelog casing has varied) |
| --------- | --------------------------------------------------------- |
| List | `GET /encompass/v3/loans/{loanId}/disclosureTracking2015Logs` |
| Get | `GET .../disclosureTracking2015Logs/{disclosureLogId}` |
| Add | POST same collection |
| Update | PATCH one log |
| Snapshot | `GET .../{disclosureLogId}/snapshot` and `.../snapshots` |
| Settings | `GET /encompass/v3/settings/loan/disclosureTracking` |

**VERSION DEPENDENT:** 26.2 remove top-level `fulfillment.trackingNumber` → per-recipient; 26.1 settings renames; 25.2 contents array validation; 21.1 date-only fields + TZ from LE1.X9.

Webhook: Loan `disclosureTracking` — **API, Beta Only**.

Path casing inconsistency in release notes: **verify in Reference Explorer**.
