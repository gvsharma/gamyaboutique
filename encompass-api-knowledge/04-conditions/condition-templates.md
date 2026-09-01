# Enhanced condition templates (settings)

`/encompass/v3/settings/loan/conditions/templates` — get all, get one, manage.

Webhooks: EnhancedConditionTemplate create/update/delete (support ticket + subscribe).

Automated: `POST /encompass/v3/calculators/automatedConditions` evaluates business rules and returns templates that **can** be applied given loan state (`loanId`, `userId` query).
