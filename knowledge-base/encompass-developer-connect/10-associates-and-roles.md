# 10 — Associates and Roles

**Share this file when:** designing assignment, permissions, or "who owns this loan" screens.

**Related:** [04 Milestones](./04-milestones.md) · [05 Tasks](./05-workflow-tasks.md) · [12 Webhooks](./12-events-and-webhooks.md)

---

## Do not assume one person equals one role

```text
one person = one role   ← do not assume this
```

Encompass has concepts such as:

- user
- persona
- role
- user group
- loan associate
- business contact

These are not synonyms.

## How ICE describes it

The Encompass system defines **roles** which users or user groups take on within a loan as it moves from milestone to milestone. Typical examples include loan officer, loan processor, and underwriter. Roles can drive business rules that govern features or areas of the loan.

**Users are assigned to roles on a loan-by-loan basis.**

ICE states:

- A user who is loan officer on one loan may be loan processor on another.
- A user can be assigned to **multiple roles within the same loan** (for example both loan officer and loan processor).
- Whenever a user is assigned to a role within a loan, that user is a **loan associate** for the loan.

The Loan Associates API inspects and modifies loan associates on a given loan.

Whether a bank *permits* a person to perform multiple roles is a **business / compliance / segregation-of-duties** decision. The platform can allow it; policy may forbid it.

## Concepts to keep separate

| Concept | Rough meaning (verify in ICE org/user docs) |
|---------|-----------------------------------------------|
| **User** | Login identity |
| **Persona** | Product access / capability profile (confirm current ICE definition) |
| **Role** | Function on a loan workflow (LO, processor, UW, etc.) |
| **User group** | Group membership; task pipeline can include group-assigned work |
| **Loan associate** | A user (or group, where applicable) assigned to a role **on this loan** |
| **Business contact** | External/business contact, not the same as a loan associate |

A user may be eligible for multiple roles depending on configuration and persona / user-group membership.

## Milestone-free roles

ICE provides Milestone-Free Roles APIs to retrieve milestone-free logs for a loan. Confirm current behavior before modeling "roles that are not tied to a milestone."

## Organizations & Users webhooks

The webhook catalog includes **Organizations & Users**. User/org changes can affect who is allowed to act; they are not loan events. Handle them as a separate resource stream.

## Official documentation

- [Loan Associates & Milestones](https://developer.icemortgagetechnology.com/developer-connect/reference/loan-associates-milestones)
- Search Developer Connect for **Organizations & Users** / SCIM user APIs
- [Webhook overview](https://developer.icemortgagetechnology.com/developer-connect/reference/webhook)
