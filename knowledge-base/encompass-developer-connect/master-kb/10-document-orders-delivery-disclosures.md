# 10 — Document orders, delivery, and disclosure tracking

**Related:** [09 eFolder](./09-documents-efolder-attachments.md) · [13 Webhooks](./13-webhooks-events.md)

**Official:** [Send Encompass Docs](https://developer.icemortgagetechnology.com/developer-connect/reference/send-docs) · [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages) · [Opening/closing workflows](https://developer.icemortgagetechnology.com/developer-connect/docs/workflows-1) · [Disclosure Tracking 2015](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015) · [Get disclosure tracking logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-list-of-disclosure-tracking-logs) · [Document Delivery webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery) · [Document Order webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order)

---

## A. Business meaning

Three different jobs:

| Concept | Question |
|---------|----------|
| **Document Order** | Generate a package (opening / closing / on-demand) |
| **Document Delivery** | Send package to recipients (Consumer Connect / Loan Connect) |
| **Disclosure Tracking** | Compliance history (LE/CD dates, method, recipient, revised vs initial) |

Do not use delivery success as a substitute for reading tracking logs.

## B. John Smith (illustrative)

Lisa generates the initial disclosure (opening) package for John. Recipients get a portal email. Encompass writes a **Disclosure Tracking** entry and **eFolder containers**. Later a revised LE may be an on-demand flow. Closing package may go to Loan Connect for the settlement agent.

## C. Domain model

```text
Loan
  v
Document Order  (audit -> generate doc set -> optional add eFolder docs)
  v
Delivery        (async; deliveryOrderID)
  v
Disclosure Tracking  (2015 LE, CD, SSP, Safe Harbor)
  v
eFolder document records
```

## D. APIs (documented flows)

Send Encompass Docs:

- Opening = initial disclosures (`/opening`)
- Closing = closing package (`/closing`)
- On-demand = other forms including revised LE/CD as documented
- Plan codes, loan audit, generate doc set, optional add documents, send

Typical sequence **from ICE guide** (confirm current):

1. Apply plan code
2. `POST /encompassdocs/v1/documentAudits/{opening|closing}` → audit id
3. `POST /encompassdocs/v1/documentOrders/{opening|closing}` → **async**; doc set id
4. Optional `POST .../documentOrders/{opening|closing}/{docSetId}/documents`
5. `POST .../documentOrders/{opening|closing}/{docSetId}/delivery` → **async**; delivery order id

On successful send, ICE states: Disclosure Tracking entry created; eFolder containers created; email to portal; closing directed to Loan Connect for settlement agent.

Status GETs exist (changelog examples: Get Opening/Closing Order Status). Confirm paths on current reference.

Disclosure Tracking (2015): timelines and dates for RESPA-TILA loans originated on or after **October 3, 2015**. Resources include 2015 Loan Estimate, Closing Disclosure, Settlement Service Provider, Safe Harbor.

V3 list logs: see [Get a List of Disclosure Tracking Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-list-of-disclosure-tracking-logs) — confirm path on the page (portal snippets have disagreed on path shape; **use the page’s documented path**, not memory).

## E–F. Request / response

Generate doc set returns an **id** (official sample `{ "id": "af926b89-..." }`). Do not treat the POST as the finished package.

**Illustrative:** poll order status or consume Document Order / Document Delivery webhooks, then GET tracking logs.

## G. Fields to persist (from ICE prose, not a full schema)

| Item | Why | Notes |
|------|-----|-------|
| auditId | Required to generate (opening/closing input) | Documented on generate contract |
| docSet / order id | Async correlation | |
| deliveryOrderID | Async delivery | Documented as returned identifier |
| Tracking dates, recipient, method | Compliance | Copy from tracking API schema when verified |
| initial vs revised | TRID | Confirm field names on 2015 log contract |
| intent-to-proceed related tracking | Seed concern | Confirm on current tracking schema — **do not invent field names** |

## H. Lifecycle

Generation and delivery **may be asynchronous** (documented). Fax coversheet auto-generates for wet-sign in some opening/on-demand flows (documented).

## I. Events

Separate webhook resources: **Document Order**, **Document Delivery**. Delivery page mentions extra payload for `packageCreated` / `packageUpdated` and recipient task types in a sample (`Review`, `WetSign`, `Upload`, `ESign`) plus `status` example `"Created"`. Treat sample enums as **samples**.

Loan `disclosureTracking`: triggered when an **Enhanced Disclosure Tracking** log is created or updated — **API (Beta Only)** as of the loan webhook page reviewed. Do not build production solely on a beta event.

## J. Integration

Lisa’s bank service: start order → persist ids → wait on webhook/poll → GET tracking → update compliance projection. Never mark “disclosed” from the first 202/id response alone.

## K. Production

- Async + delayed webhooks.
- Beta disclosureTracking event.
- PII in packages.
- Consumer Connect vs Loan Connect routing.
- Do not confuse eFolder upload with disclosure delivery.

## L. Common mistakes

1. Synchronous assumption.
2. Delivery = tracking.
3. Using beta events as the only compliance signal.
4. Inventing LE/CD field names.

## M. Questions

1. What identifiers exist between audit, doc set, and delivery?
2. What is created in Encompass when delivery succeeds?
3. Why can John have a document in eFolder without a tracking log row?
