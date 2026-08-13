# Master knowledge base

Senior-engineer onboarding set for ICE Mortgage Technology Encompass Developer Connect.

These 18 files follow the teaching format: business meaning, John Smith case, domain model, official API, request/response (labeled), field tables, lifecycle, events, integration, production concerns, common mistakes, and architecture questions.

**Primary source of truth:** [ICE Developer Connect](https://developer.icemortgagetechnology.com/developer-connect)

If documentation is ambiguous, version-dependent, lender-configurable, or missing, the files say so. They do **not** invent endpoint paths, field names, status values, webhook names, limits, or SLAs.

## Running case (illustrative)

| Item | Value |
|------|--------|
| Borrower | John Smith |
| Purpose | Purchase |
| Property value | $500,000 |
| Loan amount | $400,000 |
| Program | Conventional 30-year fixed |
| Loan Officer | Mike |
| Processor | Sarah |
| Underwriter | Robert |
| Closing Coordinator | Lisa |
| Title | ABC Title |
| Appraisal | XYZ Appraisal |

## Legend used in every file

| Label | Meaning |
|-------|---------|
| **Documented** | Stated on a current ICE Developer Connect page; URL given |
| **Illustrative** | Teaching example; not a contract; do not hardcode |
| **NOT ESTABLISHED** | Official documentation does not currently prove this |

## Files

| File | Topic |
|------|-------|
| [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) | Core mental model and four objects |
| [02-loan-domain.md](./02-loan-domain.md) | Loan as aggregate; current state vs history vs events |
| [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md) | Schema, field IDs, views, collections, EFC |
| [04-conditions-standard.md](./04-conditions-standard.md) | Standard Conditions API |
| [05-conditions-enhanced.md](./05-conditions-enhanced.md) | Enhanced Conditions contract and APIs |
| [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) | Lifecycle, comments vs tracking, documents |
| [07-workflow-tasks.md](./07-workflow-tasks.md) | Task Service (not milestone tasks) |
| [08-milestones-and-associates.md](./08-milestones-and-associates.md) | Stages, associates, SLA fields |
| [09-documents-efolder-attachments.md](./09-documents-efolder-attachments.md) | eFolder document vs attachment |
| [10-document-orders-delivery-disclosures.md](./10-document-orders-delivery-disclosures.md) | Packages, delivery, disclosure tracking |
| [11-conversation-logs-notes-comments.md](./11-conversation-logs-notes-comments.md) | Unified comments model + aggregation matrix |
| [12-organizations-users-roles.md](./12-organizations-users-roles.md) | People, personas, roles, SoD |
| [13-webhooks-events.md](./13-webhooks-events.md) | Catalog, payload, idempotency |
| [14-epc-dda-trades-schedulers.md](./14-epc-dda-trades-schedulers.md) | External/service domains |
| [15-production-integration-architecture.md](./15-production-integration-architecture.md) | Bank receiver architecture |
| [16-bank-product-engineering.md](./16-bank-product-engineering.md) | What a bank product engineer must know |
| [17-api-reference-cheatsheet.md](./17-api-reference-cheatsheet.md) | Documented endpoints only |
| [18-real-loan-end-to-end-case-study.md](./18-real-loan-end-to-end-case-study.md) | John Smith lifecycle + master diagrams |

## API accuracy rules (mandatory)

1. Official ICE docs are primary authority.
2. Say V1 or V3 as documented; do not mix contracts silently.
3. Do not invent paths, fields, statuses, events, or hard limits.
4. Lender-configurable behavior is labeled as such.
5. Limited availability / license / beta is labeled as such.
6. Unclear docs → `NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION`.

Related seed and research worksheets live one directory up: [../README.md](../README.md).
