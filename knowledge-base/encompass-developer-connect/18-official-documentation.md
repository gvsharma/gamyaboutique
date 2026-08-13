# 18 — Official Documentation Areas

**Share this file when:** bookmarking ICE Developer Connect as the source of truth.

**Related:** [README](./README.md) · [17 Golden rules](./17-golden-rules.md)

---

Keep these areas linked in the knowledge base. URLs can move; if a link 404s, search the [Developer Connect portal](https://developer.icemortgagetechnology.com/developer-connect) for the same title.

**Always re-verify against current ICE documentation before implementation.**

## Portal and hosts

| Item | URL / value |
|------|-------------|
| Developer Connect | [https://developer.icemortgagetechnology.com/developer-connect](https://developer.icemortgagetechnology.com/developer-connect) |
| Changelog / release notes | [https://developer.icemortgagetechnology.com/developer-connect/changelog](https://developer.icemortgagetechnology.com/developer-connect/changelog) |
| Production API host | `https://api.elliemae.com` |
| UAT API host | `https://concept.api.elliemae.com` |

## Required topic areas

| Area | Starting link |
|------|----------------|
| Developer Connect Welcome / Getting Started | [Developer Connect home](https://developer.icemortgagetechnology.com/developer-connect) |
| Loan Management | [loan-management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Loan Conditions (standard) | Search portal for **Loan Conditions** — separate from Enhanced Conditions |
| Loan Enhanced Conditions | [loan-enhanced-conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-enhanced-conditions) |
| Workflow Tasks | [get-tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks) |
| Loan Associates & Milestones | [loan-associates-milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones) |
| eFolder Documents | [get-list-of-documents](https://developer.icemortgagetechnology.com/developer-connect/reference/get-list-of-documents) |
| eFolder Attachments | Search portal for current **Attachments** V3 APIs and V1 sunset notices |
| Document Order / Send Encompass Docs | [send-docs](https://developer.icemortgagetechnology.com/developer-connect/reference/send-docs) · [ordering-document-packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages) |
| Disclosure Tracking | [loan-disclosure-tracking-2015](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-disclosure-tracking-2015) |
| Conversation Logs | [create-conversation-log](https://developer.icemortgagetechnology.com/developer-connect/reference/create-conversation-log) — also search for retrieve-all V1/V3 |
| Webhook API | [webhook](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) |
| EPC | Search portal for **EPC** webhook/resource docs |
| DDA | Search portal for **DDA** / AIQ user schema docs |
| Schedulers | Search portal for **Schedulers** webhook/resource docs |
| Trades | Search portal for **Trades** / secondary marketing APIs |
| Organizations & Users | Search portal for **Organizations & Users** / SCIM |

## Additional high-value pages

| Page | Link |
|------|------|
| V3 Get Loan | [get-loan-1](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-1) |
| V3 Loan Schema | [get-loan-schema-1](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1) |
| Manage Enhanced Conditions | [manage-enhanced-conditions-1](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-enhanced-conditions-1) |
| Loan webhooks | [wbhks-re-cat-loan](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-loan) |
| Enhanced Conditions webhooks | [wbhks-re-cat-enhanced-conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-enhanced-conditions) |
| Subscriptions | [subscriptions](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions) |
| Webhook resources | [resources](https://developer.icemortgagetechnology.com/developer-connect/reference/resources) |
| Opening/closing doc workflows | [workflows-1](https://developer.icemortgagetechnology.com/developer-connect/docs/workflows-1) |

## How to keep this file honest

1. On each ICE release, check the [changelog](https://developer.icemortgagetechnology.com/developer-connect/changelog).
2. Re-walk the webhook Resources API; do not freeze a catalog in code.
3. Re-export or re-read the V3 loan schema; V1 ≠ V3.
4. Record lender-specific configuration (milestone templates, condition types/statuses) in a **separate** bank-specific doc — not as if it were ICE platform truth.
