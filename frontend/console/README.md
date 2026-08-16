# Moduregis Console

The Console is the independent TypeScript/React management application for Moduregis.

## Development

```powershell
npm ci
npm run dev
```

The development server listens on port `1807` and proxies every `/v1` request to `http://localhost:1806`. Set `MODUREGIS_API_PROXY_TARGET` to change the local API target. The proxy exists only in the Vite development server; it is not included in a production build.

## Configuration

Vite embeds `VITE_*` values at build time. Do not place secrets, bearer tokens, or client credentials in these variables.

```powershell
$env:MODUREGIS_API_PROXY_TARGET = "http://localhost:1806"
$env:VITE_API_BASE_URL = "https://api.moduregis.example"
$env:VITE_OIDC_ISSUER = "https://identity.example/realms/operations"
$env:VITE_OIDC_CLIENT_ID = "moduregis-console"
```

- `MODUREGIS_API_PROXY_TARGET` selects the API used by `npm run dev`; its default is `http://localhost:1806`.
- `VITE_API_BASE_URL` is the approved public API origin used by a deployed Console. Omit it for a same-origin deployment, where requests use `/v1`.
- `VITE_OIDC_ISSUER` and `VITE_OIDC_CLIENT_ID` identify the OIDC provider and public Console client for the host integration. They do not configure an authorization decision or grant access locally.

The Console requires its host to inject an in-memory OIDC token provider before it makes protected API calls. Set `window.__MODUREGIS_CONSOLE_OIDC_TOKEN_PROVIDER__` to an async function accepting `{ issuer, clientId }` and returning the current access token before loading the Console bundle. If the OIDC settings or provider are absent, the Console shows a configuration error and disables protected API actions. It does not write tokens to local storage, session storage, cookies, source control, or Vite environment variables. The Moduregis API forwards each request to AEGIVELA for its policy decision.

## Deployment Boundary

Serve the Console over HTTPS and configure the API at `VITE_API_BASE_URL` before running `npm run build`. Prefer a reverse proxy that serves the Console and `/v1` API under one origin. If the Console and API use different origins, configure the API CORS policy for the exact Console origin and `Authorization` header; do not use a wildcard origin for authenticated requests. The browser must never connect directly to PostgreSQL or a runtime executor.

## Boundary

The Console consumes only versioned Moduregis HTTP APIs and generated public Contract types. It must not import Go backend packages, connect to PostgreSQL, or implement lifecycle and authorization decisions locally.

## Governed Publication

The beta Console supports Capability registration and publication through the
versioned API only:

1. Enter a Capability JSON document and select **Register draft**. The API
   validates the document, authorizes the request through AEGIVELA, and returns
   the Registry-owned Capability identity, digest, and lifecycle state.
2. Supply the trace identifier required by the API, then select
   **Publish registered version**. The API derives the actor from the authenticated
   principal and remains responsible for attestation,
   policy, lifecycle transition, and audit evidence. The Console displays the
   returned lifecycle state or the returned validation/publication error; it
   does not infer eligibility locally.
3. The Console preserves one generated `audit_event_id` as the publication
   retry key. Retry the same logical publication with that value. Select
   **Reset retry key** only to begin a distinct publication attempt.

OIDC configuration and an injected in-memory token provider remain mandatory
for both actions. If either is unavailable, protected actions stay disabled.
The Console never stores a bearer token and never acts as a policy, schema, or
lifecycle authority.

Invocation retries similarly retain the same idempotency key until the operator
explicitly selects **Start new invocation**.

## CI Gate

The `console` CI job runs `npm ci`, regenerates OpenAPI types with
`npm run generate:api`, rejects generated-type drift, runs `npm test`, and runs
`npm run build`. Changes to the registration or publication API contract must
include regenerated `src/api/` declarations.
