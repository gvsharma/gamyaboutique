# Pagination patterns

1. **start/limit** — Pipeline V3, many list APIs. V3 Pipeline max 1000/page; server may shrink limit.
2. **Cursor** — Pipeline V1 create cursor; reports cursorId; contacts selectors. Idle 5 min; V1 12 h max; reports 1 h max; 10 cursors; 409 on overflow (24.3).
3. **Offset vs page** — Workflow tasks (`start/limit` or `page/size`).
4. **6 MB payload** — resubmit with smaller start/limit; optional gzip Accept-Encoding (25.2).

Best practices: calculateTotalCount=NoWait; small first page; cache; avoid sort.
