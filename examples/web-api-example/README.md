# Moduregis Web/API Example

A minimal HTTP API protected by the MODUREGIS Go SDK (`sdk/go/pepsdk`).
Demonstrates:

- Catalog listing with AEGIVELA adapter authorization
- Capability invocation dispatch with an idempotency key

## Run

```bash
cd examples/web-api-example
MODUREGIS_API_URL=http://localhost:8080 MODUREGIS_API_TOKEN=<token> go run main.go
```

The example starts a local API server (`:3000`) that validates incoming requests
through a configurable AEGIVELA stub. Set `MODUREGIS_API_TOKEN` from an approved
OIDC/AEGIVELA identity in a protected environment; never commit it.

### Endpoints

- `GET /capabilities?namespace=<ns>` — lists published capabilities via the SDK.
- `POST /invoke` — dispatches a governed invocation with `capability_id`,
  `version`, `namespace`, `idempotency_key`, and `input`.
