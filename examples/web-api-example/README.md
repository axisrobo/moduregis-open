# Moduregis Web/API Example

A minimal HTTP API protected by the MODUREGIS Go SDK. Demonstrates:

- Catalog listing with AEGIVELA adapter authorization
- Capability resolution with Intent matching
- Invocation dispatch with idempotency key

## Run

```bash
cd examples/web-api-example
go run main.go
```

The example starts a local API server that validates incoming requests through a configurable AEGIVELA stub.
