# Task Pipeline API

`GET /workflow/v1/taskPipeline`

Purpose: incomplete tasks for **current user or user groups** (work queue), not the manager’s all-HLA loan grid.

Pagination: offset (`start`/`limit`) or page (`page`/`size`). `sortBy` e.g. `+rank,-priority`.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/get-task-pipeline](https://developer.icemortgagetechnology.com/developer-connect/reference/get-task-pipeline)

**INTERNAL ARCHITECTURE RECOMMENDATION:** HLA loan grid uses Loan Pipeline; task badges use Get All Tasks filtered by loan or webhook-maintained counts.
