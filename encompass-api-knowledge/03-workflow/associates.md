# Loan associates

Users assigned to **roles** on a **specific loan** are loan associates. Same user may be LO on one loan and processor on another; one user may hold multiple roles on one loan.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/get-associates](https://developer.icemortgagetechnology.com/developer-connect/reference/get-associates)

## Fixed role names (official)

Loan Officer, Loan Processor, Loan Closer, Underwriter. Custom roles can map to a fixed role. **LENDER CONFIGURABLE**

HLA in our product = typically the **Loan Officer** assignment. That mapping is **INTERNAL ARCHITECTURE RECOMMENDATION** plus **LENDER CONFIGURABLE**.

## API

`GET /encompass/v1/loans/{id}/associates` — list; query `userId`, `roleId` (docs also mention filter by fixed role ID in the prose).

`GET /encompass/v1/loans/{id}/associates/{logId}` — one associate.

`PUT /encompass/v1/loans/{id}/associates/{logId}` — assign (user must already be allowed for that role/milestone).

Read-only from user profile: name, phone, fax, email, roleName, roleId, writeAccess.

Live sample roleName `"Loan Officer"`, userId `jdoe`.

## Not a list-all-loans-for-user API

Calling associates in a loop over 300 loans violates ICE concurrency guidance. Use Pipeline after discovering a canonical LO field, then optionally verify with this API on loan-detail.

V3 milestone PATCH can also assign associates (24.1 milestone worksheet APIs).
