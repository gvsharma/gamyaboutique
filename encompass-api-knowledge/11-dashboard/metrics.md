# Metrics

| Metric | Direct ICE | Derived | Needs history | Config |
| ------ | ---------- | ------- | ------------- | ------ |
| Loan age | If create/start date in Pipeline/loan | now − start | optional | milestone template |
| Milestone duration | Milestone log dates | finish − start | webhook times | custom milestone names **LENDER CONFIGURABLE** |
| Time to Processing / UW / Cond App / Closing | Same | diffs between named milestones | yes for accuracy | **LENDER CONFIGURABLE names** |
| Condition aging | tracking timestamps | now − opened | comments | types **LENDER CONFIGURABLE** |
| Task aging | task created vs complete | now − created | webhooks | templates |
| Document aging | document metadata dates | | events | |
| MTT / SLA / bottleneck | **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** | averages over HLA book | event store | SLA defs **INTERNAL ARCHITECTURE RECOMMENDATION** |
| Overdue | | compare dates to SLA | | **INTERNAL ARCHITECTURE RECOMMENDATION** |
| Lock | Pipeline LockInfo / loan | | lock webhooks | |

Formulas (derived): `duration = t_end - t_start`; `MTT = avg(duration)` over closed loans in window; `overdue = now > sla_due`. None of these formula names are ICE APIs.
