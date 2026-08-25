# Authentication

OAuth 2.0. Basic auth of `client_id:client_secret` (API key). Super admin retrieves key.

| Endpoint | URL |
| -------- | --- |
| Authorize | https://idp.elliemae.com/authorize |
| Token | https://api.elliemae.com/oauth2/v1/token |
| Introspect | https://api.elliemae.com/oauth2/v1/token/introspection |
| Revoke | https://api.elliemae.com/oauth2/v1/token/revocation |

Grants: Authorization Code (1-minute code; SSO `is_sso=true`); **Password** (`user_name@encompass:{instance_id}`) — **lenders must use this**; Client Credentials — **ISV only**.

Token: 30 minutes, max 24 hours; must be used within 15 minutes or 30-min expiry.

Impersonation: token-exchange grant; Super Admin anyone; API users at/below org.

Source: [https://developer.icemortgagetechnology.com/developer-connect/docs/authentication](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication)
