# Moduregis Architecture

## Architectural Role

Moduregis is a Capability control plane. It owns declarative Capability assets and control-plane decisions; it routes authorized work to runtime data planes that remain owned by other AxisRobo products.

```text
                  +------------------------------+
                  | Console, CLI, GitOps, API     |
                  +---------------+--------------+
                                  |
                  +---------------v--------------+
                  | API Boundary and Identity     |
                  +---------------+--------------+
                                  |
       +--------------------------v--------------------------+
       |                   Moduregis Core                      |
       | Registry | Catalog | Resolver | Governor | Broker     |
       | Attestor | Plan Registry | Audit Index                |
       +--------+----------+----------+-----------+-----------+
                |          |          |           |
          PostgreSQL   Object Store  Event Bus   Adapters
                                                    |
       +---------------+---------------+------------+----------------+
       |               |               |            |                |
   AEGIVELA       ORCHADYN         MNEMOVELA   PRAXOVELA/RHEOVELA  LIMENORA
 identity/policy  planning          projection   execution          boundary
```

## Deployment Model

The initial deployment is a modular monolith with a separate asynchronous worker. Registry state transitions, publication governance, and audit-index writes share a database transaction boundary. The worker handles projection, notification, attestation polling, and adapter callbacks.

| Component | Runtime responsibility | Persistence |
|---|---|---|
| API service (Go) | authenticated commands and queries | PostgreSQL transactions |
| Worker (Go) | projections, retries, non-authoritative event handling | queue cursor and retry state |
| Console (TypeScript/React) | browser UI for publishers, operators, and auditors | no authority state |
| PostgreSQL | Registry, governance, Plan metadata, Audit Index | authoritative control-plane data |
| Object storage | signed manifests, conformance reports, evidence artifacts | content addressed; referenced by PostgreSQL |
| Event transport | asynchronous integration notifications | non-authoritative and replayable |

PostgreSQL 16 is the source of truth. Valkey, a search index, and event streams may improve performance, but all are rebuildable projections. The Registry schema uses tenant-first composite keys, append-only transitions, and forced Row-Level Security.

## Implementation Baseline

The backend is a Go modular monolith. Go provides one deployable API binary and one Worker binary with predictable concurrency, cancellation, resource use, and enterprise deployment characteristics. It does not change the product boundary: all modules still communicate through domain ports and versioned external adapters.

- Use Go packages for domain modules, application services, infrastructure ports, and product adapters.
- Use `context.Context` for request lifetime, cancellation, tenant context, trace context, and deadline propagation; do not pass these as untyped maps.
- Use PostgreSQL transactions for lifecycle and governance transitions; goroutines may not outlive a transaction and mutate authority state later.
- Keep Console code in a separate TypeScript/React application. The browser consumes stable API contracts, never Go internal packages.
- Keep Contract schemas language-neutral. Generate or hand-maintain SDKs only from the published Contract/API surface.

## Core Domain Objects

| Object | Authority | Mutability |
|---|---|---|
| Capability identity | Registry | immutable |
| Capability Contract version | Registry | immutable canonical JSONB body plus SHA-256 digest |
| Lifecycle transition | Registry | append-only transition history |
| Publication decision | Governor + AEGIVELA evidence | immutable decision record |
| Attestation reference | Attestor | append-only evidence association |
| Catalog entry | Catalog projection | rebuildable |
| Resolution result | Resolver | ephemeral, auditable on invocation |
| Capability Plan | Plan Registry | versioned; governed changes create a revision |
| Invocation | Runtime Broker | immutable request plus append-only status history |
| Audit event | Audit Index | append-only |

## Consistency Boundaries

- A Contract version, its publication state, and its policy binding change in one Registry transaction.
- A Broker must read current publication and revocation state before dispatching an invocation.
- Event delivery is at least once; consumers must use event IDs and aggregate revisions for idempotency.
- Executor outcomes are references to external runtime truth. Moduregis never synthesizes an execution success after losing a callback.
- Search and MNEMOVELA projections can lag Registry state; Resolver rechecks Registry eligibility before returning an executable result. Registry namespace listings are tenant-scoped administrative reads, not end-user discovery decisions.

## Trust Boundaries

1. **Caller boundary:** Console, CLI, GitOps, and API clients authenticate through AEGIVELA.
2. **Control-plane boundary:** domain modules use internal authenticated service calls and transaction-scoped tenant context.
3. **Executor boundary:** Broker sends a signed, short-lived AEGIVELA authorization artifact and immutable Capability version reference.
4. **Enterprise boundary:** LIMENORA owns ingress, egress, protocol mediation, and external-system credentials.
5. **Evidence boundary:** raw runtime evidence remains with its producing system; Moduregis records immutable references and integrity metadata.

## Event Model

Events use a product-specific schema but may be carried using Harmovela transport adapters. Event names follow the shared dotted namespace convention:

```text
capability.submitted
capability.verified
capability.published
capability.revoked
plan.approved
invocation.dispatched
invocation.completed
```

The event stream is not a Registry API. Consumers must use versioned read APIs when they need authoritative state.
