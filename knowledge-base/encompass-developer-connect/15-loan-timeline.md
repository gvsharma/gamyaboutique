# 15 — Loan Timeline Example

**Share this file when:** walking stakeholders through a realistic loan journey.

**Related:** [04 Milestones](./04-milestones.md) · [06 Conditions](./06-conditions.md) · [08 Document order](./08-document-order-and-delivery.md) · [16 Normalized timeline](./16-normalized-communications-timeline.md)

---

## Illustrative timeline

```text
Aug 01  Loan Created
Aug 01  Qualification Started
Aug 03  Documents Uploaded
Aug 05  Processing Started
Aug 06  Processing Task Created
Aug 07  Condition Created
Aug 07  Condition Requested
Aug 08  Borrower Upload
Aug 09  Underwriter Review
Aug 09  Condition Re-requested
Aug 10  Additional Document Upload
Aug 10  Condition Satisfied
Aug 11  Resubmittal
Aug 12  Approval
Aug 13  Disclosure Delivery
Aug 15  Closing
Aug 16  Funding
```

This is **illustrative**. Actual Encompass event names, statuses, and timing must be verified against the configured environment and current documentation.

Do not copy these labels into code as an enum of Encompass events.

## How to read it against the domain model

| Date (illustrative) | Domain objects involved |
|---------------------|-------------------------|
| Loan Created | Loan |
| Qualification / Processing / Resubmittal / Approval / Funding | Milestones |
| Processing Task Created | Workflow Task instance |
| Condition Created / Requested / Re-requested / Satisfied | Condition + tracking |
| Documents Uploaded / Borrower Upload | Document + Attachment(s), possibly assigned to a condition |
| Underwriter Review | People (associate/role) + task and/or condition review |
| Disclosure Delivery | Document Order / Delivery + Disclosure Tracking |
| Closing | Milestone / docs signing / closing package — confirm lender config |

## Mapping to integration

In production, this story is assembled from:

- webhooks (notifications)
- resource GETs (current state)
- logs and comments (context)
- disclosure tracking (compliance history)

See [16](./16-normalized-communications-timeline.md) for a normalized `LoanTimelineEvent` model.

## Official documentation

Always verify milestone names, condition statuses, and webhook event names in:

- [Loan Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)
- [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
- The lender's Encompass milestone template and condition settings
