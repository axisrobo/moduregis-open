# Moduregis Integration and Interoperability

## Integration Rule

Every product integration is a versioned adapter contract. Moduregis integrates with external products through published ports; it does not access their databases, internal queues, or implementation types.

## Required Context Envelope

Every adapter request and callback carries:

```json
{
  "tenant_id": "string",
  "namespace": "string",
  "trace_id": "string",
  "actor_id": "string",
  "capability_ref": "capability ID plus immutable version",
  "policy_version": "string",
  "evidence_refs": ["opaque evidence reference"]
}
```

For HTTP Catalog requests, `tenant_id` and `actor_id` are derived exclusively by the AEGIVELA adapter from the bearer artifact. They are never accepted as caller-controlled query parameters or headers.

## Product Contracts

| Product | Moduregis consumes | Moduregis provides | Ownership boundary |
|---|---|---|---|
| AEGIVELA | identity claims, authorization decision, approval outcome, revocation state, attestation decision | Capability envelope, risk, policy-set reference, invocation binding | AEGIVELA owns security truth |
| ORCHADYN | Capability Plan and planning rationale | eligible Capability graph, constraints, current versions, governance result | ORCHADYN owns decomposition and delegation strategy |
| PRAXOVELA | execution status, output reference, runtime evidence | authorized invocation, execution constraints, immutable Contract reference | PRAXOVELA owns Agent execution and local sessions |
| RHEOVELA | process instance state, human-task and compensation evidence | approved Plan, materialization request, Contract version references | RHEOVELA owns durable workflow state |
| MNEMOVELA | semantic candidates, context/experience summary | published metadata projection, outcome events | MNEMOVELA is never the Registry authority |
| LIMENORA | executor registration, external call outcome, boundary evidence | authorized external invocation and policy constraints | LIMENORA owns ingress/egress and protocol mediation |
| Harmovela | coordination event and task correlation | optional domain events and correlation references | Harmovela defines semantics, not a central service |
| Third-party adapter | manifest-declared capability, evidence, and outcome contracts | immutable Capability version, authorization/context envelope | third parties use the same adapter ports and conformance rules as AxisRobo products |

## Capability Lifecycle Interoperability

1. The publisher submits a Contract to Moduregis.
2. Moduregis verifies the executor registration through the owning product's adapter.
3. AEGIVELA evaluates publication policy and approval requirements.
4. Moduregis publishes the immutable version and emits a projection event.
5. MNEMOVELA and Catalog consume projections; neither changes lifecycle state.
6. Consumers resolve through Moduregis, then obtain authorization from AEGIVELA through Moduregis's Governor.
7. Broker dispatches to PRAXOVELA, RHEOVELA, or LIMENORA as appropriate.
8. The executor returns an outcome and evidence reference; Moduregis indexes the association.

## Compatibility Policy

- Contract schemas receive a new URI for incompatible changes.
- Adapter requests include an explicit interface version.
- Unknown optional response fields are ignored; unknown required semantics cause a version-negotiation error.
- An adapter may retry only idempotent operations or operations carrying a valid idempotency key.
- Each integration maintains positive, negative, authorization-denial, revocation, timeout, duplicate-delivery, and tenant-isolation fixtures.

## Interoperability Conformance

An adapter is conformant only when it proves:

1. Capability version immutability is preserved in executor dispatch.
2. AEGIVELA denial or revocation prevents executor contact.
3. Tenant, namespace, trace, actor, policy version, and evidence references are preserved.
4. Callback retries cannot create duplicate authoritative state transitions.
5. Outcomes can be traced from invocation to the owning runtime's evidence system.
