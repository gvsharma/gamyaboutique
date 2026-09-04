# 07 — Documents and Attachments

**Share this file when:** designing eFolder sync, evidence, or condition-document assignment.

**Related:** [06 Conditions](./06-conditions.md) · [08 Document order](./08-document-order-and-delivery.md) · [09 Disclosure tracking](./09-disclosure-tracking.md)

---

## The distinction

```text
Document
   |
   +-- Attachment
          |
          v
       actual file
```

| Term | Meaning |
|------|---------|
| **Document** | An eFolder **business record** used to track a document through the loan pipeline |
| **Attachment** | The **electronic file** |

A document may have multiple attachments.

**Never treat a document as the actual file** (golden rule 4).

## eFolder document

An eFolder document is not "the PDF." It is the container/record that can have:

- title / type / status (confirm current contract)
- role access
- comments
- attachments
- associations to conditions

ICE: `GET /encompass/v3/loans/{loanId}/documents` returns eFolder documents for a loan, roles that have access, and comments. Filters documented by ICE include:

- `requireActiveAttachments` — when true, only documents with active attachments
- `includeRemoved` — when true, includes documents marked as removed
- `view` — `detail`, `full`, `summary` (default `detail`)
- pagination via `start` / `limit`

Confirm parameters in current docs. ICE also notes documents can be managed with V1 or V3 APIs without breaking workflow — but **do not mix contracts without explaining the difference**. Prefer the current supported version; ICE has announced sunset of some V1 eFolder Attachment APIs (verify the current deprecation notice).

## Document and condition relationship

```text
Condition
   |
   +--------> Document A
   |
   +--------> Document B

Document B
   |
   +--------> Condition 2
```

This is effectively **many-to-many** at the business relationship level.

One condition can have multiple documents. One document can be associated with multiple conditions.

Assigning a document to a condition does not replace the files. The attachments remain on the document.

## Comments

Document comments are object-specific (illustrative: `"Unreadable signature page."`).

They are not Conversation Logs and not condition tracking. See [11](./11-conversation-logs-comments-notes.md).

## Events (verify in current catalog)

ICE loan webhook documentation includes attachment-related subevents such as `attachmentCreated`. Confirm the current webhook catalog before implementing consumers.

After an attachment or document event, fetch current eFolder state if the downstream system must show files, statuses, or condition assignments accurately.

## Document Order is a different concern

eFolder documents are the loan's document records and files.

**Document Order** is about generating/preparing document packages for delivery (opening, closing, on-demand). Do not collapse eFolder CRUD and package generation into one module.

See [08 Document Order and Delivery](./08-document-order-and-delivery.md).

## Official documentation

- [V3 Get List of Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents)
- Search Developer Connect for **eFolder Attachments** (current V3 attachment APIs) and any **V1 sunset** notices
- [Loan webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan)
