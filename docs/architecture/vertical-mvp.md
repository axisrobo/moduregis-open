# Moduregis Vertical MVP

## v0.1 Product Path

```text
Import Skill Package
  -> Generate Capability Contract
  -> Validate canonical Contract and sign/attest references
  -> Register immutable version
  -> Governor approval
  -> Resolve one Intent to one Capability
  -> AEGIVELA authorization
  -> Broker dispatch through PRAXOVELA / AXON adapter
  -> Harmovela lifecycle events
  -> Audit and outcome references
```

This is the first complete Moduregis product slice. It is not a Schema prototype and it is not a general autonomous planning system.

## v0.1 Modules

| Module | v0.1 responsibility | Explicit limit |
|---|---|---|
| Registrar | import Skill Package metadata and create a Contract draft | no direct executor registration bypass |
| Registry | immutable Contract body, digest, lifecycle, tenant/namespace authority | no search index authority |
| Catalog | tenant-scoped version summaries and Contract detail | discovery is not authorization |
| Resolver | one Intent to one compatible Capability | no decomposition or delegation algorithm |
| Governor | publication and invocation policy orchestration | AEGIVELA owns decision truth |
| Broker | dispatch one authorized invocation to one adapter | no agent loop or sandbox |
| Attestor | conformance, artifact, signature, and executor evidence references | no artifact build/signing-key custody |
| Console | Catalog, draft, Gate, and audit views | no local policy or lifecycle authority |

## v0.1 Limits

```text
one Intent
  -> one Capability
  -> one Skill implementation
  -> one execution instance
```

- No multi-Capability graph.
- No parallel planning.
- No checkpoint or compensation orchestration.
- No direct database or executor access from the Console.
- No invocation without an AEGIVELA authorization artifact.

## Product Evolution

| Release | Adds | Does not change |
|---|---|---|
| v0.1 | governed single-Capability vertical path, CAP-C0, Catalog, PRAXOVELA adapter, Harmovela correlation | Registry authority and AEGIVELA ownership |
| v0.2 | multiple implementations, deployment bindings, MCP/script/workflow adapters, CAP-C1/C2, MNEMOVELA projection | Moduregis remains control plane, not executor or memory authority |
| v0.3 | governed Plan records, ORCHADYN adapter, Capability Graph validation, compensation/checkpoint references | ORCHADYN plans; RHEOVELA owns durable workflow instances |
| 1.0 | federation, regional deployment, policy bundles, marketplace, cost governance, CAP-C4 evidence | Contract and Registry remain the shared authority boundary |

## Logical Repository Map

The historical `apps/services/packages/adapters` structure is retained as a logical ownership map, not a requirement for separate deployables:

```text
apps/
  console             -> frontend/console
  control-plane       -> backend/cmd/moduregis-api
  developer-portal    -> future frontend application
services/
  registrar/ registry/ resolver/ governor/ broker/ attestor/
                      -> backend/internal bounded modules by default
packages/
  capability-contracts -> contracts/
  client-sdk/ policy-sdk/ execution-sdk/ conformance-sdk -> published API/SDK surfaces
adapters/
  orchadyn/ harmovela/ mnemovela/ praxovela/ vulcan/ janus/ rheovela/ third-party
                       -> backend/internal/adapters, each with a stable external contract
```

`planner/` is intentionally absent as an owned engine module. Moduregis exposes a governed Planning Service adapter to ORCHADYN instead.
