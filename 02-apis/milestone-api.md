# Milestone & Associates API

## Business Purpose

Retrieve and update loan milestone workflow state; assign loan associates to milestone roles; access milestone settings and milestone-free roles.

## Mortgage Use Case

Sarah completes Processing — `PATCH /encompass/v3/loans/{loanId}/milestones/{milestoneId}` with `{"doneIndicator": true}`. Robert assigned as Underwriter on Cond. Approval milestone.

## Official Documentation

- [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- [V3 Get Milestone Logs List](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-milestone-logs-list)
- [V3 Get Milestone Log](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-milestone-log)
- [V3 Update Milestone Log](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-update-milestone-log)
- [Settings Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-milestones)

## API Version

**V3** (milestones) | **V1** (associates, legacy milestones)

## Endpoints

### V3 Milestones

| Operation | Method | Path |
|-----------|--------|------|
| List milestones | GET | `/encompass/v3/loans/{loanId}/milestones` |
| Batch update dates | PATCH | `/encompass/v3/loans/{loanId}/milestones` |
| Get milestone | GET | `/encompass/v3/loans/{loanId}/milestones/{milestoneId}` |
| Update milestone | PATCH | `/encompass/v3/loans/{loanId}/milestones/{milestoneId}` |
| Milestone-free roles | GET/PATCH | `/encompass/v3/loans/{loanId}/milestoneFreeRoles` |

### V1 Associates & Milestones

| Operation | Method | Path |
|-----------|--------|------|
| List associates | GET | `/encompass/v1/loans/{id}/associates` |
| Get/Update associate | GET/PUT | `/encompass/v1/loans/{id}/associates/{logId}` |
| V1 milestones | GET/PATCH | `/encompass/v1/loans/{id}/milestones[/{logId}]` |

### Settings

| Operation | Method | Path |
|-----------|--------|------|
| List milestone settings | GET | `/encompass/v3/settings/milestones` |
| Get setting | GET | `/encompass/v3/settings/milestones/{milestoneId}` |

## Authentication

Bearer OAuth2 token.

## V3 Update Milestone Log

### Path Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `loanId` | Yes | Loan GUID |
| `milestoneId` | Yes | Milestone instance ID |

### Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `lockId` | No | Loan lock ID |
| `changePrimaryLoanTeamMember` | No | Allow changing primary loan team member |
| `view` | No | `entity` or `id`; default 204 no body |

### Request — Finish Milestone (Official Example)

```json
{
  "doneIndicator": true
}
```

### Request — Assign Associate (Official Example)

```json
{
  "startDate": "2024-03-28T10:51:00Z",
  "loanAssociate": {
    "loanAssociateType": "User",
    "user": {
      "entityId": "admin",
      "entityType": "User"
    }
  }
}
```

## Field Reference (MilestonesLogV3attributes)

| Field | Type | Required | Read/Write | Meaning | Mortgage Significance | Configurable? | Example |
|-------|------|----------|------------|---------|----------------------|---------------|---------|
| `id` | string | — | Read | Milestone instance ID | Webhook correlation | No | GUID |
| `name` | string | — | Read | Milestone name | Pipeline stage label | **LENDER CONFIGURABLE** | "Cond. Approval" |
| `startDate` | datetime | — | Write | Milestone start | SLA start | No | ISO 8601 |
| `days` | integer | — | Read | Expected days | SLA target | **LENDER CONFIGURABLE** | 4 |
| `duration` | integer | — | Read | Actual elapsed days | Performance metric | No | -1 |
| `doneIndicator` | boolean | — | Write | Completed flag | Stage completion | No | `true` |
| `reviewedIndicator` | boolean | — | Write | Review complete | QC gate | No | `false` |
| `comments` | string | — | Write | Milestone comments | Team notes | No | "Processing complete." |
| `roleRequired` | string | — | Read | Assignment required | Workflow rule | **LENDER CONFIGURABLE** | "N" |
| `loanAssociate` | object | — | Write | Assigned user/group | Ownership | — | See below |
| `milestoneSetting` | EntityRef | — | Read | Setting reference | Template link | **LENDER CONFIGURABLE** | entityId |

### loanAssociate (LoanAssociateV3Contract)

| Field | Type | Required | Read/Write | Meaning |
|-------|------|----------|------------|---------|
| `loanAssociateType` | string | Yes | Write | `User` or `Group` |
| `user` | EntityRef | Yes | Write | User or UserGroup ref |
| `writeAccess` | boolean | — | Read | Write permission on role |
| `role` | EntityRef | — | Read | Associated role |

## Relationships

- Milestone log → MilestoneSetting (system config)
- Milestone log → LoanAssociate → User/Role
- Milestone History Log (system log on loan, read via Get Loan `view=logs`)

## Lifecycle

Milestone activated (`startDate`) → work performed → `doneIndicator: true` → next milestone

## Errors

Documented on Update: `400`, `401`, `403`, `404`, `500`; `204` when no view param

## Pagination

None — full milestone list per loan.

## Webhooks

Loan resource `milestone` event:

- `updateMilestones` — id, title
- `finishMilestones` — completion

## Permissions

Persona and milestone template rules govern who may finish milestones — **LENDER CONFIGURABLE**.

## Locking

`lockId` query parameter supported on update.

## Version Dependencies

Settings milestones API added in **25.1** release (per reference page note).

## Configuration Dependencies

13 default milestone names/order — **LENDER CONFIGURABLE**; custom milestones and templates supported.

## Production Considerations

- Compare `duration` vs `days` for SLA dashboards
- Milestone webhook is API-triggered; Smart Client may also trigger under enhancedfieldchange/TBW/DDA

## Common Developer Mistakes

- Confusing milestone log `id` with milestoneSetting `entityId`
- Using V1 paths when V3 available
- Expecting milestone history from milestone GET (use system log)

## Real Loan Example

Robert on Cond. Approval: GET milestones → find milestone where `name` = "Cond. Approval" → PATCH with underwriter assignment.

## Java Example

```java
String body = "{\"doneIndicator\": true}";
HttpRequest patch = HttpRequest.newBuilder()
    .uri(URI.create("https://api.elliemae.com/encompass/v3/loans/" + loanId
        + "/milestones/" + milestoneId + "?view=entity"))
    .header("Authorization", "Bearer " + token)
    .header("Content-Type", "application/json")
    .method("PATCH", HttpRequest.BodyPublishers.ofString(body))
    .build();
```

## cURL Example

```bash
curl -s -X PATCH "https://api.elliemae.com/encompass/v3/loans/${LOAN_ID}/milestones/${MILESTONE_ID}?view=entity" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"doneIndicator": true}'
```

## Questions an Architect Should Ask

- V3 or V1 for associates — which is canonical for our integration?
- Do we drive SLA metrics from milestone GET or webhook + cache?
- How do milestone-free roles appear in our dashboard?
