# Document orders (Send Encompass Docs)

Flows: Opening (initial/3-day), Closing (ink package + Mavent audit), Forms (on-demand LE/CD).

Typical steps: audit → generate doc set → add eFolder docs → send (`.../delivery`). Recipients: `GET /encompassdocs/v3/loan/{loanId}/recipients`.

On successful send: Disclosure Tracking entry; eFolder containers; email to Consumer Connect (closing to Loan Connect). Async `deliveryOrderID`.

eSigning config not supported for traditional ink closing packages.

Webhooks: DocumentOrder opening/closing/forms audit/order/delivery/append/addToEfolder success/fail. `closingpackagecompleted/failed` not supported, soon deprecated.

Source: [https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages), wbhks-re-cat-doc-order
