# 10 — Document Orders, Document Delivery, and Disclosure Tracking

> **Official source:** [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages) · [Send Encompass Docs Workflows](https://developer.icemortgagetechnology.com/developer-connect/docs/workflows-1) · [Document Order Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order) · [Document Delivery Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery) · [Disclosure Tracking (2015)](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015)

---

## Core mental model

Three related but distinct flows:

```
Document Order (encompassdocs)     → Generate, audit, add docs, send package (async)
Document Delivery (delivery/v3)    → eDelivery packages, fulfillment, recipient tasks
Disclosure Tracking (loan logs)    → RESPA/TILA timelines for LE/CD (2015+ loans)
```

| Domain | API prefix | Primary use |
|--------|------------|-------------|
| **Document Order** | `/encompassdocs/v1/documentOrders/` | Opening, Closing, Forms packages |
| **Document Delivery** | `/delivery/v3/` | Package created/updated in eDelivery |
| **Disclosure Tracking** | `/encompass/v3/loans/{loanId}/disclosureTracking2015Logs` | Compliance timelines and history |

---

## Document Order — async workflow

Per [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages) and [Workflows](https://developer.icemortgagetechnology.com/developer-connect/docs/workflows-1):

### Opening (initial disclosures / LE)

| Step | API | Notes |
|------|-----|-------|
| 1. Audit | `POST /encompassdocs/v1/documentOrders/opening` (audit phase) | Async; returns identifiers |
| 2. Generate doc set | `POST /encompassdocs/v1/documentOrders/opening` | Returns Doc Set ID |
| 3. Add documents | `POST /encompassdocs/v1/documentOrders/opening/{orderId}/documents` | eFolder docs or forms |
| 4. Send package | `POST /encompassdocs/v1/documentOrders/opening/{docSetId}/delivery` | Returns `deliveryOrderID` |

### Closing

| Step | API |
|------|-----|
| Generate | `POST /encompassdocs/v1/documentOrders/closing` |
| Add docs | `POST /encompassdocs/v1/documentOrders/closing/{orderId}/documents` |
| Send | `POST /encompassdocs/v1/documentOrders/closing/{docSetId}/delivery` |

### On-demand forms (LE/CD tracking)

| Step | API |
|------|-----|
| Generate | `POST /encompassdocs/v1/documentOrders/forms` |
| Add | `POST /encompassdocs/v1/documentOrders/forms/{orderId}/documents` |
| Send | `POST /encompassdocs/v1/documentOrders/forms/{docSetOrder_id}/delivery` |

When **Loan Estimates** or **Closing Disclosures** are added to a package, tracking uses the **Disclosure Tracking Tool** in Encompass.

### On successful delivery (documented outcomes)

Per [Send Document Package](https://developer.icemortgagetechnology.com/developer-connect/reference/send-documents-order):

- A **Disclosure Tracking entry** is created in Encompass
- **Document containers** are created in the eFolder
- Recipients receive email notification (Consumer Connect for borrowers/NBOs)
- Closing packages directed to **Loan Connect** for settlement agent execution

**Send is asynchronous** — response includes `deliveryOrderID`. Poll **Get Order Status** or subscribe to webhooks.

> Webhooks for Send Encompass Docs are **only supported via API** (not Smart Client-only path).

---

## Disclosure Tracking (2015)

Per [Disclosure Tracking (2015)](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015):

- Timelines and tracking dates for RESPA-TILA compliance
- Loans originated on or after October 3, 2015
- Covers Loan Estimate, Closing Disclosure, Settlement Service Provider, Safe Harbor disclosures

### Key V3 endpoints

| Operation | Endpoint |
|-----------|----------|
| List logs | `GET /encompass/v3/loans/{loanId}/disclosureTracking2015Logs` |
| Get log | `GET /encompass/v3/loans/{loanId}/disclosureTracking2015Logs/{disclosureLogId}` |
| Add log | `POST /encompass/v3/loans/{loanId}/disclosureTracking2015Logs` |
| Update log | `PATCH /encompass/v3/loans/{loanId}/disclosureTracking2015Logs/{disclosureLogId}` |
| Snapshot | `GET .../disclosureTracking2015Logs/{disclosureLogId}/snapshot` |
| Email messages | `GET .../disclosureTracking2015Logs/{disclosureLogId}/emailMessage` |

**Settings for on-demand packages:**

```http
GET /encompass/v3/settings/loan/disclosureTracking
```

### disclosureTracking webhook (Beta Only)

Loan resource event from [wbhks-re-cat-loan](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan):

| Event | Description | Support |
|-------|-------------|---------|
| `disclosureTracking` | Enhanced Disclosure Tracking log created or updated | **API (Beta Only)** |

Changelog notes: currently **beta mode, not generally available**. Verify availability with ICE/support before production subscription.

---

## Webhook categories

### Document Order resource

[wbhks-re-cat-doc-order](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order)

Opening, Closing, and CD/LE workflows publish notifications on workflow step completion.

| Event | Description |
|-------|-------------|
| `openingauditcompleted` / `openingauditfailed` | Opening audit |
| `openingordercompleted` / `openingorderfailed` | Opening order |
| `openingdeliverycompleted` / `openingdeliveryfailed` | Opening delivery |
| `closingauditcompleted` / `closingauditfailed` | Closing audit |
| `closingordercompleted` / `closingorderfailed` | Closing order |
| `closingdeliverycompleted` / `closingdeliveryfailed` | Closing delivery |
| `formscompleted` / `formsfailed` | Form completion |
| `formsdeliverycompleted` / `formsdeliveryfailed` | Form delivery |
| `openingappenddocumentssucceeded` / `openingappenddocumentsfailed` | Opening append |
| `closingappenddocumentssucceeded` / `closingappenddocumentsfailed` | Closing append |
| `openingaddtoefoldersucceeded` / `openingaddtoefolderfailed` | Opening → eFolder |
| `closingaddtoefoldersucceeded` / `closingaddtoefolderfailed` | Closing → eFolder |

**Deprecated (not supported):** `closingpackagecompleted`, `closingpackagefailed`

Subscribe on resource: `documentOrder`

### Document Delivery resource (24.2+)

[wbhks-re-cat-doc-delivery](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery)

| Event | Description | Availability |
|-------|-------------|--------------|
| `packageCreated` | Package created in eDelivery | Smart Client, API |
| `packageUpdated` | Package updated | Smart Client, API |
| `fulfillmentCreated` | Package ready for fulfillment | **Limited availability** |
| `fulfillmentUpdated` | Fulfillment changes | **Limited availability** |

**resourceRef example:** `/delivery/v3/loans/{loanId}/packages/{packageId}`

**Extra payload highlights:** `groupNamespace`, `groupId`, `status`, `mediaStore`, `documentTypes` (ESign, WetSign, Needed, Information, InPersonWetSign), `recipients`, `taskStatuses`, `hasMoreRecipients`

---

## John Smith — LE/CD flow (illustrative)

**Opening package (Loan Estimate):**

1. Mike (LO) triggers opening order for John Smith purchase
2. Async audit → webhook `openingauditcompleted`
3. Doc set generated → `openingordercompleted`
4. Delivery sent → `openingdeliverycompleted`
5. Disclosure Tracking log created; LE containers in eFolder
6. John receives Consumer Connect email

**Changed circumstance (COC):**

1. New forms order with updated LE
2. `formscompleted` → `formsdeliverycompleted`
3. Disclosure Tracking log updated (or new entry—verify lender workflow)
4. If beta enabled: `disclosureTracking` webhook

**Closing (CD):**

1. Closing audit/order/delivery webhooks mirror opening pattern
2. Lisa (Closing Coordinator) monitors `closingdeliverycompleted`
3. Settlement agent uses Loan Connect for execution

---

## Async processing patterns

| Pattern | When to use |
|---------|-------------|
| **Webhook subscription** | Primary for order/delivery completion |
| **Poll Get Order Status** | Fallback when webhook missed |
| **Webhook Event History API** | Reconciliation of undelivered notifications |
| **Disclosure Tracking GET** | Authoritative compliance dates after delivery |

Do not assume synchronous completion from `202 Accepted` on delivery endpoints.

---

## Production integration concerns

1. **Async everywhere** — Model document order state machine in your service; never block UX on delivery POST.
2. **Beta disclosureTracking** — Feature-flag subscription; have polling fallback via Disclosure Tracking GET APIs.
3. **Limited availability webhooks** — `fulfillmentCreated`/`fulfillmentUpdated` require support engagement.
4. **eFolder side effects** — `openingaddtoefoldersucceeded` confirms eFolder write; reconcile with document webhooks ([09-documents-efolder-attachments.md](./09-documents-efolder-attachments.md)).
5. **Lock on send** — Opening delivery may accept `lockId` query param when loan locked.
6. **Ink closing vs eSign** — eSigning order configuration for eDisclosures not supported for traditional ink closing packages (per Send Document Package docs).
7. **Multi-recipient packages** — `hasMoreRecipients` in delivery payload; paginate recipient processing.
8. **Correlation** — Chain `orderId` → `docSetId` → `deliveryOrderID` → Disclosure Tracking log ID in your event store.

---

## Related files

| File | Topic |
|------|-------|
| [09-documents-efolder-attachments.md](./09-documents-efolder-attachments.md) | eFolder containers created on delivery |
| [13-webhooks-events.md](./13-webhooks-events.md) | Webhook subscription patterns |
