# Field matrix

Only names that appear in **official ICE Developer Connect** examples or prose are listed as confirmed. HLA/LO Pipeline keys must be discovered per instance.

| Field / canonical | Where documented | Use | Pipeline filter? | Notes |
| ----------------- | ---------------- | --- | ---------------- | ----- |
| Loan.LoanFolder | Pipeline examples | Folder | Yes (exact, include false) | `(Trash)` example |
| Loan.LoanFolders | V3 live sample **returned** | Multi-folder string | NE as filter | |
| Loan.LoanNumber | Pipeline examples | Number | Yes, MultiValue example | |
| Loan.LoanRate | V3 complex query | Rate | Yes | |
| Loan.LoanAmount | Samples | Amount | NE as filter example | Return field |
| Loan.LastModified | Many examples | Dates | Yes + precision | |
| Loan.BorrowerName | Samples | Display | Return | PII |
| Loan.LoanType / LoanPurpose | V3 folder example | Return | | |
| Loan.GUID | Create cursor example | Id | Return | |
| Loan.CreditScore | Canonical sample (FICO) | | | criterionFieldName |
| Loan.DateofFinalAction | Canonical sample | | | |
| Fields.4000 / 4002 | Sort/return samples | | | No LO semantics |
| Fields.2608 | Canonical sample | Purchase advice expected amt | | Not LO |
| Fields.317 / 1612 / Loan.LoanOfficer* | **Not in ICE pipeline examples** | Industry lore | **NOT ESTABLISHED** | Discover via Get Canonical Names |
| ENHANCEDCOND.X1 | Enhanced Conditions overview | Framework flag | Use loan JSON | jsonPath useEnhancedConditionIndicator |
| archived / 5016 | 24.2 changelog | Archived | includeArchivedLoans | Persona gated |
| LE1.X9 | 21.1 DT notes | Disclosure TZ | | |
| Log.MS.Comments.Approval | auditTrail example | Milestone comments path | Audit not Pipeline | |
| LockInfo | V3 `include=LockInfo` | Lock column | | |

**LENDER CONFIGURABLE:** any RDB-enabled custom field can become a Pipeline canonical name after it appears in Get Canonical Names.
