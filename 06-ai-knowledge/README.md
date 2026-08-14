# Encompass AI Knowledge Base (Phase 6)

Normalized, retrieval-optimized enterprise knowledge layer built from Phases 1–5. **Single canonical entry point for humans and RAG:** [../ENCOMPASS_MASTER_KNOWLEDGE_BASE.md](../ENCOMPASS_MASTER_KNOWLEDGE_BASE.md)

---

## Purpose

Support:

| Audience | Use |
|----------|-----|
| Developer onboarding | Maps, FAQs, API references |
| Product management | Domain/lifecycle maps, glossary |
| Architecture | Integration map, event map, Phase 5 architecture links |
| API development | API map, error map, version notes |
| Troubleshooting | troubleshooting.md, production-gotchas.md |
| Loan operations | Lifecycle maps, condition/task/document maps |
| Dashboard development | Timeline, comment, communication maps + Phase 5 |
| AI assistant / RAG | Chunked maps with fact classification |
| Incident investigation | Event map, reconciliation, failure handling links |
| Production support | Gotchas, error map, architect FAQ |

---

## Repository layers (do not duplicate blindly)

| Layer | Path | Role |
|-------|------|------|
| **Domain** | [01-domain/](../01-domain/README.md) | Business concepts, lifecycle narratives |
| **APIs** | [02-apis/API-INDEX.md](../02-apis/API-INDEX.md) | Official endpoint reference |
| **Communications** | [03-loan-communications/](../03-loan-communications/README.md) | Timeline sources, comment matrix |
| **Dashboard architecture** | [05-dashboard-architecture/](../05-dashboard-architecture/README.md) | Internal AWS read-model design |
| **AI maps (this layer)** | `06-ai-knowledge/` | Normalized indexes, matrices, FAQs — **points to canonical docs** |

Phase 6 **consolidates and classifies**; it does not replace Phases 1–5.

---

## Fact classification (mandatory for AI)

Every important statement in this layer uses one tag:

| Tag | Meaning | AI behavior |
|-----|---------|-------------|
| **OFFICIAL_DOCUMENTATION** | Verified ICE Developer Connect | Treat as API contract |
| **LENDER_CONFIGURABLE** | Per-lender Encompass settings | Do not hardcode values |
| **VERSION_DEPENDENT** | Tied to Encompass release | Check version matrix |
| **ILLUSTRATIVE_BUSINESS_EXAMPLE** | Fictional loan (John Smith) | Not a platform default |
| **INTERNAL_ARCHITECTURE_RECOMMENDATION** | Our dashboard design (Phase 5) | Not an ICE requirement |
| **NOT_ESTABLISHED** | Not verified in official docs reviewed | Flag uncertainty; do not assert |

---

## Source traceability

API facts include:

- Official URL: `https://developer.icemortgagetechnology.com/developer-connect/reference/...`
- API version (V1/V3/webhook V1)
- Page title where known
- **Last verified:** 2026-08-13 (repository audit date)

If source unavailable → **NOT_ESTABLISHED**.

---

## Master matrices

| Matrix | File |
|--------|------|
| Objects (17 columns) | [master-object-matrix.md](./master-object-matrix.md) |
| Events (13 columns) | [master-event-matrix.md](./master-event-matrix.md) |
| Comments (11 columns) | [master-comment-matrix.md](./master-comment-matrix.md) |
| Lifecycles | [master-lifecycle-matrix.md](./master-lifecycle-matrix.md) |

---

## Map index

| Map | File |
|-----|------|
| Domain overview | [domain-map.md](./domain-map.md) |
| APIs | [api-map.md](./api-map.md) |
| Objects | [object-map.md](./object-map.md) |
| Relationships | [relationship-map.md](./relationship-map.md) |
| Lifecycles | [lifecycle-map.md](./lifecycle-map.md) |
| Events / webhooks | [event-map.md](./event-map.md) |
| Comments | [comment-map.md](./comment-map.md) |
| Communications | [communication-map.md](./communication-map.md) |
| Documents / eFolder | [document-map.md](./document-map.md) |
| Conditions | [condition-map.md](./condition-map.md) |
| Tasks | [task-map.md](./task-map.md) |
| Milestones | [milestone-map.md](./milestone-map.md) |
| Loan aggregate | [loan-map.md](./loan-map.md) |
| Configuration | [configuration-map.md](./configuration-map.md) |
| Permissions | [permission-map.md](./permission-map.md) |
| Errors | [error-map.md](./error-map.md) |
| Integration patterns | [integration-map.md](./integration-map.md) |

---

## FAQs & operations

| Document | File |
|----------|------|
| Developer FAQ | [developer-faq.md](./developer-faq.md) |
| Architect FAQ | [architect-faq.md](./architect-faq.md) |
| Product FAQ | [product-faq.md](./product-faq.md) |
| Troubleshooting | [troubleshooting.md](./troubleshooting.md) |
| Production gotchas | [production-gotchas.md](./production-gotchas.md) |
| Glossary | [mortgage-glossary.md](./mortgage-glossary.md) |

---

## Quality report

[KNOWLEDGE_BASE_QUALITY_REPORT.md](./KNOWLEDGE_BASE_QUALITY_REPORT.md) — audit findings, gaps, contradictions resolved.

---

## AI chunking standard

Each map document includes:

1. Title · 2. Purpose · 3. Scope · 4. Key Concepts · 5. Definitions · 6. Relationships · 7. API References · 8. Examples · 9. Production Notes · 10. Common Mistakes · 11. FAQ · 12. Related Documents · 13. Source References

Chunk for RAG: **one H2 section = one retrieval unit** (~200–800 tokens).

---

## Fictional reference loan (ILLUSTRATIVE_BUSINESS_EXAMPLE)

John Smith · $400K purchase · Conventional 30-year · LO Mike · Processor Sarah · UW Robert · Closer Lisa
