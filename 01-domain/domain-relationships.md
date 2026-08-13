# Domain Relationships

## Loan-centric relationship model

Everything in Encompass loan origination orbits the **Loan** aggregate.

```
LOAN
 |
 +-- Application (borrower pair)
 |     |
 |     +-- Borrower
 |     +-- Co-Borrower
 |     +-- Property
 |     +-- Employment / Income / Assets / Liabilities (variable collections)
 |
 +-- Milestone Logs
 |     |
 |     +-- Loan Associate (user/group on milestone role)
 |     +-- Milestone Comments
 |
 +-- Conditions
 |     |
 |     +-- Tracking Entries
 |     +-- Comments
 |     +-- assignedTo → Documents
 |
 +-- eFolder Documents
 |     |
 |     +-- Attachments (files)
 |     +-- Document Comments
 |     +-- Document Status
 |
 +-- Workflow Tasks (via associations)
 |     |
 |     +-- Subtasks
 |     +-- Task Comments
 |
 +-- Disclosure Tracking 2015 Logs
 |
 +-- Conversation Logs (editable)
 |
 +-- System Logs
 |     +-- Milestone History
 |     +-- HTML Email Logs
 |     +-- Lock Action Logs
 |
 +-- Field Data (entity collections)
 |
 +-- Webhook Events → integration layer
```

---

## ASCII domain diagram (full)

```
                         CUSTOMER / BORROWER
                                 |
                                 v
                               LOAN
                                 |
         +-----------------------+------------------------+
         |                       |                        |
       DATA                   WORKFLOW                  PEOPLE
         |                       |                        |
    +----+----+            +-----+-----+            +-----+-----+
    |    |    |            |     |     |            |     |     |
Borrower  Property    Milestones  Tasks        Associates Roles
    |    Employment       |     Subtasks           |       Users
    |    Income           |       |              Groups  Personas
    |    Assets      Conditions   |                      Contacts
    |    Liabilities     |         |
    |                    |         |
    +--------+-----------+         |
             |                     |
             v                     |
         DOCUMENTS                 |
             |                     |
      +------+------+              |
      |             |              |
   eFolder    Document Order        |
      |             |              |
 Attachments    Delivery            |
      |             |              |
      +------+------+              |
             |                     |
             v                     |
        CONDITIONS ←----------------+
             |
             v
        DISCLOSURES
             |
             v
      COMMUNICATIONS & LOGS
```

---

## Relationship matrix

| From | To | Cardinality | Relationship |
|------|-----|-------------|--------------|
| Loan | Application | 1..n | Loan contains borrower pairs |
| Application | Borrower | 1..1 | Primary applicant |
| Application | Co-Borrower | 0..1 | Secondary applicant |
| Application | Property | 1..1 | Subject property |
| Loan | Milestone Log | 1..n | Workflow stages (from template) |
| Milestone Log | Loan Associate | 0..1 | Role assignment per milestone |
| Loan | Condition | 0..n | Requirements |
| Condition | Document | n..m | Documents assigned to conditions |
| Document | Attachment | 1..n | Files in document container |
| Attachment | Document | n..1 | File belongs to one document |
| Loan | Workflow Task | 0..n | Via workEntity / associations |
| Task | Condition | n..m | Via associations (opaque to task service) |
| Task | Subtask | 1..n | Parent/child work breakdown |
| Loan | Disclosure Log | 0..n | TRID compliance records |
| Document Order | Disclosure Log | 0..n | Created on successful delivery |
| Document Order | eFolder Document | 0..n | Containers created on delivery |
| Loan | Conversation Log | 0..n | Communications |
| User | Role | n..m | Via persona/settings (**LENDER CONFIGURABLE**) |
| User | Loan Associate | n..m | Per-loan role assignments |

---

## Condition → Document → Attachment chain

Official rules:

1. Condition is a **requirement**
2. Document is **evidence container**
3. Attachment is **file proof**

```
Condition: "Provide most recent two paystubs"
    │
    ├── assignedTo → Document: "Paystubs"
    │                    │
    │                    ├── Attachment: Paystub.pdf
    │                    └── Attachment: Paystub2.pdf
    │
    ├── tracking[]: Requested → Received → Cleared
    └── comments[]: "Need donor statement."
```

One document may satisfy multiple conditions. One condition may require multiple documents.

---

## Task ↔ Condition association (integration pattern)

Not enforced by Encompass — integrator-defined via Workflow Task associations:

```
Task: "Review borrower income"
  associations: [
    {
      entityType: "urn:elli:encompass:loan:underwritingcondition",
      entityId: "{paystub-condition-id}",
      relationship: "appliesTo"
    }
  ]

Condition: "Provide latest paystubs"
  (borrower-facing requirement)
```

---

## Milestone ↔ Task ↔ Condition timing

Typical dependencies (business logic, not platform-enforced):

```
Milestone: Processing
    → Tasks: document collection work
    → Conditions: preliminary requirements

Milestone: Cond. Approval
    → Conditions: underwriting requirements (Prior To = Approval)
    → Tasks: underwriter review work

Milestone: Doc Preparation
    → Document Orders: LE/CD packages
    → Disclosure Tracking logs
    → Conditions: Prior To = Docs
```

---

## People relationships

```
Organization
    └── Internal User (Mike, Sarah, Robert, Lisa)
            ├── Persona (capabilities)
            ├── User Groups
            └── Loan Associate on Loan X
                    └── Role (Loan Officer, Processor, etc.)
                            └── Milestone (optional binding)
```

External users (TPO) relate via External Organization model — separate from internal loan associates.

---

## Event relationships

```
State Change in Encompass
    │
    ├── Webhook Event (async, partial)
    │       └── meta.resourceRef → GET for truth
    │
    ├── System Log (append-only history)
    │
    └── Field Change Event (EFC: previous + new value)
```

---

## Mermaid diagram

See [domain-model.mmd](./domain-model.mmd) for the full entity-relationship diagram.

---

## John Smith — object graph at conditional approval

```
Loan [GUID]
├── Application
│   ├── Borrower: John Smith
│   └── Property: $500K purchase
├── Milestone: Cond. Approval (active)
│   └── Associate: Robert (Underwriter)
├── Condition: "Provide most recent two paystubs"
│   ├── assignedTo: Document "Paystubs"
│   │   ├── Attachment: Paystub.pdf
│   │   └── Attachment: Paystub2.pdf
│   └── Comment: "Need donor statement."
├── Task: "Review borrower income" (Sarah)
│   └── association → paystub condition
└── ConversationLog: "Spoke with borrower about large deposit"
```

---

## Cross-references

| Topic | Document |
|-------|----------|
| Loan aggregate | [loan-domain.md](./loan-domain.md) |
| Lifecycle | [mortgage-lifecycle.md](./mortgage-lifecycle.md) |
| Conditions | [conditions.md](./conditions.md), [enhanced-conditions.md](./enhanced-conditions.md) |
| Documents | [documents-efolder.md](./documents-efolder.md) |
| Events | [events.md](./events.md) |
| Term definitions | [domain-glossary.md](./domain-glossary.md) |
