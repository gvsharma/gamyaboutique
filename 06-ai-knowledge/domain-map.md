# Domain Map

## Purpose

Single-page orientation to the Encompass **mortgage origination domain** for AI retrieval and human onboarding.

## Scope

Conceptual model only. API details → [api-map.md](./api-map.md). Canonical depth → [01-domain/](../01-domain/README.md).

## Key concepts

| Concept | Definition | Classification |
|---------|------------|----------------|
| **Loan** | Root aggregate — entire mortgage file | **OFFICIAL_DOCUMENTATION** |
| **Application** | Borrower pair + property + app-scoped data | **OFFICIAL_DOCUMENTATION** |
| **Milestone** | Major workflow stage | **OFFICIAL_DOCUMENTATION** |
| **Condition** | Requirement tracked in eFolder | **OFFICIAL_DOCUMENTATION** |
| **Document** | eFolder container (not the file) | **OFFICIAL_DOCUMENTATION** |
| **Attachment** | Electronic file | **OFFICIAL_DOCUMENTATION** |
| **Workflow Task** | Modern assignable work (`/workflow/v1`) | **OFFICIAL_DOCUMENTATION** |
| **Conversation Log** | Loan-level communication + alerts | **OFFICIAL_DOCUMENTATION** |
| **Comment** | Resource-scoped annotation | **OFFICIAL_DOCUMENTATION** |
| **Note** | Entity-scoped (trade, contact) — not global loan notes | **OFFICIAL_DOCUMENTATION** |

## Domain hierarchy

```
LOAN → Applications → Borrowers / Property
     → Milestones → Associates
     → Conditions ↔ Documents → Attachments
     → Workflow Tasks → Subtasks
     → Disclosures / Document Orders
     → Conversation Logs + System Logs
```

## Relationships

See [relationship-map.md](./relationship-map.md) and [01-domain/domain-relationships.md](../01-domain/domain-relationships.md).

## API references

Crosswalk: [master-object-matrix.md](./master-object-matrix.md) · [02-apis/API-INDEX.md](../02-apis/API-INDEX.md)

## Examples

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** John Smith $400K purchase — see [01-domain/README.md](../01-domain/README.md).

## Production notes

- Check `useEnhancedConditionIndicator` before condition API family (**OFFICIAL_DOCUMENTATION**).
- Milestone names/order **LENDER_CONFIGURABLE**.

## Common mistakes

- Treating Document = Attachment (**OFFICIAL_DOCUMENTATION**: distinct).
- Treating Note = Conversation Log (**NOT_ESTABLISHED** global loan notes API).

## FAQ

**Q: Is Encompass replaced by our dashboard?**  
A: **INTERNAL_ARCHITECTURE_RECOMMENDATION:** No — Encompass remains system of record.

## Related documents

- [loan-map.md](./loan-map.md) · [lifecycle-map.md](./lifecycle-map.md) · [mortgage-glossary.md](./mortgage-glossary.md)

## Source references

- [Developer Connect](https://developer.icemortgagetechnology.com/developer-connect) — **OFFICIAL_DOCUMENTATION** · Last verified 2026-08-13
