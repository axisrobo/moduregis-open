# ADR 0010: Govern Adapter Activation Through Evidence and Policy Gates

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Adapter Registry lifecycle alone cannot establish that a deployment is verified or authorized for a tenant. Direct transition from `verified` to `active` without evidence and policy would create an ungoverned execution boundary.

## Decision

- Governor is the only application service allowed to orchestrate production Adapter activation.
- Governor requires an Adapter Registry record in `verified` state.
- Governor requires at least one `verified` Attestor evidence reference for the exact adapter ID and version.
- Governor requests an AEGIVELA activation decision bound to tenant, namespace, actor, trace, authorization artifact, and evidence references.
- Only an allowed decision causes the Registry transition to `active`.
- No public HTTP activation endpoint is added until a production AEGIVELA adapter is configured to supply the required activation decision.

## Consequences

- Adapter implementations cannot self-activate.
- A rejected evidence record never satisfies the activation Gate.
- An AEGIVELA outage fails closed.
- Governor activation results provide the policy version and evidence references required by the future Audit Index.
