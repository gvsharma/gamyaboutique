# Conditions (standard vs enhanced)

A condition is “an entry in the eFolder that allows you to track the status of a loan condition as the loan moves through the Pipeline.” Multiple documents can be assigned; a document can be on more than one condition.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions)

## Which framework

Field `ENHANCEDCOND.X1` / JSON `loan.useEnhancedConditionIndicator`: true → Enhanced; false → Standard (separate APIs).

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)

Enhanced Conditions introduced Encompass 20.2: customize at condition and field level; reports across loans (not supported by standard conditions).

## Standard (V1)

| Area | Path |
| ---- | ---- |
| Underwriting | `/encompass/v1/loans/{loanId}/conditions/underwriting` |
| Post-closing | `/encompass/v1/loans/{loanId}/conditions/postclosing` |
| Preliminary | `/encompass/v1/loans/{loanId}/conditions/preliminary` (pattern; confirm page) |

conditionType values cited: Underwriting, Post Closing, Preliminary, Purchase. priorTo: Approval, Docs, Funding, Closing, Purchase.

Post-closing list supports `sort`, `filter` (`operand:operator:value`), `start`, `limit`.

Condition ID returned on create (response header).

## Lifecycle verbs (standard)

Manage APIs use `action=add|update|remove`. Exact status machine (re-request, insufficient evidence, reopen): **LENDER CONFIGURABLE** / confirm contract enums on Manage Underwriting Conditions. Do not invent statuses.
