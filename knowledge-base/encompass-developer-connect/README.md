# Encompass Developer Connect Knowledge Base

This folder is a **domain seed** for a long-term Encompass Developer Connect knowledge base.

It is designed to be **downloaded, shared, and used as onboarding material** for architects, integration engineers, and product teams.

> Encompass is not merely a loan database. It is a configurable mortgage workflow and document platform centered around a loan.

## How to use these files

| Goal | What to do |
|------|------------|
| Share the whole KB | Zip this folder, or share the GitHub folder URL |
| Share one topic | Download that markdown file and send it on its own |
| Onboard an engineer | Start with this README, then [01](./01-purpose-and-core-model.md), [02](./02-four-key-definitions.md), and [17](./17-golden-rules.md) |
| Design an integration | Read [12](./12-events-and-webhooks.md), [13](./13-enhanced-field-change.md), [14](./14-production-architecture.md), [16](./16-normalized-communications-timeline.md) |
| Confirm API contracts | Always verify against [18](./18-official-documentation.md) and current ICE docs |

**Source of truth:** Official ICE Mortgage Technology Developer Connect documentation. These files are a domain model and integration seed. They must not replace current ICE docs.

**Do not invent** undocumented fields, event names, or status values. Illustrative examples in this KB are labeled as such.

## File index

| File | Topic |
|------|-------|
| [01-purpose-and-core-model.md](./01-purpose-and-core-model.md) | Purpose, core idea, and the loan-centered domain model |
| [02-four-key-definitions.md](./02-four-key-definitions.md) | Loan, Milestone, Workflow Task, Condition, Document, Attachment |
| [03-loans.md](./03-loans.md) | Loan data, V3 collections, views (`entity`, `log`, `full`, `id`) |
| [04-milestones.md](./04-milestones.md) | Lifecycle stages, SLA fields, customization |
| [05-workflow-tasks.md](./05-workflow-tasks.md) | Task templates, instances, subtasks, assignment |
| [06-conditions.md](./06-conditions.md) | Standard vs Enhanced Conditions, lifecycle, tracking vs comments |
| [07-documents-and-attachments.md](./07-documents-and-attachments.md) | eFolder documents vs attachments; many-to-many with conditions |
| [08-document-order-and-delivery.md](./08-document-order-and-delivery.md) | Package generation, async delivery |
| [09-disclosure-tracking.md](./09-disclosure-tracking.md) | Compliance disclosure history vs document delivery |
| [10-associates-and-roles.md](./10-associates-and-roles.md) | Users, personas, roles, groups, loan associates |
| [11-conversation-logs-comments-notes.md](./11-conversation-logs-comments-notes.md) | Conversation Logs vs comments vs notes vs system logs |
| [12-events-and-webhooks.md](./12-events-and-webhooks.md) | Webhook catalog, subscription model, integration rules |
| [13-enhanced-field-change.md](./13-enhanced-field-change.md) | EFC / field-change events, PII, idempotency |
| [14-production-architecture.md](./14-production-architecture.md) | Recommended bank integration architecture |
| [15-loan-timeline.md](./15-loan-timeline.md) | Illustrative loan lifecycle timeline |
| [16-normalized-communications-timeline.md](./16-normalized-communications-timeline.md) | Aggregating notes, comments, and communications |
| [17-golden-rules.md](./17-golden-rules.md) | Non-negotiable integration rules |
| [18-official-documentation.md](./18-official-documentation.md) | ICE Developer Connect areas to keep linked |

## Core distinction (memorize this)

```text
Milestone = Where is the loan in the lifecycle?
Task      = What work needs to be done?
Condition = What requirement must be satisfied?
Document  = What evidence/information exists?
Attachment= What actual electronic file is attached?
```

## Download and share

1. Clone or browse this repository folder: `knowledge-base/encompass-developer-connect/`
2. Download individual `.md` files from GitHub (Raw → Save As), or zip the folder.
3. Share a single topic file, or share the whole folder as a zip.

Suggested zip command:

```bash
cd knowledge-base
zip -r encompass-developer-connect-kb.zip encompass-developer-connect
```

## Portal and API hosts (verify in current ICE docs)

| Environment | Host |
|-------------|------|
| Developer portal | [https://developer.icemortgagetechnology.com/developer-connect](https://developer.icemortgagetechnology.com/developer-connect) |
| Production API | `https://api.elliemae.com` |
| UAT API | `https://concept.api.elliemae.com` |

Hosts, paths, and contracts change. Confirm against current ICE documentation before implementation.
