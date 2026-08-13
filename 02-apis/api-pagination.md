# Encompass Developer Connect — Pagination, Filtering, and Sorting

## Business Purpose

List APIs use offset, page, or cursor patterns depending on API family. Pipeline and task APIs support rich filtering.

## Official Documentation

- [Get Task Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/get-task-pipeline)
- [Get All Tasks](https://developer.icemortgagetechnology.com/developer-connect/reference/get-tasks)
- [V3 Get List Internal Users](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-list-internal-users)
- [Loan Pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-pipeline)

## Pagination Patterns

### Offset-based

Used by Workflow Tasks and Internal Users:

| Parameter | Description |
|-----------|-------------|
| `start` | Zero-based start index |
| `limit` | Max records (Internal Users: default 100, max 1000) |

Example (official): `GET /workflow/v1/tasks?start=0&limit=20`

### Page-based

| Parameter | Description |
|-----------|-------------|
| `page` | Zero-based page index |
| `size` | Page size |

Example (official): `GET /workflow/v1/taskPipeline?page=0&size=20`

### Cursor-based (Loan Pipeline)

| Parameter | Description |
|-----------|-------------|
| `cursor` | Cursor token |
| `start`, `limit` | Alternative pagination |
| `cursorType` | e.g. `randomAccess` (V1) |

## Filtering

### Workflow Tasks

Documented query params on Get All Tasks include: `assignee`, `assigneeEntityId`, `assigneeEntityType`, `statusIn`, `priority`, `dueDate`, `templateIds`, `tags`, `associationEntityId`, `associationEntityType`.

### Internal Users

| Parameter | Description |
|-----------|-------------|
| `orgId` | Organization folder (use `0` + `isRecursive=true` for all) |
| `isRecursive` | Include child orgs |
| `filter` | Filter object per API docs |
| `entities` | Limit returned entity sections |

### External Users

Documented: `filter`, `sort`, `entities` query parameters.

### Trade Pipeline

| Parameter | Description |
|-----------|-------------|
| `type` | Required: `correspondentTrade` or `loanTrade` |
| `view` | `None`, `Current`, `Archived`, `Voided` |
| Request body | `TradePipelineQueryContract` with `filter`, `sortOrder[]`, `fields[]` |

### Enhanced Conditions

| Parameter | Description |
|-----------|-------------|
| `conditionType` | Filter by type |
| `includeRemoved` | Include removed conditions |

### Webhook Subscriptions

| Parameter | Description |
|-----------|-------------|
| `filters.attributes[]` | Max **50** fields per subscription (change/fieldchange events) |

## Sorting

### Task Pipeline

Official: `sortBy` comma-separated fields with `+`/`-` prefix.

Example: `GET /workflow/v1/taskPipeline?sortBy=+rank,-priority`

### External Users

Documented `sort` parameter with field and `:desc` suffix.

## APIs Without Pagination

These return full scoped sets per resource:

- `GET /encompass/v3/loans/{loanId}/milestones` — all milestones for loan
- `GET /encompass/v3/loans/{loanId}/conditions` — all conditions (with optional type filter)
- `GET /encompass/v3/loans/{loanId}/documents` — all documents for loan

## Production Considerations

- Prefer pipeline APIs for dashboard list views over repeated full loan GETs
- Respect Internal Users `limit` max of 1000
- Webhook filter invalid attributes are **silently ignored** (no validation error)

## Common Developer Mistakes

- Using page params on offset-only endpoints (or vice versa)
- Exceeding 50 webhook filter attributes
- Expecting pagination on loan-scoped collection GETs

## Questions an Architect Should Ask

- Which list APIs drive our dashboard and what pagination pattern does each use?
- How do we handle full scans vs incremental sync for pipeline data?
