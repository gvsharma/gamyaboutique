# Attachments

`GET /encompass/v3/loans/{loanId}/attachments` — assigned and unassigned. Params: includeRemoved, activeOnly, start, limit, view.

`GET .../attachments/{attachmentId}`  
`POST .../attachmentUploadUrl`  
`POST .../attachmentDownloadUrl`  
`PATCH .../attachments`  
`POST /efolder/v1/exportjobs` bulk export

File types cited: txt, pdf, doc/docx, images, emf, xps, html.

**V1 attachment APIs sunset in 26.3** (list, get, upload URL, download URL, thumbnail, page, update). Thumbnail/page: no V3 replacement (N/A in deprecation table).

Webhook: Loan `attachment` / `attachmentCreated`.

**INTERNAL ARCHITECTURE RECOMMENDATION:** never put file bytes in Redis as SoR; store metadata + fetch URL on demand.
