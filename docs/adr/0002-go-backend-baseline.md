# ADR 0002: Use Go for the Moduregis Backend

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Moduregis is an enterprise control plane with a transactional Registry, an authenticated API, asynchronous projection and callback work, runtime invocation routing, and integrations with several AxisRobo products. Its initial architecture is a modular monolith plus Worker, not a browser-centric application or a set of independent microservices.

The earlier planning document proposed TypeScript for API, Worker, Console, and SDKs. That does not best fit the operational profile of the authoritative backend.

## Decision

- Implement the backend API, Worker, domain modules, persistence ports, and integration adapters in Go.
- Implement the Console separately in TypeScript/React.
- Keep Capability Contract and API specifications language-neutral using JSON Schema and OpenAPI.
- Publish SDKs independently in Go, TypeScript, and Python where supported by stable public contracts.
- Do not introduce a Go service per module. The API and Worker remain composition roots for a Go modular monolith until scaling evidence requires a separate deployable.

## Consequences

- Go is the default for authoritative state transitions, concurrent adapter I/O, cancellation-aware invocation routing, and deployable operational services.
- `context.Context`, database transaction boundaries, typed errors, and structured logging become required backend conventions.
- Console implementation cannot import backend internals; it uses only versioned APIs and generated public types.
- The Contract validator remains JavaScript-based temporarily because it is a small executable Contract artifact. A Go validator may be added only when it can use the same fixtures and compatibility rules.
- The team must define Go linting, test, migration, and build verification before introducing runtime code.
