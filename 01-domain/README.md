# Encompass Domain Knowledge Base

Production-grade conceptual documentation for building lending dashboards and integrations against **ICE Mortgage Technology Encompass** via **Encompass Developer Connect**.

This knowledge base explains the **business domain**, **object relationships**, **lifecycle**, and **integration model**. It is not an API implementation guide.

## Source of truth

All factual claims in this knowledge base are drawn from the current official [Encompass Developer Connect](https://developer.icemortgagetechnology.com/developer-connect) documentation unless explicitly marked otherwise:

| Marker | Meaning |
|--------|---------|
| **LENDER CONFIGURABLE** | Behavior, names, or values defined per lender in Encompass settings |
| **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** | Could not be verified from official Developer Connect docs at time of writing |

## Fictional reference loan

Throughout this knowledge base, a fictional purchase loan illustrates domain concepts:

| Attribute | Value |
|-----------|-------|
| Borrower | John Smith |
| Loan amount | $400,000 |
| Property value | $500,000 |
| Purpose | Purchase |
| Program | Conventional 30-year fixed |
| Loan Officer | Mike |
| Processor | Sarah |
| Underwriter | Robert |
| Closing Coordinator | Lisa |

## Core domain distinction

```
Loan          = The mortgage transaction and its complete business data
Milestone     = A major stage in the mortgage workflow
Task          = A unit of work assigned to a person, role, or workflow
Condition     = A requirement that must be satisfied before the loan can proceed
Document      = A business document record (eFolder container)
Attachment    = The actual electronic file associated with a document
Comment       = Contextual information attached to a business object
Conversation Log = A record of communication associated with the loan
Note          = Entity-specific annotation (not a single global loan "Note" API)
System Log    = Platform-generated history
Field Change  = A change to loan data
Event/Webhook = An integration notification about something that happened
```

## Documentation map

| Document | Focus |
|----------|-------|
| [loan-domain.md](./loan-domain.md) | Loan as root aggregate, V3 schema entity types, loan ID, views |
| [mortgage-lifecycle.md](./mortgage-lifecycle.md) | Realistic lifecycle stages, lender configuration, example loan progression |
| [borrowers-applications.md](./borrowers-applications.md) | Borrower pairs, applications, property, income, assets, liabilities |
| [people-roles-associates.md](./people-roles-associates.md) | Users, personas, roles, loan associates, contacts |
| [milestones.md](./milestones.md) | Milestone logs, SLA metrics, milestone-free roles |
| [tasks.md](./tasks.md) | Workflow tasks vs milestone tasks, templates, pipeline |
| [conditions.md](./conditions.md) | Standard conditions, condition ≠ document |
| [enhanced-conditions.md](./enhanced-conditions.md) | Enhanced conditions, templates, sets, automated conditions |
| [documents-efolder.md](./documents-efolder.md) | eFolder, documents, attachments, document orders |
| [disclosures.md](./disclosures.md) | Disclosure tracking (2015), RESPA-TILA compliance |
| [communications.md](./communications.md) | Conversation logs, email, alerts |
| [comments-notes-logs.md](./comments-notes-logs.md) | Comments vs notes vs logs comparison |
| [events.md](./events.md) | Webhooks, EFC, integration patterns |
| [domain-relationships.md](./domain-relationships.md) | Cross-object relationships and diagrams |
| [domain-glossary.md](./domain-glossary.md) | Term definitions |
| [domain-model.mmd](./domain-model.mmd) | Mermaid entity-relationship diagram |

## High-level domain diagram

```
CUSTOMER
   |
   v
 LOAN
   |
   +-------------------+-------------------+
   |                   |                   |
  DATA              WORKFLOW            PEOPLE
   |                   |                   |
Borrower           Milestones          Associates
Property           Conditions          Roles
Employment         Tasks               Users
Income             Subtasks            Groups
Assets             Schedulers          Contacts
Liabilities
   |
   v
DOCUMENTS
   |
   +-------------+
   |             |
 eFolder    Document Order
   |             |
Attachments   Delivery
   |
   v
CONDITIONS
   |
   v
DISCLOSURES
```

## Official Developer Connect entry points

- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- [Loan Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions)
- [Manage Documents / Attachments](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1)
- [Workflow Task Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy)
- [Webhooks Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
