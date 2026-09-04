# 14 — EPC, DDA, Trades, Schedulers

**Related:** [13 Webhooks](./13-webhooks-events.md) · [01 Overview](./01-encompass-domain-overview.md)

**Official:** [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) · [EPC webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect) · [DDA webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-dda) · [Schedulers webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers) · [Trades webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades)

---

These domains sit **beside** the loan origination core. Do not model an EPC order as a condition, or a trade as a milestone.

## Encompass Partner Connect (EPC)

### A. Business meaning

Partner/service-order channel (appraisals, verifications, etc. depending on partner). ICE Enhanced Conditions `sourceOfCondition` includes **PartnerConnect (Service-to-Service only)**.

### B. John Smith (illustrative)

XYZ Appraisal may be ordered through a partner integration rather than only an eFolder placeholder. Confirm in **your** lender’s EPC setup — not universal.

### C–I.

Webhook category: [EPC](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect). Copy event names from that page into your runbook on the date verified. **This file does not invent EPC event or payload fields.**

License/enablement: partner + Encompass instance configuration. **Customer-specific.**

## Data & Document Automation (DDA)

### A. Business meaning

ICE Data & Document Automation (formerly AIQ): analyzers, document validation, data mapping, mail items, eFolder state from the DDA perspective.

### Documented constraint

> Limited availability for DDA customers. Lenders who use ICE DDA with Encompass can subscribe using the **DDA Platform Webhook API only**. Released in limited availability; contact ICE MT CSM/RM.

### Documented DDA webhook resources (category page)

| Resource | ICE description |
|----------|-----------------|
| AnalyzerDocumentValidationResult | Validation status from AIQ Analyzers, including invalid reasons |
| AnalyzerResult | Analyzer state: eligibility, document processing, checklist rules, mapping/applicant association issues |
| DataSource | Data source state through lifecycle |
| Document | Document state through lifecycle |
| eFolder | Loan/eFolder state through lifecycle |
| ReceivedMailItem | Mail item state through lifecycle |

Event name lists: copy from the DDA page. Do not assume they match Loan `document` events.

John Smith: if the bank licenses DDA, paystub classification/validation may emit Analyzer* events **in addition to** eFolder attachment events.

## Trades

Secondary-market workflow (loan trades, pools, etc.). EntityReference enum includes LoanTrade, SecurityTrade, MBSPool, Trade, CorrespondentTrade — **enum membership is not a tutorial**. Use [Trades webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades) and Trades API reference.

Do not put trade status into origination milestone dashboards without an explicit mapping.

## Schedulers

Time-based automation. Webhook category: [Schedulers](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers). Copy resources/events from that page.

A scheduler firing may create tasks or update loans — **only after you read the scheduler payload**. Do not assume.

## G. Persistence

Store `resourceType` + `resourceId` + `eventId` separately from loan projections. Join to `loanId` only when the payload/docs identify a loan.

## L. Common mistakes

1. Subscribing to DDA via the generic Loan webhook and expecting analyzer results.
2. Treating EPC partner events as eFolder attachmentCreated.
3. Assuming every lender has Trades/DDA/EPC licensed.

## M. Questions

1. Is DDA in contract for this bank?
2. Which system is system-of-record for appraisal status — EPC, eFolder, or both?
3. Can a scheduler update a loan while Sarah holds a lock?
