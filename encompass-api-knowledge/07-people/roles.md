# Roles

Roles govern milestone/milestone-free assignment and business rules. Two kinds: milestone roles and milestone-free roles. Association is **LENDER CONFIGURABLE**.

Four fixed names: Loan Officer, Loan Processor, Loan Closer, Underwriter.

Company/User Setup OpenAPI covers Milestones, Organizations, Personas, **Roles** — fetch live Roles list endpoint in explorer if needed. A fully independently fetched Roles CRUD page was not the focus of this pass; do not invent paths.

Associates API returns `roleId`, `roleName`.
