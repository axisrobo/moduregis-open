# Moduregis Module Boundaries

## Module Map

```text
interfaces
  api | cli | console | gitops
       |
application
  publication | resolution | invocation | plan_governance | audit_query
       |
domain
  registry | catalog | resolver | governor | broker | attestor | plans | audit
       |
infrastructure
  postgres | object_store | event_bus | search | adapters | telemetry
```

The module map is a bounded-module map, not a mandatory microservice topology. The initial API and Worker are composition roots for a modular monolith; a module is extracted only after a concrete scaling, availability, or isolation requirement is demonstrated.

## Domain Modules

| Module | Owns | Must not own |
|---|---|---|
| `moduregis` | identity, immutable Contract versions, owner, lifecycle, revocation status | search documents, executor status, policy decisions |
| `catalog` | Registry-derived browse and filter projection | authoritative eligibility or lifecycle |
| `resolver` | structured matching, input compatibility, candidate explanation | planning algorithm, authorization issuance |
| `governor` | publication and Plan governance orchestration, policy context assembly | IAM, PDP logic, approval truth, token issuance |
| `broker` | authorized invocation dispatch, idempotency, outcome references | agent loop, workflow state, external credentials |
| `attestor` | conformance result association, artifact digest and executor identity checks | artifact build, sandbox execution, signing-key custody |
| `plans` | governed Plan versions, approval positions, materialization references | decomposition algorithm, durable process instances |
| `audit` | append-only cross-system audit index and evidence manifests | raw runtime logs, SIEM ownership |
| `adapterregistry` | immutable Adapter Manifest versions, tenant scope, and activation lifecycle | attestation decision, authorization decision, or executor implementation |

## Allowed Dependency Direction

```text
interfaces -> application -> domain -> ports
infrastructure -> ports
adapters -> ports
```

- A domain module may depend only on another domain module's published port, never its persistence model.
- `moduregis` has no dependency on `catalog`, `resolver`, `broker`, or external products.
- `catalog` and `resolver` consume Registry read ports; neither writes lifecycle state.
- `governor` uses AEGIVELA through an authorization port and records only decision/evidence references.
- `broker` receives an already-authorized dispatch command; it cannot bypass `governor`.
- `plans` uses ORCHADYN and RHEOVELA ports, not their internal data models.
- `registrar`, `resolver`, `governor`, `broker`, and `attestor` may be independent packages but start in the same transactional control-plane deployment.
- `planner` is not an owned engine module. ORCHADYN is accessed through a Planning Service adapter.

## Suggested Repository Layout

```text
backend/
  cmd/
    moduregis-api/       Go API composition root
    moduregis-worker/    Go projection, callback, and retry worker
  internal/
    application/         command/query services
    moduregis/           Registry authority and PostgreSQL adapter
    catalog/ resolver/ governor/ broker/ attestor/ plans/ audit/ tenancy/
    adapters/            AEGIVELA, ORCHADYN, runtime, memory, and gateway ports
    platform/            PostgreSQL, object store, telemetry, event transport
frontend/
  console/               TypeScript/React Console
contracts/
  capability/            language-neutral schemas and fixtures
deploy/
  postgres/ compose/     shared deployment assets
sdk/
  go/ typescript/ python/
```

`contracts/` is deliberately separate from Go implementation packages. Consumers can adopt schemas and generated types without importing Moduregis's domain runtime.

## Source File Size

Source-code files are limited to 500 lines. When a module approaches that limit, split it along an existing domain boundary, such as command/query handling, persistence adapter, lifecycle transition, or external product adapter. This is a maintainability rule, not a reason to fragment a cohesive module into deployable services.

## Module Admission Checklist

A new module needs all of the following before introduction:

1. A single owned authority and storage boundary.
2. A published input/output contract and error model.
3. An explicit tenant and audit-context propagation rule.
4. Contract, domain, integration, and failure-mode tests appropriate to its responsibility.
5. Confirmation that an existing AxisRobo product does not already own the behavior.
