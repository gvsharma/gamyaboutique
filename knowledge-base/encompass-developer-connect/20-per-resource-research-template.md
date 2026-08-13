# 20 — Per-Resource Research Template

**Share this file when:** assigning someone to document one Encompass API/resource.

**Related:** [19 Research matrix](./19-api-research-matrix.md) · [research/TEMPLATE.md](./research/TEMPLATE.md)

---

## Purpose

For **each** resource in the matrix, document the items below from current official ICE Developer Connect material only.

Copy [research/TEMPLATE.md](./research/TEMPLATE.md) or use the domain worksheet already created under `research/`.

If official documentation does not answer a question:

> NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION

Do not guess.

## Required research for every domain

| # | Item | What to record | Official source URL | Verified value |
|---|------|----------------|---------------------|----------------|
| 1 | Official endpoint | Full path, including version prefix | | |
| 2 | HTTP method | GET / POST / PATCH / PUT / DELETE / etc. | | |
| 3 | Version | V1 / V3 / other, as documented | | |
| 4 | Authentication requirements | Token type, scopes, product access | | |
| 5 | Required headers | `Authorization`, `Content-Type`, others | | |
| 6 | Path parameters | Names, types, required/optional | | |
| 7 | Query parameters | Names, types, defaults | | |
| 8 | Request body | Contract name and required properties | | |
| 9 | Response body | Contract name and notable properties | | |
| 10 | Pagination | Style (`start`/`limit`, `page`/`size`, cursors) | | |
| 11 | Filtering | Query or body filters | | |
| 12 | Sorting | Supported sort fields/orders | | |
| 13 | Read-only fields | Retrieve-only attributes | | |
| 14 | Writable fields | Create/update attributes | | |
| 15 | IDs | Resource identifier field(s) | | |
| 16 | Relationship IDs | Loan id, template id, document id, etc. | | |
| 17 | Comments | Whether comments exist; endpoint | | |
| 18 | History / logs | Tracking, history, system logs | | |
| 19 | Soft deletion | Removed flag, include-removed params | | |
| 20 | Lock requirements | Loan lock id / lock policy | | |
| 21 | Webhook events | Resource + event/subevent names | | |
| 22 | Event payload | Notification schema / examples | | |
| 23 | Retry behavior | Documented retries, idempotency | | |
| 24 | Error responses | Status codes and error contract | | |
| 25 | Permission requirements | Personas, personas/roles, entitlements | | |
| 26 | Version / release dependencies | Encompass / Developer Connect release | | |
| 27 | Customer / license availability | Product licensing, enablement tickets | | |
| 28 | Configuration dependencies | Lender settings, templates, flags | | |

## Completeness rule

A worksheet is **not done** until every row is either:

- filled from a dated official URL, or
- marked `NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION`

Partial memory of a previous Encompass instance does **not** count.

## Multiple operations per resource

Many domains have several endpoints (list, get, create, update, delete, comments, assign). Duplicate the table **once per operation**, or add an operations list at the top of the worksheet and one table per operation.

Example operation list (replace with official names only after verification):

```text
- List
- Get by id
- Create / add
- Update / patch
- Delete / remove
- Comments
- Assign / unassign
```
