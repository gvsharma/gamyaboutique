# Encompass Developer Connect — Authentication

## Business Purpose

All Encompass Developer Connect REST APIs require OAuth 2.0 authentication. Integrations obtain an access token and pass it as a Bearer token on every API call.

## Official Documentation

- [Authorization](https://developer.icemortgagetechnology.com/developer-connect/docs/authentication)
- [Get an API Key](https://developer.icemortgagetechnology.com/developer-connect/docs/get-an-api-key)

## OAuth Flows (Supported)

| Flow | Grant Type | Typical Use |
|------|------------|-------------|
| Authorization Code | `authorization_code` | UI / SSO lenders |
| Resource Owner Password | `password` | Lender server integrations (non-ISV) |
| Client Credentials | `client_credentials` | **ISV partners only** |
| Token Exchange | `urn:elli:params:oauth:grant-type:token-exchange` | User impersonation |

## Endpoints

| Purpose | URL |
|---------|-----|
| Authorization | `https://idp.elliemae.com/authorize` |
| Token Issuance | `POST https://api.elliemae.com/oauth2/v1/token` |
| Token Introspection | Documented in auth guide |
| Token Revocation | Documented in auth guide |

## API Base URLs

| Environment | Base URL |
|-------------|----------|
| Production | `https://api.elliemae.com` |
| UAT | `https://concept.api.elliemae.com` |

## Request — Token (Password Grant — Illustrative)

**Confirmed:** endpoint, grant types, scope `lp`, HTTP Basic auth with `client_id:client_secret`.

```http
POST /oauth2/v1/token HTTP/1.1
Host: api.elliemae.com
Authorization: Basic <base64(client_id:client_secret)>
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=<encompass_user>&password=<password>&scope=lp
```

## Response — Token (Illustrative structure)

**Confirmed:** OAuth 2.0 access token response pattern per OAuth spec and Encompass auth guide.

```json
{
  "access_token": "<token>",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Exact field names and expiry: per token endpoint response at runtime.

## Using the Token

```http
Authorization: Bearer <access_token>
```

Required on all documented Encompass API calls.

## Permissions

- API key provisioned by **Super Administrator** persona
- Client secret must not be shared outside organization
- Data access governed by token user's **Encompass persona**
- Fields without permission are omitted from loan GET responses (official Get Loan usage note)

## Production Considerations

- Store client secret in a secrets manager; rotate via API Key Management page (old secret expires immediately on regenerate)
- Use authorization code + SSO for lender UI flows when SSO enabled
- ISV partners must use `client_credentials`; lenders use `password` or authorization code
- Token expiry requires refresh/re-auth strategy

## Common Developer Mistakes

- Using `client_credentials` as a lender (documented as ISV-only)
- Embedding client secret in frontend code
- Assuming token carries permissions beyond the user's persona
- Omitting `scope=lp` on authorization requests

## cURL Example

```bash
curl -s -X POST "https://api.elliemae.com/oauth2/v1/token" \
  -H "Authorization: Basic $(echo -n 'CLIENT_ID:CLIENT_SECRET' | base64)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=USER&password=PASS&scope=lp"
```

## Questions an Architect Should Ask

- Which grant type matches our deployment model (lender vs ISV)?
- Do we need user impersonation for audit trails?
- How do we handle token refresh and secret rotation without downtime?
- Which personas will the integration user hold?
