# 12 — Organizations, Users, Roles, and Access

> **Official source:** [User Management](https://developer.icemortgagetechnology.com/developer-connect/docs/user-management) · [Roles](https://developer.icemortgagetechnology.com/developer-connect/reference/roles) · [Personas](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-personas) · [V1 Get All Organizations](https://developer.icemortgagetechnology.com/developer-connect/reference/get-all-organizations) · [SCIM Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-1) · [Orgs and Users Webhooks](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users)

---

## Core mental model

Encompass separates **who people are** (users, orgs) from **what they can do** (personas) from **what role they play on a loan** (loan roles → loan associates) from **who they are outside the lender** (contacts).

```
Company hierarchy          Access control              Loan file
───────────────           ──────────────              ─────────
Organizations/Branches  →  Personas (entitlements)  →  Roles (workflow)
       ↓                        ↓                         ↓
   User groups              User assignment          Loan associates
```

---

## Organizations and branches

**Organizations** represent company hierarchy (company, branches, divisions).

| Operation | Version | Endpoint |
|-----------|---------|----------|
| List organizations | V1 | `GET /encompass/v1/organizations` |
| Pagination | | `start` (default 1), `limit` (default 1000, max 10000) |
| Filter by parent | | `parentId` query param |
| View | | `view=summary` (used in SCIM setup examples) |

Organizations scope **data visibility**—users see loans and contacts per org placement and persona settings.

**SCIM example** ([SCIM User Provisioning User Guide](https://developer.icemortgagetechnology.com/developer-connect/docs/scim-user-provisioning-user-guide)):

```http
GET /encompass/v1/organizations?start=1&limit=20&view=summary
```

---

## Users

### Internal users (V3 — 24.2+)

[V3 Internal Users APIs](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-internal-users) for application-level user lifecycle.

### User management channels

| Channel | Scope |
|---------|-------|
| Encompass Admin UI | Application-level |
| Encompass V3 User APIs | Application-level programmatic |
| ICE MT SCIM | Centralized IDP provisioning + cross-domain SSO |

SCIM-supported products ([User Management](https://developer.icemortgagetechnology.com/developer-connect/docs/user-management)):

| Product | SCIM |
|---------|------|
| Encompass Web + Desktop | Yes |
| DDA Analyzers (cross-domain SSO) | Yes |

### SCIM capabilities

From [SCIM Overview](https://developer.icemortgagetechnology.com/developer-connect/reference/overview-1):

- Create, retrieve, update, delete (disable) SCIM users
- Retrieve Encompass user groups
- Assign/remove users and **organizations** to user groups
- SCIM 2.0 compliant
- `globalUserId` for cross-product SSO and account links

**Provisioning payload** can include `organization`, `personas`, `workingFolder`—or use Server Settings Manager defaults if omitted.

**Retrieve IDs before SCIM:**

```http
GET /encompass/v3/settings/personas?personaType=Internal
GET /encompass/v1/organizations?start=1&limit=20&view=summary
```

---

## Personas

From [Personas](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-personas):

> Personas represent **job functions** in your company. Each persona defines access to **functions, forms, and tools**. One or more personas are assigned to each user.

| Operation | Endpoint |
|-----------|----------|
| List personas | `GET /encompass/v3/settings/personas` |
| Params | `personaType` (Internal, External, InternalAndExternal), `start`, `limit`, `filter` |

Personas are the primary **entitlement** mechanism—not job titles.

---

## Roles (workflow roles)

From [Roles](https://developer.icemortgagetechnology.com/developer-connect/reference/roles):

> Roles carry out loan tasks in the workflow. A role (such as Loan Officer) can be associated with each **milestone**.

| Concept | Description |
|---------|-------------|
| **Role** | Workflow responsibility (Loan Officer, Processor, etc.) |
| **Personas in role** | Multiple personas can map to one role (junior/senior LO) |
| **User groups in role** | All group members access loan when assigned to role |

**V3 Settings APIs (25.1+):**

| Operation | Endpoint |
|-----------|----------|
| List roles | `GET /encompass/v3/settings/roles` |
| Role detail | `GET /encompass/v3/settings/roles/{roleId}` |
| Role mappings | `GET /encompass/v3/settings/roles/roleMappings` |
| Entities param | `Summary`, `Personas`, `UserGroups`, `All` |

Roles are configured in **Encompass > Settings > Company/User Setup > Roles**.

**Fixed roles** on loan associates (V1 milestones API): Loan Officer, Loan Processor, Loan Closer, Underwriter—custom roles map to these.

---

## User groups

User groups bundle users **and organizations** for shared access to loans, templates, and resources.

| Source | Usage |
|--------|-------|
| SCIM | Assign users/orgs to groups |
| Role config | Group assigned to workflow role |
| Webhook `userGroups` | Create/update/delete notifications |

Loan associate type `Group` assigns milestone work to a user group ([08-milestones-and-associates.md](./08-milestones-and-associates.md)).

---

## Loan associates vs business contacts

| Concept | Who | API domain | On loan? |
|---------|-----|------------|----------|
| **Loan associate** | Internal lender staff (or group) in a **workflow role** | V1 Milestones/Associates | Yes—per milestone or milestone-free role |
| **Business contact** | External partner (appraiser, title, etc.) | Business Contact Management | Linked via loan contacts |
| **Borrower contact** | Borrower/coborrower CRM record | Borrower Contacts | Linked via borrower/coborrower entityRef |

### Business contacts

From [Business Contact Management](https://developer.icemortgagetechnology.com/developer-connect/reference/business-contact-management):

- Appraisers, title companies, insurance agents in contacts database
- Personal or public (`accessLevel`)
- Linked to loan via Loan Contacts object or `referralSourceContact`

**Business relationship rules** ([Linking Business Contacts](https://developer.icemortgagetechnology.com/developer-connect/reference/linking-business-contacts-to-a-loan)):

- Fixed set of business relationships per loan
- One business contact can fill **multiple** relationships
- Each relationship (e.g. "Appraiser") holds **only one** contact—new assignment replaces prior

### Borrower contacts

From [Borrower Contacts](https://developer.icemortgagetechnology.com/developer-connect/reference/borrower-contacts-management):

- Past, present, potential borrowers in contacts database
- Public contacts visible to users above owner in org hierarchy
- Each borrower relationship on a loan maps to **one** borrower contact (cannot fulfill multiple borrower slots)

**John Smith example:**

| Type | Person | Relationship |
|------|--------|--------------|
| Loan associate | Mike | Loan Officer (milestone role) |
| Loan associate | Sarah | Loan Processor |
| Loan associate | Robert | Underwriter |
| Business contact | ABC Title | Title company |
| Business contact | XYZ Appraisal | Appraisal |
| Borrower contact | John Smith | Borrower entityRef on loan |

Mike is a **loan associate** (internal workflow). ABC Title is a **business contact** (external vendor)—different APIs, different permission models.

---

## Webhooks — Orgs and Users category

[wbhks-re-cat-orgs-users](https://developer.icemortgagetechnology.com/developer-connect/reference/wbhks-re-cat-orgs-users)

| Resource | Events | Support |
|----------|--------|---------|
| **ExternalOrganizations** | Create, Update | Smart Client |
| **ExternalUsers** | Create, Update, Delete | Smart Client, API |
| **InternalUsers** | Create, Update, Delete | Smart Client, API |
| **userGroups** | Create, Update, Delete | Smart Client |

**InternalUsers sample** includes `payload.entities[].id` (e.g. `admin`).

**userGroups sample** includes `Members` with `entityType: Organization` or user entries, `Action: Add/Update/Unassign`.

Use for cache invalidation of user directory and group membership—not for loan-level associate changes (see Loan `milestone` webhooks).

---

## Segregation of duties caveats

Official documentation establishes these facts relevant to segregation of duties (SoD):

1. **Personas control entitlements** — Access to functions, forms, tools, fields, folders, reports, and administrative settings is defined per persona ([Personas](https://developer.icemortgagetechnology.com/developer-connect/reference/settings-personas)).

2. **Multiple personas per user** — Users receive one or more personas based on job functions performed.

3. **Roles ≠ personas** — Workflow roles (milestone assignment) combine personas and user groups; a user group assigned to a role grants **all members** loan access when the role is active ([Roles](https://developer.icemortgagetechnology.com/developer-connect/reference/roles)).

4. **Organizational scope** — Organization hierarchy placement affects data visibility (contacts, loans).

5. **API identity ≠ loan authority** — Workflow Task APIs enforce assignee or Administrator persona for mutations ([07-workflow-tasks.md](./07-workflow-tasks.md)).

6. **SCIM automation risk** — Centralized provisioning can grant personas/org placement at scale; misconfigured defaults in Server Settings Manager propagate to every provisioned user.

7. **Protected document access** — Role API returns whether role has **protected access to documents**—relevant for sensitive doc SoD.

8. **External vs internal** — External users (TPO partners) have separate webhook resource and APIs; do not merge permission models with internal associates.

**Integration guidance (derived from official model, not a specific SoD policy):**

- Map SoD policies to **persona combinations** and **role assignments**, not user names.
- Block toxic pairs (e.g. same user as Processor + Underwriter) in your IAM review by reading persona assignments via V3 User APIs or SCIM.
- Audit **user group → role** mappings—group expansion grants access to all members without individual milestone assignment.
- Loan associate assignment does not override persona field restrictions—a user assigned as Underwriter may still lack field edit rights if persona forbids it.

**documentation does not establish** a specific Encompass API to enforce SoD rules programmatically; enforcement is via persona/role configuration in Encompass Settings.

---

## John Smith team — configuration map (illustrative)

| User | Personas (entitlements) | Workflow role on loan | Loan associate on John Smith file |
|------|-------------------------|----------------------|-----------------------------------|
| Mike | Loan Officer persona | Loan Officer | Yes—Qualification milestone |
| Sarah | Processor persona | Loan Processor | Yes—Processing milestone |
| Robert | Underwriter persona | Underwriter | Yes—after submittal |
| Lisa | Closer persona | Loan Closer | Milestone-free or closing milestone |

Workflow task `assignRole=true` resolves Sarah from **Processing** milestone associate, not from persona name string matching.

---

## Production integration concerns

1. **Resolve IDs at runtime** — Organization IDs, persona IDs, role IDs differ per instance; cache per `instanceId`.
2. **SCIM vs API users** — Choose one primary provisioning channel; reconcile with InternalUsers webhooks.
3. **Group explosion** — User group changes fire webhooks; re-evaluate effective loan access for all group members.
4. **External org users** — Separate ExternalUsers/ExternalOrganizations events; different support matrix (Smart Client only for external org create).
5. **Cross-domain SSO** — `globalUserId` links identities; do not use Encompass user ID alone across ICE products.
6. **Default provisioning** — SCIM users without persona/org in payload receive Server Settings Manager defaults—document for compliance audits.
7. **Associate vs contact** — Do not query business contacts API expecting loan team; use milestones/associates APIs.
8. **Pagination on org list** — 6 MB response cap recalculates `limit`; page large hierarchies with `start`/`limit`.

---

## Related files

| File | Topic |
|------|-------|
| [08-milestones-and-associates.md](./08-milestones-and-associates.md) | Loan associate assignment |
| [07-workflow-tasks.md](./07-workflow-tasks.md) | Task assignee URNs and access control |
| [12-organizations-users-roles.md](./12-organizations-users-roles.md) | (this file) |
