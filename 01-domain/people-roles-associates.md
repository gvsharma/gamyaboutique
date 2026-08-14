# People, Roles, and Associates

## Overview

Mortgage origination is a **multi-party process**. Encompass models people through users, personas, roles, groups, and per-loan **loan associate** assignments.

```
Organization
 └── Users (internal / external)
      ├── Personas (capability profiles)
      ├── Roles (loan team functions)
      └── User Groups
           └── Loan Associates (per-loan role assignment)
```

---

## User

### Internal users

**Internal users** are employees who access Encompass. The V3 Internal Users API provides:

- User profile and summary
- Personas and groups
- Compensation plans, licenses, permissions

Endpoint family: `/encompass/v3/users`

Access restrictions (from official docs):

- Administrators or users with Settings "Organizations/User" persona can retrieve accounts
- Callers can only access users within their organization or child organizations
- Alias `me` retrieves the calling user's profile

### External users

**External users** (TPO partners, brokers) are managed via `/encompass/v3/externalUsers` with filters for organization, persona, designated role, etc.

---

## Persona

A **persona** defines a user's **technical capabilities** in Encompass — what screens, settings, and actions are available.

Examples from official documentation:

- Super Administrator
- Administrator
- Settings "Organizations/User" persona (required for user management APIs)

**LENDER CONFIGURABLE:** Persona definitions and permissions are configured per lender.

A persona is **not** the same as a loan role. Persona = platform access; Role = loan team function.

---

## Role

A **role** represents a function on the loan team:

| Typical role | Function |
|--------------|----------|
| Loan Officer | Origination, borrower relationship |
| Processor | Document collection, file preparation |
| Underwriter | Credit decision |
| Closer | Closing coordination |

Roles are defined in settings: `GET /encompass/v3/settings/roles`

Roles can be associated with:

- **Milestone roles** — tied to a specific milestone
- **Milestone-free roles** — not tied to any milestone

The milestone ↔ role association is **LENDER CONFIGURABLE**.

---

## User Group

**User groups** collect users for assignment purposes. A milestone loan associate may be assigned to a **group** rather than an individual user.

From milestone API examples:

```json
"loanAssociate": {
  "loanAssociateType": "Group",
  "user": {
    "entityId": "3",
    "entityName": "Underwriting",
    "entityType": "UserGroup"
  }
}
```

---

## Loan Associate

A **loan associate** is a user (or group) assigned to a **role on a specific loan**.

Official documentation states:

> Users are assigned to roles on a loan-by-loan basis. A user who is in the loan officer role for one loan may be in the loan processor role for another. Additionally, a user can be assigned to multiple roles within the same loan file.

Whenever a user is assigned to a role within a loan, that user is a **loan associate**.

### LoanAssociateV3Contract attributes

| Attribute | Description |
|-----------|-------------|
| `loanAssociateType` | Required. `User` or `Group` |
| `user` | Required. EntityReference to User or UserGroup |
| `role` | RetrieveOnly. Associated role |
| `writeAccess` | Whether associate has write access on milestone/role |
| `cellPhone`, `email`, `fax`, `phone` | Contact overrides (defaults from user profile) |

Assignment occurs via Milestone APIs:

```
PATCH /encompass/v3/loans/{loanId}/milestones/{milestoneId}
```

---

## John Smith loan team

| Person | Role | Assignment mechanism |
|--------|------|---------------------|
| Mike | Loan Officer | Milestone associate on Started/Qualification |
| Sarah | Processor | Milestone associate on Processing |
| Robert | Underwriter | Milestone associate on Cond. Approval |
| Lisa | Closing Coordinator | Milestone associate on Doc Preparation |

---

## Business Contact vs Borrower

| Entity | Scope | Purpose |
|--------|-------|---------|
| **Borrower** | Application on loan | Loan applicant |
| **Business Contact** | Loan or global contacts | Title, escrow, appraiser, etc. |
| **Borrower Contact** | CRM | Marketing/prospect contacts with notes API |
| **Service Provider** | Network integrations | Vendors delivering attachments/services |

---

## Segregation of duties — critical distinction

Do **not** assume one person can perform every mortgage role. Three layers govern what someone can do:

| Layer | Governs | Example |
|-------|---------|---------|
| **Technical capability (Persona)** | What Encompass allows the user to access | Underwriter persona can access UW screens |
| **Bank policy** | What the lender permits organizationally | LO cannot also underwrite same file |
| **Segregation of duties** | Compliance/regulatory separation | Dual role assignment may be blocked by policy |

Official documentation confirms a user **can** hold multiple roles on the same loan file at the technical level. Whether that is **allowed by lender policy** is **LENDER CONFIGURABLE** and may be prohibited by compliance rules.

---

## Organizations

Encompass models company hierarchy via **Organizations**:

- Root organization and child branches
- Users belong to organizations
- Internal user queries filter by `orgId` and `isRecursive`

External organizations (TPO) have separate external user and organization models.

---

## Workflow task assignees

Workflow tasks (separate from milestone associates) use assignee entity references:

```json
{
  "entityType": "urn:elli:encompass:user",
  "entityId": "jsmith"
}
```

Task assignees can also be roles or external URNs. See [tasks.md](./tasks.md).

---

## References

- [Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- [V3 Internal Users](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-internal-users)
- [V3 Get List of Roles](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-get-list-of-roles)
- [V3 Update Milestone Log](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-update-milestone-log)
