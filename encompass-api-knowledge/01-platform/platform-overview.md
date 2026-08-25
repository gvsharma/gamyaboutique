# Platform overview

Encompass Developer Connect lets Encompass clients administer loan information via REST APIs.

Source: [https://developer.icemortgagetechnology.com/developer-connect/docs/welcome](https://developer.icemortgagetechnology.com/developer-connect/docs/welcome)

## Prerequisites

- API key (client id/secret) issued by Super Administrator. Does not expand persona rights.
  Source: [https://developer.icemortgagetechnology.com/developer-connect/docs/get-an-api-key](https://developer.icemortgagetechnology.com/developer-connect/docs/get-an-api-key)
- OAuth 2.0 token. Lenders: password grant. ISVs: client credentials.
  Source: [https://developer.icemortgagetechnology.com/developer-connect/docs/authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication)

## Hosts

| Env | URL |
| --- | --- |
| Production | `https://api.elliemae.com` |
| UAT | `https://concept.api.elliemae.com` |
| Authorize | `https://idp.elliemae.com/authorize` |
| Token | `https://api.elliemae.com/oauth2/v1/token` |

Catalog: [https://developer.icemortgagetechnology.com/developer-connect/reference/browse-apis](https://developer.icemortgagetechnology.com/developer-connect/reference/browse-apis). Release notes: [https://developer.icemortgagetechnology.com/developer-connect/docs/release-notes](https://developer.icemortgagetechnology.com/developer-connect/docs/release-notes) (19.1 through 26.2 August SP as of this research).

SDK migration: [https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide](https://developer.icemortgagetechnology.com/developer-connect/docs/sdk-to-api-migration-getting-started-guide)
