# Documents vs related objects

| Term | Official meaning | Source |
| ---- | ---------------- | ------ |
| Document | eFolder entry tracking a loan document; “like a file folder”; can have multiple files | efolder-document-1 |
| Attachment | Electronic file; assigned to **only one** document at a time | efolder-attachment-1 |
| Condition | eFolder entry tracking a **condition**; documents assigned as evidence | loan-conditions |
| Document Order | Generate opening/closing/forms packages (`/encompassdocs/v1/documentOrders/...`) | Ordering Document Packages |
| Document Delivery | Track package fulfillment (`/delivery/v3/.../packages`) | get-packages, 24.3 |
| Disclosure tracking | Entry created when packages (esp. LE/CD) send successfully | send-documents-order |

26.1: document attribute `status` deprecated → `documentStatus`. **VERSION DEPENDENT**
