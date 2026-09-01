# Loan schema

`GET /encompass/v3/schemas/loan` — JSON schema for loans; filterable by entities; `includeFieldExtensions`; updated every Encompass release; includes standard and custom fields.

Source: [https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1](https://developer.icemortgagetechnology.com/developer-connect/reference/get-loan-schema-1)

Use to construct V3 Create/Update payloads. **Virtual fields are not included** in the data-dictionary process.

Source: [https://developer.icemortgagetechnology.com/developer-connect/docs/encompass-loan-data-dictionary-guide](https://developer.icemortgagetechnology.com/developer-connect/docs/encompass-loan-data-dictionary-guide)

JSON Path on field definitions locates values in Get/Create/Update responses.

**INTERNAL ARCHITECTURE RECOMMENDATION:** cache schema per Encompass release; do not fetch on dashboard request.
