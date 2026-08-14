# Knowledge Base Quality Report

**Audit date:** 2026-08-13  
**Scope:** Phases 1–6 (`01-domain/`, `02-apis/`, `03-loan-communications/`, `05-dashboard-architecture/`, `06-ai-knowledge/`)  
**Auditor:** Repository consolidation pass (Phase 6)

---

## Executive summary

The knowledge base is **suitable for senior engineer reference** when readers respect fact classification tags. Phase 6 **normalizes** without replacing Phases 1–5. Primary risks: **unverified gaps (NOT_ESTABLISHED)**, **version-dependent renames**, and **conflating internal dashboard design with ICE contracts**.

No **invented REST endpoints** were found in Phases 1–5 (e.g. no `GET /loans/{id}/notes`). Normalized timeline `eventType` values are consistently labeled **INTERNAL** / **NORMALIZED** where applicable.

---

## Verified facts (OFFICIAL_DOCUMENTATION)

| Area | Verified claim | Source |
|------|----------------|--------|
| Loan GUID | `loan.id` permanent identifier | Loan Management |
| Loan views | `entity`, `logs`, `full` | Loan Management |
| No single comments API | Comments resource-scoped | Multiple API pages + Phase 3 audit |
| Enhanced vs Standard conditions | `useEnhancedConditionIndicator` branches API | Enhanced Conditions + Standard Conditions |
| Webhook core payload | eventId, eventTime, meta.resourceRef | Webhooks Overview |
| Loan webhook types | create, update, milestone, condition, document, fieldchange, EFC, etc. | wbhks-re-cat-loan |
| LogCommentContract | Shared comment fields | Enhanced Conditions, Conversation Log |
| Milestone finish | doneIndicator + finishMilestones | Milestone API |
| documentStatus | Replaces status 26.1+ | Document API / release notes |
| V1 attachment sunset | 26.3 | API production guidelines |
| Workflow Task base | /workflow/v1/tasks | Workflow Task Overview |
| Conversation log APIs | V1 GET conversationLogs; V3 PATCH conversationlogs | Conversation Log reference |

---

## Version-dependent facts

| Fact | Version | Action |
|------|---------|--------|
| Use `documentStatus` not `status` | 26.1+ | **VERSION_DEPENDENT** — confirm lender Encompass version |
| V1 eFolder Attachment sunset | 26.3 | Migrate to V3 |
| Task Comment webhook | 24.2+ | Confirm subscription catalog |
| Roles settings API | 25.1+ | [users-organizations-api.md](../02-apis/users-organizations-api.md) |
| Settings milestones API note | 25.1+ | [milestone-api.md](../02-apis/milestone-api.md) |
| Disclosure recipient viewed dates | 24.3+ (release notes) | Re-verify OpenAPI |
| fieldchange skip on large payload | Release note (~250KB) | Re-verify current release |

---

## Lender-configurable facts

| Area | Examples |
|------|----------|
| Milestone names/order | "Cond. Approval", "Processing" |
| Condition status labels | Requested, Cleared, etc. |
| Condition categories/types | Income, Assets, UW/Prelim/Post-Close |
| Document status values | Received, Reviewed |
| Task types/resolution codes | Processing, disposition codes |
| Personas/roles | Field visibility, eFolder access |
| Loan folders / auto-numbering | loanFolder, loanNumber |
| Prior To / Recipient on conditions | Template-driven |

**AI rule:** Never present configurable labels as universal Encompass enums.

---

## Illustrative examples (not platform defaults)

| Example | Location |
|---------|----------|
| John Smith $400K purchase loan | All phases |
| Milestone stage names in UX wireframe | 05-dashboard-architecture/dashboard-ux.md |
| Pipeline stage progression narratives | 01-domain/mortgage-lifecycle.md |
| CONDITION_RE_REQUESTED timeline type | Normalized internal taxonomy |
| Task overdue / SLA breached | Derived dashboard fields |

Tagged **ILLUSTRATIVE_BUSINESS_EXAMPLE** or **INTERNAL_ARCHITECTURE_RECOMMENDATION**.

---

## Internal architecture recommendations (not ICE)

| Recommendation | Phase |
|----------------|-------|
| Aurora + S3 + SQS + OpenSearch stack | 05 |
| LoanTimelineEvent normalized schema | 03, 05 |
| Dashboard API does not call Encompass on read path | 05 |
| idempotency_key on timeline rows | 05 |
| Derived fields: condition_age_days, task_overdue, sla_breached | 05 |
| Redis cache for loan overview | 05 |
| EFC separate worker queue | 05 |

Must not be quoted as Encompass requirements.

---

## Unknowns (NOT_ESTABLISHED)

| Topic | Status |
|-------|--------|
| Global `GET /loans/{id}/notes` | Does not exist per docs reviewed |
| Global all-comments API | Does not exist |
| Dedicated Conversation Log webhook category | Not in webhook catalog reviewed |
| Standard condition dedicated webhooks (non-EC loans) | Not established |
| Subtask comment dedicated webhook | Not established |
| Conversation log delete API | Not established |
| Per-comment delete on documents | Not established |
| Standard condition tracking REST API | Not established |
| Schedulers REST CRUD | Not established |
| DDA REST APIs (beyond webhooks) | Not established |
| Full standard condition OpenAPI field table | Not consolidated in KB |
| Complete document delivery request body schema | Partial in Phase 2 |
| Cross-loan comment search API | Not established |
| Borrower contact notes full CRUD beyond create | Partial |

---

## Duplicate information (resolved in Phase 6)

| Duplicated topic | Canonical location | Phase 6 action |
|------------------|-------------------|----------------|
| API endpoint matrix | 02-apis/API-INDEX.md | master-object-matrix summarizes; points to index |
| Comment sources | 03-loan-communications/comment-source-matrix.md | master-comment-matrix extracts |
| Comments vs notes | 03-loan-communications/comments-vs-notes-vs-conversations.md | communication-map + comment-map link |
| Domain glossary | 01-domain/domain-glossary.md | mortgage-glossary indexes, no full duplicate |
| Event taxonomy | 03-loan-communications/timeline-data-model.md | master-event-matrix + event-map |
| 20 integration Q&A | 03-loan-communications/README.md | developer-faq + architect-faq distill |
| Relationship diagrams | 01-domain/domain-relationships.md | relationship-map links only |

**Rule:** Phase 6 maps are **indexes**; deep content stays in Phases 1–5.

---

## Contradictions reviewed

| Topic | Finding | Resolution |
|-------|---------|------------|
| Notes vs conversation logs | Some readers conflate | Explicitly separated in Phase 3 + Phase 6 communication-map |
| Milestone comments vs history | Milestone GET vs History Log | Documented: string overwrites vs append-only system log — consistent across phases |
| document status field | status vs documentStatus | Consistent: deprecated vs current — VERSION_DEPENDENT |
| Workflow Task vs milestone task | Naming collision | Consistently distinguished in 01-domain/tasks.md |
| Rate lock vs exclusive lock | Different mechanisms | field-changes.md + loan-history.md — no contradiction found |
| V1 vs V3 path casing (conversationLogs) | Both documented | production-gotchas.md flags casing — intentional dual paths |

**No unresolved factual contradictions** found between phases after Phase 3 explicit Q&A.

---

## Unsupported assumptions flagged

| Statement | Verdict |
|-----------|---------|
| `GET /loans/{id}/notes` | **Rejected** — documented as non-existent |
| Single timeline API in Encompass | **Rejected** |
| Conversation log dedicated webhook | Marked **NOT_ESTABLISHED** unless ICE adds to catalog |
| All loans use Enhanced Conditions | **Rejected** — indicator flag required |
| Webhook payload is authoritative state | **Rejected** — GET required per official guidance |

---

## Missing relationships (addressed)

| Gap | Addressed in |
|-----|--------------|
| Task → Condition URN associations | relationship-map, task-map |
| Document Order → Disclosure → eFolder | document-map, integration-map |
| Comment → Timeline event fan-out | event-map, timeline-service |
| Configuration → lifecycle labels | configuration-map, lifecycle-map |
| Permission → empty GET symptoms | permission-map, troubleshooting |

---

## Missing API references (addressed)

Phase 2 covers major APIs. Remaining thin areas:

- Standard condition field-level OpenAPI (partial)
- Document delivery full request schema (partial)
- Some borrower contact note operations beyond create

Linked in master-object-matrix **Notes** column.

---

## Potential stale information

| Item | Risk | Mitigation |
|------|------|------------|
| 250KB webhook payload limit | Release notes change | Re-check ICE changelog quarterly |
| Beta disclosureTracking webhook | May GA or change | Monitor release notes |
| DDA limited availability | Product gating | Confirm with CSM |
| alertchange Limited | Availability | Confirm subscription catalog |
| Sunset dates 26.1 / 26.3 | Future releases | [api-version-matrix.md](../02-apis/api-version-matrix.md) |

**Last verified date:** 2026-08-13 — set calendar reminder for quarterly doc refresh.

---

## Recommended future research

1. Pull **OpenAPI JSON** from Developer Connect for Standard Condition and Document Delivery — fill NOT_ESTABLISHED field tables.
2. Confirm **Conversation Log** webhook status in latest webhook resource catalog.
3. Validate **borrower contact notes** CRUD pages beyond create.
4. Document **Milestone Task** (Encompass native) API surface if exposed in Developer Connect — currently distinguished from Workflow Task in domain only.
5. Map **Consumer Connect** events beyond `submit` if dashboard needs borrower portal timeline.
6. ICE **changelog** automation — diff API-INDEX quarterly.
7. Add **RAG embedding metadata** (phase, classification tags) when implementing vector index.

---

## Repository search checklist

| Check | Result |
|-------|--------|
| Invented endpoint `GET /loans/.../notes` | **None found** (only documented as non-existent) |
| Invented webhook event types presented as official | **None** — normalized types labeled INTERNAL |
| Invented field names on API contracts | **None critical**; derived fields labeled in Phase 5 |
| Unsupported global comments API | Consistently marked NOT_ESTABLISHED |
| Version mismatch document status | **Resolved** — documentStatus preferred |
| Duplicate definition without cross-link | **Reduced** in Phase 6 |
| Contradictory statement | **None unresolved** |

---

## Certification

This knowledge base is intended for:

- Developer onboarding ✓  
- Product management ✓  
- Architecture discussions ✓  
- API development ✓  
- Troubleshooting ✓  
- Loan operations ✓  
- Dashboard development ✓  
- AI assistant / RAG ✓ (with classification tags enforced)  
- Incident investigation ✓  
- Production support ✓  

**Caveat:** Always verify **VERSION_DEPENDENT** and **NOT_ESTABLISHED** items against live Developer Connect before production deployment.

---

## Related documents

- [ENCOMPASS_MASTER_KNOWLEDGE_BASE.md](../ENCOMPASS_MASTER_KNOWLEDGE_BASE.md)
- [06-ai-knowledge/README.md](./README.md)
