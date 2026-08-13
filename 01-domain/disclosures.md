# Disclosures and Disclosure Tracking

## Regulatory context

For loans originated on or after **October 3, 2015**, Encompass tracks disclosures under **RESPA-TILA** (TRID) rules via **Disclosure Tracking (2015)** APIs.

Official documentation:

> This API retrieves the timelines and tracking dates to stay compliant with RESPA-TILA regulations for loans originated on or after October 3, 2015.

---

## What Disclosure Tracking manages

The Disclosure Tracking API provides:

- Disclosure **timelines** and **tracking dates**
- Disclosure **history**
- Latest disclosure **details**

Supported disclosure types (from API scope):

- **Loan Estimate (LE)**
- **Closing Disclosure (CD)**
- **Settlement Service Provider**
- **Safe Harbor** disclosures

---

## Disclosure vs eFolder Document vs Document Order

| Concept | Role |
|---------|------|
| **Disclosure Tracking Log** | Compliance record with dates, snapshots, delivery method |
| **Document Order** | Generation/delivery workflow for form packages |
| **eFolder Document** | Container created/stored after delivery or manual upload |

Document Order delivery **creates** a Disclosure Tracking entry and eFolder document containers on success.

---

## API endpoints

Base pattern: `/encompass/v3/loans/{loanId}/disclosureTracking2015Logs`

| Operation | Method |
|-----------|--------|
| List logs | GET |
| Get log | GET `.../{disclosureLogId}` |
| Add log | POST |
| Update log | PATCH `.../{disclosureLogId}` |

Contract: `EnhancedDisclosureTracking2015LogContract`

Query parameters include:

- `includeSnapshot` — include snapshot of loan/disclosure state at event time
- `applicationId` — scope to borrower pair when adding logs

---

## Enhanced vs legacy logs

Release 22.3+ added support for **legacy** disclosure tracking logs created via Smart Client/SDK:

- V3 Update API can now update legacy logs (previously limited to Enhanced logs from V3/eClose)
- Enables updating `UseForUCDExport` flag on any log for UCD Automation

Both legacy and enhanced logs accessible via V3 APIs after enhancement.

---

## Snapshots

When creating/updating logs with `includeSnapshot`:

> The snapshot created will represent the state of Encompass data at the time the record is created.

Snapshots support audit and compliance reconstruction.

---

## eConsent integration

V3 Update Loan and V3 Update 2015 Disclosure Tracking APIs support updating **eConsent** fields from integrations outside Consumer Connect.

eConsent data can be updated on:

- The loan file
- Selected Disclosure Tracking records

**Note from release docs:** Disclosure tracking UI may not display API-provided eConsent until specific release; data accessible via API regardless.

---

## Relationship to Document Delivery

Successful opening/closing package delivery (Encompass Docs):

1. Creates **Disclosure Tracking entry**
2. Creates **eFolder document containers**
3. Notifies recipients via email (Consumer Connect / Loan Connect)

Webhook: Loan resource `disclosureTracking` event (API Beta Only per webhook catalog).

---

## John Smith example

| Event | Disclosure tracking impact |
|-------|---------------------------|
| Initial LE sent | LE disclosure tracking log created via Document Order delivery |
| LE revised (changed circumstance) | New/updated log with revised snapshot |
| CD issued | CD disclosure tracking log; compliance dates tracked |
| Closing | CD signed; tracking dates updated |
| UCD export | `UseForUCDExport` flag set on selected CD log |

Lisa (Closing Coordinator) manages CD timing to meet TRID waiting periods (**business rules** — specific date fields in disclosure log contract).

---

## Disclosure Tracking vs Conditions

| Dimension | Disclosure Tracking | Conditions |
|-----------|--------------------|----|
| Purpose | Regulatory disclosure compliance | Underwriting/file requirements |
| Primary API | `disclosureTracking2015Logs` | `/conditions` |
| Driven by | LE/CD delivery events | Underwriting, investors, AUS |
| Snapshot | Yes (optional) | No equivalent |

A loan may have active disclosure tracking logs and simultaneous underwriting conditions.

---

## Webhook events

| Event | Resource | Support |
|-------|----------|---------|
| `disclosureTracking` | Loan | API (Beta Only) |

Dedicated Document Delivery webhook category also exists.

---

## References

- [Disclosure Tracking (2015)](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015)
- [V3 Get a Disclosure Tracking Log](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-disclosure-tracking-log-1)
- [V3 Add a Disclosure Tracking Log](https://developer.icemortgagetechnology.com/developer-connect/reference/add-a-disclosure-tracking-log)
- [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages)
