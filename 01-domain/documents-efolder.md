# Documents and eFolder

## eFolder concept

The **eFolder** is Encompass's electronic document folder for a loan. It contains:

- **Documents** — logical containers tracking document status
- **Attachments** — actual electronic files assigned to documents
- **Conditions** — requirements linked to documents

Official analogy:

> An eFolder document is like a file folder, it is used to contain and track all the files associated with a particular loan document.

---

## Document vs Attachment — critical distinction

| Object | What it is | Cardinality |
|--------|------------|-------------|
| **Document** | Business document record / container | 1 document → 0..n attachments |
| **Attachment** | Electronic file (PDF, TIFF, etc.) | 1 attachment → exactly 1 document at a time |

Official rules:

- A document can have **multiple** attachments
- An attachment can be assigned to **only one** document at a time
- An attachment can be **unassigned** and reassigned to another document

```
Condition
   |
   v
Document  ("Paystubs" — eFolder entry)
   |
   v
Attachment(s)  (Paystub.pdf, Paystub2.pdf)
```

A document and its attachment are **not the same thing**.

---

## Document ID and Attachment ID

| ID | Discovery |
|----|-----------|
| `documentId` | Response header on create; also in GET documents list |
| `attachmentId` | Response header on create; also in GET attachments list |

---

## Document attributes (API concepts)

GET `/encompass/v3/loans/{loanId}/documents` returns:

- Document list
- Roles with access to documents
- Comments applied to documents

Query parameters:

| Parameter | Effect |
|-----------|--------|
| `view` | `summary`, `detail` (default), `full` |
| `includeRemoved` | Include removed documents |
| `requireActiveAttachments` | Only documents with active attachments |

### documentStatus vs status

As of Encompass 26.1, the `status` attribute in the eFolder Document Contract is **deprecated** in favor of `documentStatus`.

Affected endpoints: Get List of Documents, Get a Document, Manage Documents.

---

## Attachment types (official supported)

- Text (.txt)
- PDF (.pdf)
- Word (.doc, .docx)
- TIFF (.tif)
- JPEG (.jpg, .jpeg, .jpe)
- Enhanced Metafile (.emf)
- XPS (.xps)
- HTML (Encompass only)
- Office Open XML (.docx) (Encompass only)

Native-format files are the only `attachmentType` creatable through API.

---

## Cloud storage

V3 APIs work with attachments stored on media server or cloud storage transparently. API calls route to the correct server based on attachment storage location.

Some V1 attachment APIs may not work depending on attachment type — use V3 equivalents.

**Sunset notice:** V1 eFolder Attachment APIs scheduled for sunset in release 26.3. See Deprecation and Sunset Notices.

---

## Document ↔ Condition relationship

From official conditions documentation:

- Multiple documents can be assigned to one condition
- One document can be assigned to **more than one** condition

Enhanced Conditions use `assignedTo[]` on the condition referencing Document entities.

---

## Document comments

Documents support comments (returned in GET documents list with appropriate view). Example:

> "Signature page unreadable."

Document comments are resource-specific — see [comments-notes-logs.md](./comments-notes-logs.md).

---

## Document assignment and access

Documents include role access information in API responses — which loan team roles can view/work with the document (**LENDER CONFIGURABLE** via eFolder setup).

Settings API: `GET /encompass/v3/settings/eFolder/documentGroups` — document group settings.

---

## Document Order

**Document Orders** generate disclosure/closing document packages via **Encompass Docs APIs** (`/encompassdocs/v1/...`).

Workflow (from official docs):

```
1. Generate doc set (async → Doc Set ID)
2. Poll status / webhook
3. Optionally add documents to order
4. Confirm and send package (delivery)
```

| Package type | Generate endpoint |
|--------------|-------------------|
| Opening (initial disclosures) | `POST /encompassdocs/v1/documentOrders/opening` |
| Closing | `POST /encompassdocs/v1/documentOrders/closing` |
| On-demand forms | `POST /encompassdocs/v1/documentOrders/ondemand` |

Status polling:

- `GET /encompassdocs/v1/documentOrders/opening/{orderId}`
- `GET /encompassdocs/v1/documentOrders/closing/{orderId}`

### Regenerated orders — `difference` attribute

When a doc set is regenerated, status may include:

| difference value | Meaning |
|------------------|---------|
| NoDiff | No changes |
| Diff | Changes exist |
| Removed | Document removed from regenerated set |

If `difference: "removed"`, those documents **MUST NOT** be included in delivery request — otherwise delivery errors occur.

Only the user who created the Document Order can retrieve order status.

---

## Document Delivery

Delivery endpoints:

- Opening: `POST /encompassdocs/v1/documentOrders/opening/{docSetOrder_id}/delivery`
- Closing: `POST /encompassdocs/v1/documentOrders/closing/{docSetOrder_id}/delivery`
- Forms: `POST /encompassdocs/v1/documentOrders/forms/{docSetOrder_id}/delivery`

Async flow — returns `deliveryOrderID`.

On successful delivery (official docs):

- Disclosure Tracking entry created in Encompass
- Document containers created in eFolder
- Recipients receive email notification (Consumer Connect / Loan Connect)

Webhook events: Document Order category (`openingdeliverycompleted`, `closingdeliverycompleted`, etc.).

---

## Document Review

Document status tracking supports review states via `documentStatus` / selected statuses. Webhook `documentStatusUpdates` subevent includes status history with `lastModifiedAt`, `lastUpdateBy`, `currentStatus`.

---

## Document Package

A **document package** is the ordered collection of forms/documents in a Document Order — not a separate permanent loan entity. It exists in the context of generation and delivery workflows.

---

## John Smith example

| Step | Document domain action |
|------|------------------------|
| Processing | Sarah creates "Paystubs" eFolder document |
| Processing | Paystub.pdf, Paystub2.pdf uploaded as attachments |
| Processing | Attachments assigned to Paystubs document |
| Underwriting | Document linked to paystub condition |
| Closing | Lisa generates Closing Doc Set via Document Order |
| Closing | Delivery sends package to John via Consumer Connect |
| Closing | eFolder containers created; Disclosure Tracking log added |

Document comment from closer: "Signature page unreadable." → new attachment uploaded.

---

## EFC (Encompass Forms Catalog)

**NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** as a standalone domain object in Developer Connect reference pages reviewed for this knowledge base. Forms are referenced within Document Order workflows and loan schema entity types (`StandardForm`, `CustomForm`, `Form`). Consult Encompass Docs API documentation for form-specific behavior.

---

## References

- [Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1)
- [Manage Attachments](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-attachment-1)
- [V3 Get List of Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents)
- [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages)
- [Workflows — Document Orders](https://developer.icemortgagetechnology.com/developer-connect/docs/workflows-1)
