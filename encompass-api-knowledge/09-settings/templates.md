# Templates

Walk folder tree: list endpoints return `entityType` TemplateFolder vs template type and `entityPath`.

Paths include `/v3/settings/templates/loanTemplateSet/folders`, `loanProgram/folders`, `closingCost/folders`, `settlementServiceProvider/folders`, `affiliatedBusinessArrangement/folders`. `includeAdditionalInfo` for description (22.1).

Loan Program items GET added 24.1. Transcript of tax templates 24.2. Closing cost templates also under `/encompassdocs/v3/settings/loan/closingCostTemplates`.

Update Loan `templateType`: AffiliatedBusinessArrangement, ClosingCost, Funding, Investor, LoanProgram, SettlementServiceProvider, TemplateSet, TemplateType.

Source: tutorial-retrieve-template-locations-and-settings
