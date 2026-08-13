# Encompass Master Knowledge Base

**Single entry point** for the ICE Encompass enterprise knowledge repository.  
**Last consolidated:** 2026-08-13 · **AI layer:** [06-ai-knowledge/README.md](./06-ai-knowledge/README.md)

---

## How to use this document

| Audience | Start here |
|----------|------------|
| New developer | §1–3, [developer-faq.md](./06-ai-knowledge/developer-faq.md), [02-apis/API-INDEX.md](./02-apis/API-INDEX.md) |
| Architect | §19–27, [architect-faq.md](./06-ai-knowledge/architect-faq.md), [integration-map.md](./06-ai-knowledge/integration-map.md) |
| Product / ops | §4–18, [product-faq.md](./06-ai-knowledge/product-faq.md), [lifecycle-map.md](./06-ai-knowledge/lifecycle-map.md) |
| AI / RAG | [06-ai-knowledge/](./06-ai-knowledge/) maps + matrices; classify facts per [README](./06-ai-knowledge/README.md) |

### Fact classification (required for AI)

| Tag | Meaning |
|-----|---------|
| **OFFICIAL_DOCUMENTATION** | ICE Developer Connect |
| **LENDER_CONFIGURABLE** | Per-lender settings |
| **VERSION_DEPENDENT** | Release-specific |
| **ILLUSTRATIVE_BUSINESS_EXAMPLE** | John Smith fictional loan |
| **INTERNAL_ARCHITECTURE_RECOMMENDATION** | Our dashboard design (Phase 5) |
| **NOT_ESTABLISHED** | Unverified in official docs reviewed |

---

## 1. What Encompass is

**OFFICIAL_DOCUMENTATION:** Encompass is ICE Mortgage Technology's loan origination platform. **Developer Connect** exposes REST APIs and Webhooks V1 for integration.

**INTERNAL_ARCHITECTURE_RECOMMENDATION:** Our dashboard is a **read-optimized intelligence layer** — Encompass remains **system of record**.

- Official portal: https://developer.icemortgagetechnology.com/developer-connect

---

## 2. Mortgage domain model

Loan-centric origination: borrower data, workflow stages, conditions, documents, disclosures, communications.

→ [01-domain/README.md](./01-domain/README.md) · [domain-map.md](./06-ai-knowledge/domain-map.md) · [relationship-map.md](./06-ai-knowledge/relationship-map.md)

---

## 3. Loan

Root aggregate; permanent `loan.id` GUID. Views: `entity`, `logs`, `full` — **OFFICIAL_DOCUMENTATION**.

→ [loan-map.md](./06-ai-knowledge/loan-map.md) · [01-domain/loan-domain.md](./01-domain/loan-domain.md) · [02-apis/loan-api.md](./02-apis/loan-api.md)

---

## 4. Milestones

Workflow stages; V3 `GET/PATCH .../milestones`. Finish: `doneIndicator`. System history: Milestone History Log — **OFFICIAL_DOCUMENTATION**.

→ [milestone-map.md](./06-ai-knowledge/milestone-map.md) · [01-domain/milestones.md](./01-domain/milestones.md)

---

## 5. Tasks

**Workflow Tasks** at `/workflow/v1/tasks` — not milestone tasks — **OFFICIAL_DOCUMENTATION**.

→ [task-map.md](./06-ai-knowledge/task-map.md) · [01-domain/tasks.md](./01-domain/tasks.md)

---

## 6. Conditions (Standard)

V1 `/conditions/{type}` when `useEnhancedConditionIndicator=false` — **OFFICIAL_DOCUMENTATION**.

→ [01-domain/conditions.md](./01-domain/conditions.md) · [02-apis/condition-api.md](./02-apis/condition-api.md)

---

## 7. Enhanced Conditions

V3 `/conditions` with comments, tracking, templates — **OFFICIAL_DOCUMENTATION** (20.2+).

→ [condition-map.md](./06-ai-knowledge/condition-map.md) · [01-domain/enhanced-conditions.md](./01-domain/enhanced-conditions.md)

---

## 8. Documents

eFolder **containers** — `GET/PATCH .../documents` — **OFFICIAL_DOCUMENTATION**.

→ [document-map.md](./06-ai-knowledge/document-map.md) · [01-domain/documents-efolder.md](./01-domain/documents-efolder.md)

---

## 9. eFolder

Electronic folder on loan; documents + attachments + history API — **OFFICIAL_DOCUMENTATION**.

→ [02-apis/document-api.md](./02-apis/document-api.md) · `GET .../histories/eFolder`

---

## 10. Attachments

Files; V3 required — **VERSION_DEPENDENT** V1 sunset 26.3 — **OFFICIAL_DOCUMENTATION**.

→ [02-apis/attachment-api.md](./02-apis/attachment-api.md)

---

## 11. Document Order

Generate LE/CD packages — `/encompassdocs/v1/documentOrders` — async — **OFFICIAL_DOCUMENTATION**.

→ [02-apis/document-order-api.md](./02-apis/document-order-api.md)

---

## 12. Document Delivery

Send packages; creates disclosure + eFolder side effects — **OFFICIAL_DOCUMENTATION**.

→ [02-apis/document-delivery-api.md](./02-apis/document-delivery-api.md)

---

## 13. Disclosures

Disclosure Tracking 2015 logs — TRID — **OFFICIAL_DOCUMENTATION**. Webhook beta.

→ [01-domain/disclosures.md](./01-domain/disclosures.md) · [02-apis/disclosure-api.md](./02-apis/disclosure-api.md)

---

## 14. Conversation Logs

Editable loan communications + alerts — **OFFICIAL_DOCUMENTATION**. V3 PATCH / V1 GET.

→ [communication-map.md](./06-ai-knowledge/communication-map.md) · [03-loan-communications/conversation-logs.md](./03-loan-communications/conversation-logs.md)

---

## 15. Notes

Entity-scoped only (trade, borrower contact). **NOT_ESTABLISHED:** global loan notes API.

→ [03-loan-communications/notes.md](./03-loan-communications/notes.md)

---

## 16. Comments

Resource-scoped; LogCommentContract — **OFFICIAL_DOCUMENTATION**. No loan-wide API — **NOT_ESTABLISHED**.

→ [comment-map.md](./06-ai-knowledge/comment-map.md) · [03-loan-communications/comments.md](./03-loan-communications/comments.md)

---

## 17. Logs

**Editable:** conversation, AUS. **System:** milestone history, HTML email, lock — **OFFICIAL_DOCUMENTATION**. Via `view=logs`.

→ [03-loan-communications/loan-history.md](./03-loan-communications/loan-history.md)

---

## 18. Field Changes

Webhooks `fieldchange`, `enhancedfieldchange`; auditTrail POST — **OFFICIAL_DOCUMENTATION**.

→ [03-loan-communications/field-changes.md](./03-loan-communications/field-changes.md)

---

## 19. Webhooks

Push notifications; dedupe `eventId`; GET `resourceRef` — **OFFICIAL_DOCUMENTATION**.

→ [event-map.md](./06-ai-knowledge/event-map.md) · [02-apis/webhook-api.md](./02-apis/webhook-api.md)

---

## 20. Organizations and Users

Orgs V1; Users V3 internal/external; Roles settings 25.1+ — **OFFICIAL_DOCUMENTATION**.

→ [02-apis/users-organizations-api.md](./02-apis/users-organizations-api.md)

---

## 21. EPC (Partner Connect)

Partner service orders; webhook category — **OFFICIAL_DOCUMENTATION**.

→ [02-apis/epc-api.md](./02-apis/epc-api.md)

---

## 22. DDA

Data & Document Automation; webhooks limited availability — **OFFICIAL_DOCUMENTATION**.

→ [02-apis/dda-api.md](./02-apis/dda-api.md)

---

## 23. Schedulers

Timer webhooks; REST CRUD **NOT_ESTABLISHED** in catalog reviewed.

→ [02-apis/scheduler-api.md](./02-apis/scheduler-api.md)

---

## 24. Trades

Secondary correspondent trades + notes — **OFFICIAL_DOCUMENTATION**.

→ [02-apis/trades-api.md](./02-apis/trades-api.md)

---

## 25. Dashboard architecture

AWS read model: webhook → SQS → processor → Aurora + OpenSearch — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

→ [05-dashboard-architecture/README.md](./05-dashboard-architecture/README.md)

---

## 26. Unified loan timeline

Multi-API aggregation; `LoanTimelineEvent` — **INTERNAL_ARCHITECTURE_RECOMMENDATION** + **OFFICIAL_DOCUMENTATION** sources.

→ [03-loan-communications/unified-loan-timeline.md](./03-loan-communications/unified-loan-timeline.md)

---

## 27. Production integration architecture

Ingestion, idempotency, polling fallback — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

→ [05-dashboard-architecture/event-ingestion.md](./05-dashboard-architecture/event-ingestion.md) · [integration-map.md](./06-ai-knowledge/integration-map.md)

---

## 28. Security

PII, RBAC, encryption, webhook signatures — **INTERNAL_ARCHITECTURE_RECOMMENDATION** + **OFFICIAL_DOCUMENTATION** (OAuth, signing keys).

→ [05-dashboard-architecture/security.md](./05-dashboard-architecture/security.md)

---

## 29. Scalability

100k+ loans, millions of events — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

→ [05-dashboard-architecture/scalability.md](./05-dashboard-architecture/scalability.md)

---

## 30. Reconciliation

Dedupe, replay, drift — **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

→ [05-dashboard-architecture/reconciliation.md](./05-dashboard-architecture/reconciliation.md)

---

## 31. Troubleshooting

→ [06-ai-knowledge/troubleshooting.md](./06-ai-knowledge/troubleshooting.md) · [production-gotchas.md](./06-ai-knowledge/production-gotchas.md)

---

## 32. Glossary

→ [06-ai-knowledge/mortgage-glossary.md](./06-ai-knowledge/mortgage-glossary.md) · [01-domain/domain-glossary.md](./01-domain/domain-glossary.md)

---

## 33. API matrix

→ [06-ai-knowledge/master-object-matrix.md](./06-ai-knowledge/master-object-matrix.md) · [02-apis/API-INDEX.md](./02-apis/API-INDEX.md)

---

## 34. Event matrix

→ [06-ai-knowledge/master-event-matrix.md](./06-ai-knowledge/master-event-matrix.md)

---

## 35. Comment matrix

→ [06-ai-knowledge/master-comment-matrix.md](./06-ai-knowledge/master-comment-matrix.md)

---

## 36. Lifecycle matrix

→ [06-ai-knowledge/master-lifecycle-matrix.md](./06-ai-knowledge/master-lifecycle-matrix.md)

---

## Repository structure

```
01-domain/          Business domain (Phase 1)
02-apis/            Official API mapping (Phase 2)
03-loan-communications/  Timeline & comments (Phase 3)
05-dashboard-architecture/  AWS dashboard design (Phase 5)
06-ai-knowledge/    Normalized AI/RAG index (Phase 6)
ENCOMPASS_MASTER_KNOWLEDGE_BASE.md  ← you are here
```

---

## Quality audit

→ [06-ai-knowledge/KNOWLEDGE_BASE_QUALITY_REPORT.md](./06-ai-knowledge/KNOWLEDGE_BASE_QUALITY_REPORT.md)

---

## Fictional reference loan

**ILLUSTRATIVE_BUSINESS_EXAMPLE:** John Smith · $400K purchase · LO Mike · Processor Sarah · UW Robert · Closer Lisa

---

## Primary source

[Encompass Developer Connect](https://developer.icemortgagetechnology.com/developer-connect) — verify critical integrations against current OpenAPI before production releases.
