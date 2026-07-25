# ADR 0006: Deliver a Vertical Capability MVP Without Owning Execution Engines

**Status:** Accepted  
**Date:** 2026-07-15

## Context

An earlier portfolio proposal correctly identified Registrar, Registry, Resolver, Governor, Broker, Attestor, Console, and a one-Capability vertical path as the minimum shape of a Capability Platform. It also proposed independent `services/` for every module and placed Planner and execution-engine responsibilities inside the platform repository.

Moduregis is a Capability Platform control plane and publication boundary. It must not become another agent runtime, planner, workflow engine, memory platform, gateway, or security authority.

## Decision

- Moduregis v0.1 is an end-to-end path: import a Skill Package, generate/validate/sign a Capability Contract, register, approve, resolve one Intent to one Capability, authorize through AEGIVELA, invoke through a PRAXOVELA adapter, emit Harmovela lifecycle events, and record outcome/audit references.
- Registrar, Registry, Catalog, Resolver, Governor, Broker, Attestor, and Console are bounded modules inside a modular control plane. They are not separate network services by default.
- ORCHADYN owns planning and delegation algorithms. Moduregis owns only Planning Service adapter contracts and governed Plan records.
- PRAXOVELA/AXON, Vulcan Forge, Janus, RHEOVELA, LIMENORA, MNEMOVELA, AEGIVELA, and Harmovela remain independent products/protocols connected through versioned adapters.
- The current product name remains Moduregis. Historical MODURION naming is not reintroduced as a competing public product identity.

## Consequences

- Schema-only delivery is insufficient; each release must prove an end-to-end governed path.
- A module may later become a deployable service only when measured scaling, availability, or isolation requirements justify the consistency cost.
- The first executable path is intentionally constrained to one Intent, one Capability, one implementation, and one execution instance.
- Basic tenant isolation remains Core. Enterprise Edition adds organization-scale governance rather than moving foundational isolation behind a proprietary boundary.
