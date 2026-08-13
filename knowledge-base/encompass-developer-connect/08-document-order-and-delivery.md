# 08 — Document Order and Delivery

**Share this file when:** designing disclosure/closing package generation or delivery integrations.

**Related:** [07 Documents](./07-documents-and-attachments.md) · [09 Disclosure tracking](./09-disclosure-tracking.md) · [12 Webhooks](./12-events-and-webhooks.md)

---

## What Document Order is

Document Order is about **generating/preparing document packages**. It is not the same as storing an eFolder document, and it is not the same as Disclosure Tracking.

Conceptually:

```text
Loan
 |
 v
Document Order
 |
 v
Generate Package
 |
 v
Delivery
 |
 v
Borrower / Recipient
 |
 v
Disclosure Tracking
```

**Generation and delivery may be asynchronous.**

Do not treat a package request as necessarily synchronous.

## ICE Send Encompass Docs (high level)

ICE's Send Encompass Docs APIs generate an Encompass Document Order for recipients on an ICE-supported signing portal (Consumer Connect for borrower / non-borrowing owner; Loan Connect for third-party / settlement flows).

ICE documents four generation flows:

- **Opening Docs** — Initial Disclosure package (`/opening`)
- **Closing Docs** — Closing package (`/closing`)
- **On-Demand Forms** — other documents (including revised LE/CD and other forms, as documented)
- Plan codes, loan audit, generate doc set, optional add eFolder docs, then send

Typical documented sequence (confirm current guide):

1. Apply a plan code to the loan
2. Run a loan audit (`POST /encompassdocs/v1/documentAudits/{opening|closing}`)
3. Generate the document set (`POST /encompassdocs/v1/documentOrders/{opening|closing}`) — asynchronous; returns a doc set id
4. Optionally add eFolder / Encompass form documents to the order
5. Send/deliver the package (`POST .../delivery`) — asynchronous; returns a delivery order id

ICE states that when delivery is successful:

- a Disclosure Tracking entry is created in Encompass
- document containers are created in the eFolder
- recipients are notified (borrower portal / Loan Connect depending on package type)

Poll or subscribe for status; do not assume the send call has finished generation/delivery.

## Do not conflate three things

| Concept | Question it answers |
|---------|---------------------|
| eFolder document / attachment | What evidence/files exist on the loan? |
| Document Order / Delivery | Was a package generated and sent to recipients? |
| Disclosure Tracking | What is the compliance-oriented disclosure history? |

Delivery success is not a substitute for reading Disclosure Tracking. See [09](./09-disclosure-tracking.md).

## Webhooks

The Developer Connect webhook catalog includes resources such as **Document Delivery** and **Document Order**. Confirm event names in the current catalog.

Webhook ≠ current truth. After a delivery event, fetch order status and disclosure tracking if compliance state must be accurate.

## Official documentation

- [Send Encompass Docs Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/send-docs)
- [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages)
- [Workflows (opening/closing)](https://developer.icemortgagetechnology.com/developer-connect/docs/workflows-1)
- [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
