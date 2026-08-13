# 12 — Organizations, users, personas, roles, associates, contacts

**Related:** [08 Milestones](./08-milestones-and-associates.md) · [07 Tasks](./07-workflow-tasks.md) · [14 External domains](./14-epc-dda-trades-schedulers.md)

**Official:** [Loan Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones) · [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) · [Webhook overview (Organizations & Users)](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)

---

## A. Business meaning

People in Encompass are not a single “user” record reused as role, contact, and borrower.

| Concept | Meaning |
|---------|---------|
| **User** | Login identity in the Encompass instance |
| **Persona** | Product access / capability profile (confirm current ICE definition on org/user docs) |
| **Role** | Workflow function on a loan (LO, processor, UW, …) |
| **User group** | Group membership; task pipeline can include group-assigned work |
| **Loan associate** | User assigned to a **role on this loan** |
| **Business contact** | External party (title, appraiser) associated with the loan — **not** the same as associate |
| **Borrower / co-borrower** | Applicants on an application pair |
| **Service provider** | ABC Title, XYZ Appraisal — typically contacts/partners, not loan associates |

## B. John Smith (illustrative)

- Mike = user eligible for Loan Officer persona/role → **associate** on this loan as LO
- Sarah = Processor associate
- Robert = Underwriter associate
- Lisa = Closing Coordinator associate
- ABC Title = **business contact** / provider
- John = **borrower**, not a user of the lender’s Encompass (unless TPO/consumer portal identity — different products)

ICE: a user **can** be assigned multiple roles on the **same** loan. **Never** say unconditionally that one user can or cannot perform all roles.

Distinguish:

1. **Technical capability** — APIs/platform allow multi-role assignment
2. **Configuration** — personas, groups, role eligibility in this instance
3. **Bank policy / SoD** — compliance may forbid LO+UW on the same file

## C. Domain model

```text
Organization / branches
    +-- users
    +-- personas
    +-- user groups
    +-- role definitions
         |
         v
    Loan associate (user + role + this loanId)
         |
         vs
    Business contact (ABC Title) ---- associated to loan, not a workflow role
```

## D. APIs

- Associates: V1 `GET /encompass/v1/loans/{id}/associates/{logId}` (logId from milestones)
- V3 milestone PATCH can assign associate (changelog)
- Organizations & Users / SCIM: search current portal (`/scim2/v1/users` appears in search results — **confirm on official page before coding**)
- OAuth: [Authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication) — SSO (authorization_code, lenders not ISVs for that SSO note), ROPC, client_credentials with `instance_id` and scope `lp` in documented flows, user impersonation via token exchange for privileged users
- Webhook resource: **Organizations & Users**

Get Loan permission rule: fields omitted if caller lacks permission.

## E–F. Request / response

Use live samples from associate and SCIM pages. Do not invent user schema fields here.

## G. Field table (conceptual; persist IDs that ICE returns)

| Field | Meaning | Persist? |
|-------|---------|----------|
| userId | Actor on webhooks (`meta.userId`) | Yes |
| role entityId | Role on associate | Yes |
| loanId + role | Associate assignment | Yes |
| contact id | ABC Title | Yes, separate table |

Configurable: personas, groups, which users may take which roles, milestone-role mapping.

Invariant: associate is **per loan**.

## H. Lifecycle

User provisioned (SCIM/admin) → eligible via persona/group → assigned as associate when milestone/role needs a person → tasks route to user or group → user disabled → assignments must be rehomed (exact disable semantics **verify**).

## I. Events

Organizations & Users webhooks: confirm event names on that category page. Do not reuse Loan `update` as a user-provisioning event.

## J. Integration

Bank IAM vs Encompass users: map `userId` explicitly. Task queues join assignee to HR SoD rules **in the bank**, not only in Encompass.

## K. Production

- Impersonation: powerful; audit it.
- Exclusive locks tied to logged-in user.
- TPO/external users (`ExternalUser` exists as entity type in ICE’s long enum) — different from employees.

## L. Common mistakes

1. `one person = one role` globally.
2. Treating ABC Title as a loan associate.
3. Assuming Consumer Connect borrower is an Encompass user.
4. Unconditional “users cannot hold two roles.”

## M. Questions

1. Can Mike be LO and processor on John Smith’s loan technically? Policy?
2. What identifier do you store for Sarah vs her role?
3. How does a user-group task appear on Sarah’s pipeline?
