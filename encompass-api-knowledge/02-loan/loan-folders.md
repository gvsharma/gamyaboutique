# Loan folders

Folders group loans (by month, status, type, etc.). **Created in Encompass Settings, not via API.** Assign at Create Loan or move later.

Source: [https://developer.icemortgagetechnology.com/developer-connect/docs/ucm-loan-folders](https://developer.icemortgagetechnology.com/developer-connect/docs/ucm-loan-folders)

| API | Path | Notes |
| --- | ---- | ----- |
| List | `GET /encompass/v3/loanFolders` | Includes Trash if accessible |
| Detail | `GET /encompass/v3/loanFolders/{folderName}` | 26.1: `includeInIceBiDashboard` (ICE BI feature) |

Pipeline: filter `Loan.LoanFolder`; V3 body `loanFolders` array (24.1, performance). Example exclude Trash: `include: false` on `(Trash)`.

Archived loans: field 5016 / `archived`; excluded by default 24.2; persona Access to Archive Loans.
