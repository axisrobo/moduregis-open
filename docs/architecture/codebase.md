# Moduregis Codebase Layout

## Top-Level Boundaries

```text
backend/                 Go control-plane implementation
frontend/console/        TypeScript/React management Console
contracts/               Versioned language-neutral product contracts
deploy/                  PostgreSQL and deployment assets
docs/                    Product, architecture, operations, and ADRs
scripts/                 Contract validation tooling
```

## Backend

`backend/` is a self-contained Go module. It owns API composition, background workers, Registry authority, transactional PostgreSQL persistence, and external product adapters.

```text
backend/
  cmd/moduregis-api/     HTTP API process
  cmd/moduregis-migrate/ PostgreSQL migration process
  internal/config/       local development configuration
  internal/moduregis/    immutable Capability versions and lifecycle
  internal/moduregis/postgres/
                          PostgreSQL Registry adapter and integration tests
```

The backend must not serve frontend assets or contain browser-specific state. Its public boundary is a versioned HTTP API and language-neutral Contract assets.

## Frontend

`frontend/console/` is an independently buildable TypeScript/React application. It owns presentation, client-side navigation, accessible forms, and API query state.

It must not:

- import Go packages or access `backend/internal`.
- connect directly to PostgreSQL, object storage, AEGIVELA, or runtime executors.
- decide authorization, mutate lifecycle state locally, or cache authority as truth.

It may only consume published Moduregis API/Contract types. Frontend API clients and generated types belong under `frontend/console/src/api/` once the public API is frozen.

## Shared Assets

- `contracts/` is the sole shared source for Capability schemas and fixtures.
- `deploy/` is shared operational configuration, not backend source code.
- `go.work` identifies `backend/` as the root workspace module; it does not couple the frontend build to Go.
- Root `package.json` currently runs Contract validation. A future Console package may use its own workspace configuration without moving Contract fixtures into frontend code.
