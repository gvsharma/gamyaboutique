# Enhanced conditions (loan instance)

| Name | Method | Path |
| ---- | ------ | ---- |
| Get all | GET | `/encompass/v3/loans/{loanId}/conditions` |
| Get one | GET | `/encompass/v3/loans/{loanId}/conditions/{conditionId}` |
| Manage | PATCH | `/encompass/v3/loans/{loanId}/conditions` (`action` add/update/remove/duplicate) |
| Comments | | `/encompass/v3/loans/{loanId}/conditions/{conditionId}/comments` |
| Documents | PATCH | `.../conditions/{conditionId}/documents` |
| Tracking | PATCH/GET | `.../conditions/{conditionId}/tracking` |
| Evaluate automated | POST | `/encompass/v3/calculators/automatedConditions` |

Duplicate: requires `allowDuplicate` on template; copies except trackingEntries, comments, assignedTo. Title retrieve-only at loan level.

26.2: `delegatedTrackingStatuses` for tracking owners.

Source: loan-enhanced-conditions, manage-enhanced-conditions-1, 26.2 changelog

Webhook: Loan `condition` subevents create, update, assign, assignDocument, remove, comment, status change. Template/type webhooks need **support ticket**.
