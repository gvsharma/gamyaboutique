# eFolder documents

`GET /encompass/v3/loans/{loanId}/documents` — all documents, roles with access, comments. Params: `requireActiveAttachments`, `includeRemoved`, `view` (detail\|full\|summary, default detail), `start`, `limit`.

`GET .../documents/{documentId}`  
`PATCH .../documents` manage add/update/remove  
`POST /encompass/v1/loans/{loanId}/documents/{documentId}/comments` add comments

V1 list still exists. V1/V3 may be used together; some V1 attachment ops fail depending on storage — use V3. Cloud storage: using-cloud-storage-apis-for-loan-attachments.

Webhooks: Loan `document` subevents createDocuments, updateDocuments, assignAttachmentsToDocument.
