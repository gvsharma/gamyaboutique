# 01 — Purpose and Core Model

**Share this file when:** introducing Encompass as a platform, not a database.

**Related:** [02 Four key definitions](./02-four-key-definitions.md) · [17 Golden rules](./17-golden-rules.md) · [README](./README.md)

---

## Purpose

This document is the domain seed for building a long-term Encompass Developer Connect knowledge base.

The core idea is:

> Encompass is not merely a loan database. It is a configurable mortgage workflow and document platform centered around a loan.

Treat Encompass as:

- a **loan-centric system of record**
- a **configurable workflow engine** (milestones, tasks, conditions)
- a **document and disclosure platform** (eFolder, document order, disclosure tracking)
- an **evented integration surface** (webhooks + APIs)

Do not treat it as a generic CRUD database of borrowers.

## Core model

```text
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
   |
   v
DISCLOSURE TRACKING
```

## How to read the model

| Branch | Meaning | Typical resources |
|--------|---------|-------------------|
| **DATA** | Structured loan facts | Borrower, property, employment, income, assets, liabilities |
| **WORKFLOW** | Where the loan is and what must happen next | Milestones, conditions, tasks, subtasks, schedulers |
| **PEOPLE** | Who can act on the loan | Users, personas, roles, groups, associates, contacts |
| **DOCUMENTS** | Evidence and packages | eFolder documents, attachments, document orders, delivery |
| **CONDITIONS** | Requirements that must be satisfied | Standard Conditions, Enhanced Conditions |
| **DISCLOSURES** | Generated/delivered compliance packages | Opening/closing/on-demand packages |
| **DISCLOSURE TRACKING** | Compliance-oriented history | LE/CD dates, method, recipient, revised vs initial |

The arrows are **conceptual**, not a single API call sequence. A bank integration will typically:

1. Receive a webhook
2. Fetch current resource state via APIs
3. Normalize into downstream systems

See [12 Events and webhooks](./12-events-and-webhooks.md) and [14 Production architecture](./14-production-architecture.md).

## Design implication

Every integration question should start with:

1. **Which loan?**
2. **Which branch of the model** (data, workflow, people, documents)?
3. **Which object** (milestone, task, condition, document, attachment, log)?
4. **Is this current state, history, or an event notification?**

Webhook payloads are notifications. Current truth lives on the resource APIs.

## Official documentation

- [Developer Connect portal](https://developer.icemortgagetechnology.com/developer-connect)
- [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)
- [Webhook API](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)

Full link list: [18 Official documentation](./18-official-documentation.md)
