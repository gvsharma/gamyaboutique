# Milestones

“A milestone is a step in the workflow that defines loan activities and the role that carries out those activities. When activities are completed, the milestone is marked as finished, and work begins on the next milestone.”

Thirteen predefined: Started, Qualification, Processing, Submittal, Cond. Approval, Resubmittal, Approval, Doc Preparation, Docs Signing, Funding, Post Closing, Shipping, Completion. Admins rename, add custom, apply templates. **LENDER CONFIGURABLE**

Source: Associates & Milestones intro on [https://developer.icemortgagetechnology.com/developer-connect/reference/get-associates](https://developer.icemortgagetechnology.com/developer-connect/reference/get-associates)

## V3 APIs (GA 24.1, previously preview)

| Name | Method | Path |
| ---- | ------ | ---- |
| Get Milestone Logs List | GET | `/encompass/v3/loans/{loanId}/milestones` |
| Get Milestone Log | GET | `/encompass/v3/loans/{loanId}/milestones/{milestoneId}` |
| Update Milestone Log | PATCH | `/encompass/v3/loans/{loanId}/milestones/{milestoneId}` |
| Update Milestone Dates | PATCH | `/encompass/v3/loans/{loanId}/milestones?action=UpdateDates` (`mode` Automatic\|Manual\|Loan, `persistent`) |
| Milestone-free roles list | GET | `/encompass/v3/loans/{loanId}/milestones/milestoneFreeRoles` |
| Update milestone-free role | PATCH | same collection |

Settings: [https://developer.icemortgagetechnology.com/developer-connect/reference/settings-milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-milestones)

## Current vs history vs duration

| Need | Official hook |
| ---- | ------------- |
| Current worksheet | GET milestones list |
| History | System log “Milestone History Log” via GET Loan `view=logs` |
| Start/finish | Webhook subevents `updateMilestones`, `finishMilestones` |
| Duration / MTT | **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as a native metric — **INTERNAL ARCHITECTURE RECOMMENDATION:** derive from log dates + webhook eventTime |

Webhook extra payload lists milestone id + title (e.g. Started, Cond. Approval). Source: extra-payload-attributes-loan-resources.
