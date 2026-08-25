# Internal users

V3 family added **24.2**. `GET /encompass/v3/users` — admin / Super Admin / Administrator or Organizations/User persona. Caller sees own org + children. Query `orgId` (0=root), `isRecursive`.

`POST /encompass/v3/users` create — required Id, Firstname, LastName, WorkingFolder, Email, Personas (some exception-able), `orgId` query. Password unless apiUser or isSsoOnly.

`GET /encompass/v1/company/users/{userId}/effectiveRights` — union of persona + explicit rights.

SCIM provisioning documented separately.

Webhooks: InternalUsers create/update/delete.

Source: v3-get-list-internal-users, v3-create-internal-user

**INTERNAL ARCHITECTURE RECOMMENDATION:** HLA roster = internal users with the LO/HLA persona or role **LENDER CONFIGURABLE**.
