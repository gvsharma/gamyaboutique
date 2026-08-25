# Encompass Developer Connect Knowledge Base

**Audience:** Senior Java / AWS engineers building a Lending Manager dashboard.  
**System of record:** ICE Mortgage Technology Encompass.  
**This tree:** engineering knowledge base, not a substitute for live OpenAPI.

Research date: **2026-08-25**. Official portal: [Encompass Developer Connect](https://developer.icemortgagetechnology.com/developer-connect/docs/welcome).

## How to read this tree

Every important fact is followed by a **Source** URL.

Labels used throughout:

| Label | Meaning |
| ----- | ------- |
| **Source** | Confirmed in current official ICE Developer Connect docs (or ICE-linked changelog/guide). |
| **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION** | Official pages searched; fact not published. Do not invent. |
| **LENDER CONFIGURABLE** | Depends on the Encompass instance (roles, personas, RDB fields, folders, templates). |
| **VERSION DEPENDENT** | Behavior changed or exists only from a named Encompass / Developer Connect release. |
| **INTERNAL ARCHITECTURE RECOMMENDATION** | Our dashboard design, not ICE behavior. |

Start here:

1. [RESEARCH_SUMMARY.md](../RESEARCH_SUMMARY.md) — answers the 16 product questions.
2. [api-decision-guide.md](../12-reference/api-decision-guide.md) — “which API for X?”
3. [loan-pipeline-v3.md](../02-loan/loan-pipeline-v3.md) — HLA list of 50–100 loans.
4. [dashboard-architecture.md](../11-dashboard/dashboard-architecture.md) — Redis projection, webhooks, reconciliation.
5. [unknowns.md](../13-research/unknowns.md) — gaps that must be closed against *your* instance.

## Product context

A Lending Manager oversees multiple Home Lending Advisors (HLAs). Each HLA typically owns **50–100 loans**. The dashboard must show current-state pipeline metrics in about **2 seconds**. Encompass remains the system of record. Redis is a **read-optimized current-state projection**, not a historical store.

HLA is **lender language**. Encompass’s documented **fixed role** for this person is **Loan Officer**. Custom roles can be mapped to that fixed role. **LENDER CONFIGURABLE**.

Source: [V1 Get List of Associates](https://developer.icemortgagetechnology.com/developer-connect/reference/get-associates).

## Directory map

| Folder | Contents |
| ------ | -------- |
| [01-platform](../01-platform/) | What Encompass is, V1 vs V3, API families |
| [02-loan](../02-loan/) | Pipeline, loan CRUD, schema, folders |
| [03-workflow](../03-workflow/) | Associates, milestones, tasks |
| [04-conditions](../04-conditions/) | Standard vs enhanced conditions |
| [05-documents](../05-documents/) | eFolder, attachments, orders, delivery, disclosures |
| [06-communications](../06-communications/) | Conversation logs, comments, system logs |
| [07-people](../07-people/) | Users, orgs, personas, roles, contacts |
| [08-events](../08-events/) | Webhooks and event processing |
| [09-settings](../09-settings/) | Settings, templates, pipeline views, reference data |
| [10-integration](../10-integration/) | Auth, pagination, errors, concurrency, reconciliation |
| [11-dashboard](../11-dashboard/) | Architecture, cache, metrics |
| [12-reference](../12-reference/) | Matrices, glossary, decision guide, API graph |
| [13-research](../13-research/) | Unknowns, deprecations, version diffs, doc gaps |

## Official hosts

| Environment | Base URL | Source |
| ----------- | -------- | ------ |
| Production | `https://api.elliemae.com` | Every reference `servers` block, e.g. [V3 Loan Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline-with-pagination-1) |
| UAT | `https://concept.api.elliemae.com` | Same |
| OAuth authorize | `https://idp.elliemae.com/authorize` | [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) |
| Token | `https://api.elliemae.com/oauth2/v1/token` | Same |

## What this knowledge base is not

- It is **not** a live OpenAPI dump of your lender instance.
- It does **not** invent a Loan Officer canonical field name. That string must be discovered with Get Canonical Names against your RDB. See [canonical-fields.md](../02-loan/canonical-fields.md).
- It is **not** permission to call production Encompass from this repo. The files live here so the team has a durable, sourced inventory.
