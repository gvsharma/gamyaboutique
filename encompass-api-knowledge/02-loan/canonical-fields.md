# Canonical fields (Pipeline)

Canonical names are `Source.Field`. Sources documented: **Loan** (loans database) and **Field** (RDB field data).

Every pipeline page: use Get Canonical Names; Pipeline `canonicalName` maps to V1 `criterionFieldName` / V3 `canonicalName`.

## APIs

| Version | Method | Path |
| ------- | ------ | ---- |
| V1 | GET | `/encompass/v1/loanPipeline/fieldDefinitions` |
| V3 | GET | `/encompass/v3/loanPipeline/canonicalFields?canonicalNames=` or `fieldIds=` (mutually exclusive) |

## Official example names (do not treat as complete)

`Loan.LoanFolder`, `Loan.LoanFolders`, `Loan.LoanNumber`, `Loan.LoanRate`, `Loan.LoanAmount`, `Loan.LastModified`, `Loan.BorrowerName`, `Loan.LoanType`, `Loan.LoanPurpose`, `Loan.GUID`, `Loan.CreditScore`, `Loan.DateofFinalAction`, `Fields.4000`, `Fields.4002`, `Fields.2608`.

## HLA / Loan Officer

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as a published canonical string. Run Get Canonical Names on the instance. Third-party `Fields.317` / `Fields.1612` must be verified. Fields must exist in RDB to query. **LENDER CONFIGURABLE**
