# 09 — Documents, eFolder, attachments

**Related:** [06 Conditions](./06-condition-lifecycle-and-comments.md) · [10 Orders and disclosures](./10-document-orders-delivery-disclosures.md)

**Official:** [V3 Get List of Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents) · [Loan Conditions (assignment)](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-conditions) · [Loan webhooks document/attachment](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)

---

## A. Business meaning

**eFolder** is the loan’s document pipeline: containers (documents) holding files (attachments), with roles, comments, and assignment to conditions.

| Term | Meaning |
|------|---------|
| **Document** | Business record tracking a document through the pipeline |
| **Attachment** | The electronic file |

A document may have **multiple attachments**. ICE: when you access a condition, you access assigned documents **and any files assigned to those documents**.

## B. John Smith (illustrative)

Condition “two paystubs” ← Document “Paystubs” ← attachments `July_Paystub.pdf`, `August_Paystub.pdf`.

## C. Domain model

```text
Condition
   v
Document  (eFolder record: title, access roles, comments, statuses)
   v
Attachment(s)  (PDF/file)
```

```text
One document --> many conditions
One condition --> many documents
One document --> many attachments
```

## D. APIs

| Item | Documented |
|------|------------|
| List documents | `GET /encompass/v3/loans/{loanId}/documents` |
| Query | `requireActiveAttachments`, `includeRemoved`, `view` = `detail` (default), `full`, `summary`; pagination `start`/`limit` |
| Response includes | eFolder documents, roles with access, comments |
| ICE note | Documents can be managed with V1 or V3 without breaking workflow — **still different contracts** |
| Attachments | Search current **V3 attachment** pages. ICE changelog has announced **sunset of V1 eFolder Attachment APIs** (e.g. targeting 26.3 in a changelog snapshot). Confirm current sunset page before using V1. |

Upload/download binary endpoints: use the **current** Attachments reference. Do not copy V1 paths into new code if they are sunsetting.

## E–F. Request / response

```http
GET /encompass/v3/loans/{loanId}/documents?requireActiveAttachments=true&start=0&limit=50
Authorization: Bearer {accessToken}
```

Webhook extra payload **official sample** (document): `assignAttachmentsToDocument`, `documentStatusUpdates` with `selectedStatuses[].status` example `"received"`, `updateDocuments`.

Treat `"received"` as **an example status string in a sample**, not a complete enum. ICE: do not invent universal document status values.

## G. Fields

Exact document contract properties: copy from the Get List of Documents schema on the date you verify. Documented query semantics above are enough to start.

Comments on documents: included in list response (documented). Edit/delete/append-only: **verify** on document comment manage pages if they exist; **NOT ESTABLISHED** in the list-API page alone.

## H. Lifecycle (illustrative business vs documented events)

Illustrative ops language: requested → generated → uploaded → received → reviewed → rejected/insufficient → re-requested → uploaded again → accepted.

**Documented events:**

- `document`: `createDocuments`, `updateDocuments`, `assignAttachmentsToDocument`
- `attachment`: `attachmentCreated`

Document Order generation is a **different** domain ([10](./10-document-orders-delivery-disclosures.md)). Delivery can **create eFolder containers** (documented for Send Encompass Docs success).

## I. Events

See loan webhook page. After `attachmentCreated`, GET attachments/documents if you must show files. Webhook sample attachment id looks like a filename (`EBSP23444.pdf`) — **do not assume all ids are filenames**.

## J. Integration

Store documentId, attachmentIds, condition assignments. Never store “the PDF” as the document row.

## K. Production

- Pagination on document lists.
- `includeRemoved` vs active attachments.
- Large files: streaming download; PII in images of IDs/paystubs.
- V1 attachment sunset.

## L. Common mistakes

1. Document = file.
2. Using document status as condition status.
3. Ignoring V1 sunset.
4. Hardcoding status `received` as the only value.

## M. Questions

1. How can one attachment set satisfy two conditions?
2. What does `requireActiveAttachments=true` drop?
3. What is created in eFolder when Lisa sends opening disclosures?
