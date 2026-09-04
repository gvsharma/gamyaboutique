# 09 — Disclosure Tracking

**Share this file when:** designing TRID/RESPA-TILA compliance history, LE/CD timelines, or audit views.

**Related:** [08 Document order](./08-document-order-and-delivery.md) · [07 Documents](./07-documents-and-attachments.md) · [16 Timeline model](./16-normalized-communications-timeline.md)

---

## What Disclosure Tracking is

Disclosure Tracking records **compliance-oriented disclosure history**.

It is not the same as:

- eFolder document storage
- Document Order generation
- a generic conversation log

**Do not confuse document delivery with disclosure compliance history.**

A successful send may create a tracking entry (ICE documents this for Send Encompass Docs). The tracking log is still the compliance record you query for dates, method, recipient, and revised vs initial.

## Examples of what tracking covers

Examples include:

- Loan Estimate
- Closing Disclosure
- disclosure date
- recipient
- method
- initial / revised disclosure
- intent-to-proceed-related tracking
- disclosure history

ICE's Disclosure Tracking (2015) APIs retrieve timelines and tracking dates for RESPA-TILA compliance for loans originated on or after October 3, 2015. They cover log tracking entries for:

- 2015 Loan Estimate
- Closing Disclosure
- Settlement Service Provider
- Safe Harbor disclosures

Confirm the current resource names and fields. ICE documents V3 list APIs such as disclosure tracking 2015 logs on a loan. Do not invent field names.

## Integration notes

- Use dedicated disclosure tracking APIs (or `view=log` / `full` only when you truly need logs mixed into the loan payload).
- Normalize disclosure events separately from eFolder document events. See [16](./16-normalized-communications-timeline.md).
- Treat dates, method, and recipient as audit-grade data. PII and audit/history are first-class architecture concerns (golden rule 12).

## Official documentation

- [Disclosure Tracking (2015)](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015)
- [V3 Get a List of Disclosure Tracking Logs](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-list-of-disclosure-tracking-logs)
- [Send Encompass Docs](https://developer.icemortgagetechnology.com/developer-connect/reference/send-docs)
