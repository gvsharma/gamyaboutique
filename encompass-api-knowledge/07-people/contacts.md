# Contacts

Borrower and Business contacts link on Create/Update Loan via `entityRef`. One borrower contact cannot fill two borrower relationships on the same loan; business contacts can fill multiple + `referralSourceContact`.

Business: `GET/PATCH /encompass/v1/businessContacts/{contactId}`; custom category fields V3 settings. 25.2 `customFields`. Pagination cursors: **10 shared** with borrower contacts (not with Pipeline, as of 24.3).

Sources: linking-business-contacts-to-a-loan, 24.3 changelog
