# Encompass Developer Connect — Master Knowledge Base

> **Primary source of truth:** [ICE Mortgage Technology Encompass Developer Connect](https://developer.icemortgagetechnology.com/developer-connect/docs/welcome)  
> **Production API base URL:** `https://api.elliemae.com`  
> **UAT API base URL:** `https://concept.api.elliemae.com`

This knowledge base teaches Encompass as a **mortgage domain platform**, not as a flat list of endpoints. Every section follows the teaching format defined in the master prompt. Illustrative JSON is labeled explicitly; documented facts cite official ICE documentation.

## Running example loan

| Attribute | Value |
|-----------|-------|
| Borrower | John Smith |
| Purpose | Purchase |
| Property value | $500,000 |
| Loan amount | $400,000 |
| Program | Conventional 30-year fixed |

| Role | Person |
|------|--------|
| Loan Officer | Mike |
| Processor | Sarah |
| Underwriter | Robert |
| Closing Coordinator | Lisa |
| Title | ABC Title |
| Appraisal | XYZ Appraisal |

## File index

| # | File | Topic |
|---|------|-------|
| 01 | [01-encompass-domain-overview.md](./01-encompass-domain-overview.md) | Core mental model, four core objects compared |
| 02 | [02-loan-domain.md](./02-loan-domain.md) | Loan API, views, EFC, logs |
| 03 | [03-loan-schema-and-fields.md](./03-loan-schema-and-fields.md) | Schema, field IDs, collections |
| 04 | [04-conditions-standard.md](./04-conditions-standard.md) | Standard conditions |
| 05 | [05-conditions-enhanced.md](./05-conditions-enhanced.md) | Enhanced conditions deep dive |
| 06 | [06-condition-lifecycle-and-comments.md](./06-condition-lifecycle-and-comments.md) | Condition lifecycle, comments, tracking |
| 07 | [07-workflow-tasks.md](./07-workflow-tasks.md) | Workflow Task Service |
| 08 | [08-milestones-and-associates.md](./08-milestones-and-associates.md) | Milestones, associates, roles |
| 09 | [09-documents-efolder-attachments.md](./09-documents-efolder-attachments.md) | eFolder, documents, attachments |
| 10 | [10-document-orders-delivery-disclosures.md](./10-document-orders-delivery-disclosures.md) | Disclosures, document orders |
| 11 | [11-conversation-logs-notes-comments.md](./11-conversation-logs-notes-comments.md) | **Unified comments/logs model + aggregation matrix** |
| 12 | [12-organizations-users-roles.md](./12-organizations-users-roles.md) | Orgs, users, personas, SCIM |
| 13 | [13-webhooks-events.md](./13-webhooks-events.md) | Event architecture, idempotency |
| 14 | [14-epc-dda-trades-schedulers.md](./14-epc-dda-trades-schedulers.md) | External service domains |
| 15 | [15-production-integration-architecture.md](./15-production-integration-architecture.md) | Bank integration patterns |
| 16 | [16-bank-product-engineering.md](./16-bank-product-engineering.md) | Product engineer playbook |
| 17 | [17-api-reference-cheatsheet.md](./17-api-reference-cheatsheet.md) | Endpoint quick reference |
| 18 | [18-real-loan-end-to-end-case-study.md](./18-real-loan-end-to-end-case-study.md) | John Smith full lifecycle |

## Single-file download

For a single downloadable document, use:

**[MASTER-ENCOMPASS-DEVELOPER-CONNECT-KNOWLEDGE-BASE.md](./MASTER-ENCOMPASS-DEVELOPER-CONNECT-KNOWLEDGE-BASE.md)**

## API accuracy rules (mandatory)

1. Official ICE Developer Connect documentation is the primary authority.
2. State API version (V1 vs V3 vs workflow/v1) explicitly.
3. Do not invent endpoints, field names, status values, event names, or hard limits.
4. Distinguish documented facts from illustrative examples.
5. If lender-configurable, say so.
6. If documentation is unclear, state: **"documentation does not establish this."**

## Master architecture diagram

```
Customer
   |
   v
 LOAN ─────────────────────────────────────────────────────────┐
   |                                                          |
   +-- DATA (borrower, property, income, assets, liabilities) |
   +-- WORKFLOW (milestones, tasks, conditions)                |
   +-- PEOPLE (associates, contacts, roles)                    |
   +-- DOCUMENTS (eFolder → document → attachment)             |
   +-- DISCLOSURES (document order → delivery → tracking)      |
   +-- LOGS (conversation, system, editable)                   |
   +-- COMMENTS (condition, task, milestone, document)         |
   +-- EVENTS (webhooks)                                       |
                                                               |
External domains: EPC | DDA | Trades | Schedulers | Orgs/Users |
                                                               |
Encompass ──webhooks──> API Gateway ──> Ingestion ──> SQS       |
                              │                                |
                              v                                |
                         Event Store ──> Operational DB        |
                              │                                |
                              v                                |
                    Analytics / downstream banking systems <───┘
```
