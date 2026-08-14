# 17 — API Reference Cheatsheet

> **Authority:** Documented endpoints in [Encompass Developer Connect API Reference](https://developer.icemortgagetechnology.com/developer-connect/reference/browse-apis) only.  
> **Production base URL:** `https://api.elliemae.com` · **UAT:** `https://concept.api.elliemae.com`  
> **Auth:** `Authorization: Bearer {access_token}` on all calls unless noted.

Do not treat this cheatsheet as exhaustive — browse the official reference for schemas, query parameters, and release updates ([Release Notes](https://developer.icemortgagetechnology.com/developer-connect/docs/release-notes)).

---

## Authentication (OAuth 2.0)

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| Token issuance | `POST /oauth2/v1/token` | v1 | [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) |
| Token introspection | `POST /oauth2/v1/token/introspection` | v1 | [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) |
| Token revocation | `POST /oauth2/v1/token/revocation` | v1 | [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) |
| Authorize (browser) | `GET https://idp.elliemae.com/authorize` | — | [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) |

**API key setup:** [Get an API Key](https://developer.icemortgagetechnology.com/developer-connect/docs/get-an-api-key)

---

## Webhooks

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| List resources | `GET /webhook/v1/resources` | v1 | [Resources](https://developer.icemortgagetechnology.com/developer-connect/reference/resources) |
| Resource events | `GET /webhook/v1/resources/{id}/events` | v1 | [Resources](https://developer.icemortgagetechnology.com/developer-connect/reference/resources) |
| Create subscription | `POST /webhook/v1/subscriptions` | v1 | [Create a Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-subscription) |
| Update subscription | `PATCH /webhook/v1/subscriptions/{subscriptionId}` | v1 | [Update Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/update-subscription) |
| Get subscription | `GET /webhook/v1/subscriptions/{subscriptionId}` | v1 | [Get a Subscription](https://developer.icemortgagetechnology.com/developer-connect/reference/get-a-subscription) |
| List subscriptions | `GET /webhook/v1/subscriptions` | v1 | [Subscriptions](https://developer.icemortgagetechnology.com/developer-connect/reference/subscriptions) |
| List delivered events | `GET /webhook/v1/events` | v1 | [Webhook Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) |
| Get event | `GET /webhook/v1/events/{id}` | v1 | [Webhook Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook) |

**Webhook catalog:** [Supported Resources and Events](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)

---

## Loan management

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| Create loan | `POST /encompass/v3/loans` | **V3** | [Create Loan](https://developer.icemortgagetechnology.com/developer-connect/reference/create-loan-1) |
| Get loan | `GET /encompass/v3/loans/{loanId}` | **V3** | [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Update loan | `PATCH /encompass/v3/loans/{loanId}` | **V3** | [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Delete loan | `DELETE /encompass/v3/loans/{loanId}` | **V3** | [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Get loan schema | `GET /encompass/v3/loans/loanSchema` | **V3** | [V3 Loan Schema](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1) |
| UCD fields | `GET /encompass/v3/loans/{loanId}/ucdFields` | **V3** | [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Field Reader | `POST /encompass/v3/loans/{loanId}/fieldReader` | **V3** | [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Field Writer | `POST /encompass/v3/loans/{loanId}/fieldWriter` | **V3** | [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |
| Move to folder | `PATCH /encompass/v1/loans/{loanId}/moveToFolder` | **V1** | [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management) |

**Views:** `view=entity|log|full|id` on create/update/get — [Loan Management](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-management)

---

## Loan pipeline

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| Pipeline search | `POST /encompass/v1/loanPipeline` | **V1** | [View Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/view-pipeline) |
| Canonical fields | `GET /encompass/v1/loanPipeline/canonicalFields` | **V1** | [V1 Get Canonical Fields](https://developer.icemortgagetechnology.com/developer-connect/reference/v1-get-canonical-fields) |

**Note:** Pipeline data from Reporting Database — async refresh ([Loan Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-pipeline)).

---

## Resource locks

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| List locks | `GET /encompass/v3/resourceLocks` | **V3** | [Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1) |
| Get lock | `GET /encompass/v3/resourceLocks/{lockId}` | **V3** | [Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1) |
| Create lock | `POST /encompass/v3/resourceLocks` | **V3** | [Lock Resource](https://developer.icemortgagetechnology.com/developer-connect/reference/lock-resource-1) |
| Delete lock | `DELETE /encompass/v3/resourceLocks/{lockId}` | **V3** | [Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1) |

**lockType:** `exclusive` | `NGSharedLock` ([Loan Resource Lock](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-lock-1))

---

## Enhanced conditions

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| List conditions | `GET /encompass/v3/loans/{loanId}/conditions` | **V3** | [Get All Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions) |
| Get condition | `GET /encompass/v3/loans/{loanId}/conditions/{conditionId}` | **V3** | [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions) |
| Create condition | `POST /encompass/v3/loans/{loanId}/conditions` | **V3** | [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions) |
| Update condition | `PATCH /encompass/v3/loans/{loanId}/conditions/{conditionId}` | **V3** | [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions) |
| Delete condition | `DELETE /encompass/v3/loans/{loanId}/conditions/{conditionId}` | **V3** | [Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions) |

**Views:** `view=Summary|Detail|Full` · **Indicator:** `loan.useEnhancedConditionIndicator` ([Enhanced Conditions](https://developer.icemortgagetechnology.com/developer-connect/reference/enhanced-conditions))

---

## eFolder — documents and attachments

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| Manage documents (overview) | `/encompass/v3/loans/{loanId}/documents` … | **V3** | [Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1) |
| Attachments (overview) | `/encompass/v3/loans/{loanId}/attachments` … | **V3** | [eFolder APIs](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1) |

V1 equivalents documented alongside V3 — [Manage Documents](https://developer.icemortgagetechnology.com/developer-connect/reference/efolder-document-1).

---

## Workflow tasks (`workflow/v1`)

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| Create task | `POST /workflow/v1/tasks` | workflow/v1 | [Create a Task](https://developer.icemortgagetechnology.com/developer-connect/reference/create-a-task) |
| List tasks | `GET /workflow/v1/tasks` | workflow/v1 | [Get Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks) |
| Task pipeline | `GET /workflow/v1/taskPipeline` | workflow/v1 | [Get Task Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/get-task-pipeline) |
| Task configuration | `/workflow/v1/settings/task` … | workflow/v1 | [Task Configuration](https://developer.icemortgagetechnology.com/developer-connect/reference/task-configuration) |
| Subtasks | `/workflow/v1/tasks/{taskId}/subtasks` … | workflow/v1 | [Manage Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-tasks) |

Overview: [Workflow Task Service](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-copy)

---

## Document order (disclosures)

Document ordering is asynchronous — pair with `DocumentOrder` webhooks ([Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages)).

| Area | Path prefix | Reference |
|------|-------------|-----------|
| Document order APIs | `encompassdocs/v1/...` | [Ordering Document Packages](https://developer.icemortgagetechnology.com/developer-connect/docs/ordering-document-packages) |
| Webhook events | `DocumentOrder` resource | [Document Order webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-order) |

---

## Document delivery (eDelivery)

| Area | Path prefix | Reference |
|------|-------------|-----------|
| Packages | `/delivery/v3/loans/{loanId}/packages/...` | [Document Delivery webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery) |
| Webhook resourceType | `DocumentDelivery` | [Document Delivery](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-doc-delivery) |

---

## Users and organizations

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| Internal users | `/encompass/v3/users` … | **V3** | [Orgs/Users webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users) |
| External users | `/encompass/v3/externalUsers` … | **V3** | [Orgs/Users webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users) |
| User groups | `/encompass/v3/groups` … | **V3** | [Orgs/Users webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users) |

SCIM and persona APIs — browse [API Catalog](https://developer.icemortgagetechnology.com/developer-connect/reference/browse-apis).

---

## EPC service orders

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| Service order history | `/encompass/v3/loans/{loanId}/serviceOrders/{serviceOrderId}/history/...` | **V3** | [EPC webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-partner-connect) |

Orders must be placed via Encompass Partner Connect for webhooks to fire.

---

## Schedulers (timers)

| Method | Endpoint | Version | Reference |
|--------|----------|---------|-----------|
| Timer resource | `v1/timers/{id}` (in webhook `resourceRef`) | v1 | [Schedulers](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-schedulers) |

Webhook `resourceType`: `Timer` · Events: `created`, `completed`, `changed`, `cancelled`

---

## Trades

Trade management APIs — browse API catalog under correspondent/trades. Webhook events: [Trades](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-trades).

---

## DDA (limited availability)

DDA Platform Webhook API — not standard lender subscription path. [DDA webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-dda).

---

## Version tag summary

| Tag | Meaning | Examples |
|-----|---------|----------|
| **V3** | Current loan/eFolder/conditions path | `/encompass/v3/loans/...` |
| **V1** | Legacy/stable for some operations | Pipeline, `moveToFolder`, some locks |
| **workflow/v1** | Workflow Task Service | `/workflow/v1/tasks` |
| **webhook/v1** | Subscriptions and event history | `/webhook/v1/subscriptions` |
| **delivery/v3** | Document delivery packages | `/delivery/v3/loans/.../packages` |
| **encompassdocs/v1** | Document order workflows | Disclosure ordering |

---

## Official documentation index

| Resource | URL |
|----------|-----|
| Developer Connect home | https://developer.icemortgagetechnology.com/developer-connect/docs/welcome |
| API reference catalog | https://developer.icemortgagetechnology.com/developer-connect/reference/browse-apis |
| Authentication | https://developer.icemortgagetechnology.com/developer-connect/docs/authentication |
| Webhook overview | https://developer.icemortgagetechnology.com/developer-connect/reference/webhook |
| SDK to API migration | https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide |
| Release notes | https://developer.icemortgagetechnology.com/developer-connect/docs/release-notes |
| Partner Connect (EPC partners) | https://docs.partnerconnect.elliemae.com/partnerconnect/docs/webhooks |
