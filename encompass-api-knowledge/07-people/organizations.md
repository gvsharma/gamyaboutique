# Organizations

Internal org hierarchy via user list `orgId` / `isRecursive`.

External/TPO: `GET /encompass/v3/settings/externalOrganizations/tpos` and `.../tpos/{orgId}` with `entities` (Summary, BasicInfo, … All). Prefer specific entities over All (performance). 24.3 TPO custom field definitions endpoint.

Webhooks: External Organizations create/update (Smart Client).

Source: v3-get-external-orgs
