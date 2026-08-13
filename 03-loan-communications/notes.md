# Notes (Entity-Scoped)

Encompass **Notes** are **not** a unified loan-file annotation system. Official Developer Connect documents Notes on specific **entities** only.

---

## Official Note APIs

| Note type | API version | Endpoints | Parent entity |
|-----------|-------------|-----------|---------------|
| **Correspondent Trade Note** | V1 | `GET/PUT/PATCH/POST /secondary/v1/trades/correspondent/{tradeId}/notes` | Correspondent trade |
| **Borrower Contact Note** | V1 | `POST /encompass/v1/borrowerContacts/{contactId}/notes` | Borrower contact (CRM) |

Full CRUD on borrower contact notes beyond create: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** in pages reviewed.

---

## What is NOT a Note

| Misconception | Correct object |
|---------------|----------------|
| Loan-file phone call log | **Conversation Log** |
| "Need donor statement" on condition | **Condition Comment** |
| Task progress text | **Task Comment** |
| `GET /loans/{loanId}/notes` | **Does not exist** per official docs |

---

## Correspondent Trade Notes

### Business purpose

Secondary marketing desk annotates trades — pricing exceptions, batch instructions, investor communication.

### TradeNoteContract (official fields)

| Field | Meaning |
|-------|---------|
| `id` | Note identifier |
| `details` | Note body |
| `createdTimeStamp` | Created time |
| `createdBy` | Author |

### Who writes / reads

Persona with **Edit Correspondent Trades** (official 21.3 release notes).

### Events

Trade note changes trigger **Trade Updated** event in trade history (official 21.3).

### Loan relationship

Trade notes belong to **trade**, not loan directly. If John Smith loan is assigned to a correspondent trade, link timeline events via trade ↔ loan assignment APIs — not via loan ID on note itself.

---

## Borrower Contact Notes

### Business purpose

CRM-style follow-up on a **borrower contact** record — may span multiple loans over time.

### Schema fields (Borrowercontactnotes)

| Field | Meaning |
|-------|---------|
| `noteId` | Identifier |
| `subject` | Title |
| `details` | Body |
| `timestamp` | When recorded |

### Who writes / reads

CRM users with borrower contact permissions — **LENDER CONFIGURABLE**.

### Loan relationship

Contact may relate to borrower on loan applications — dashboard must **join** contact → application → loan for unified borrower timeline. No native `loanId` on note API path.

---

## Comparison to Conversation Log

| Dimension | Note (Trade/Contact) | Conversation Log |
|-----------|-------------------|------------------|
| Scope | Trade or Contact | Loan |
| API family | Secondary / Contacts | Loan Management |
| Alerts | No | Yes (`alerts[]`) |
| Contact metadata | Trade or CRM context | `name`, `phone`, `email` on log |
| In `view=logs` | No | Yes |

---

## Timeline treatment

When including notes in a loan timeline:

```json
{
  "eventType": "NOTE_CREATED",
  "resourceType": "TRADE",
  "resourceId": "{tradeId}",
  "source": "encompass:secondary:v1:trade-notes",
  "rawReference": "/secondary/v1/trades/correspondent/{tradeId}/notes/{noteId}",
  "loanId": "{derivedLoanId}"
}
```

`loanId` is **NORMALIZED INTERNAL** — derived from trade-loan assignment, not an Encompass note field.

`eventType: "NOTE_CREATED"` is **NORMALIZED INTERNAL EVENT TYPE**.

---

## Search implications

Loan-scoped note text search requires:

1. Resolve loans on trade (if trade note)
2. Resolve contacts for borrower on loan (if contact note)
3. Full-text index `details` / `subject` in your store — Encompass does not offer cross-entity note search API (**NOT ESTABLISHED**)

See [search-strategy.md](./search-strategy.md).

---

## References

- [02-apis/notes-api.md](../02-apis/notes-api.md)
- [02-apis/trades-api.md](../02-apis/trades-api.md)
- [comments-vs-notes-vs-conversations.md](./comments-vs-notes-vs-conversations.md)
