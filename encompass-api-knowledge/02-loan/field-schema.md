# Field schema, custom fields, virtual fields, field reader

## Standard fields

`GET /encompass/v3/schemas/loan/standardFields` — query all or listed fields. Response includes `jsonPath`, `contractPath`, `format`, `readOnly`, `fieldLock`, `nullable`, `category`, `dataType`, `maxLength`, `multiInstance`, `options`. Header `X-Total-Count`.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/get-field-schema-1](https://developer.icemortgagetechnology.com/developer-connect/reference/get-field-schema-1)

## Custom fields

`GET /encompass/v3/settings/loan/customFields` — all custom field settings; filter by ids. Includes `isCalculatedField`. Types include DATE, DECIMAL*, DROPDOWNLIST, INTEGER, PHONE, SSN, STRING, Y/N, ZIPCODE, etc.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/manage-custom-fields](https://developer.icemortgagetechnology.com/developer-connect/reference/manage-custom-fields)

## Virtual fields

`GET /encompass/v3/schemas/loan/virtualFields` — not stored standard/custom IDs. Filter `instanceSpecifierType` / `virtualFieldTypes` including LoanAssociate, Milestones, conditions, documents, etc.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/get-virtual-fields](https://developer.icemortgagetechnology.com/developer-connect/reference/get-virtual-fields) (introduced ~20.1; expanded 22.1)

Whether virtual LoanAssociate fields are Pipeline-filterable: **NOT ESTABLISHED BY CURRENT OFFICIAL DOCUMENTATION**.

## Field Reader

`POST /encompass/v3/loans/{loanId}/fieldReader` — values by field ID, returned as strings. Dates `MM/DD/YYYY`. `invalidFieldBehavior`: Include | Exclude | Fail (default Fail as of 24.2 if unspecified). Canonical IDs as input: documented as currently allowed but not intended.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/v3-field-reader](https://developer.icemortgagetechnology.com/developer-connect/reference/v3-field-reader)

## Audit trail

`POST /encompass/v3/loans/{loanId}/auditTrail` with `fieldIds`. Query: `includeHistoricalData`, `ignoreInvalidFields`, `start`, `limit`. Reads **RDB**.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/pull-field-audit-data](https://developer.icemortgagetechnology.com/developer-connect/reference/pull-field-audit-data)
