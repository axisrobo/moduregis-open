# Open Adapter Architecture

## Principle

Moduregis is an open Capability Platform control plane. It integrates engines and infrastructure through stable contracts, whether the provider is an AxisRobo product, an enterprise internal service, or a third-party product.

```text
Moduregis control plane
  -> Adapter Manifest
  -> validated adapter port
  -> AxisRobo or third-party implementation
```

No adapter receives special authority because of its vendor. Registry lifecycle, publication state, policy truth, approval truth, and Audit Index remain owned by Moduregis and AEGIVELA as defined by their product boundaries.

## Adapter Kinds

| Kind | AxisRobo example | Third-party example | Moduregis boundary |
|---|---|---|---|
| `authorization` | AEGIVELA | enterprise PDP/IAM bridge | adapter returns decision context; it does not own Registry state |
| `planning` | ORCHADYN | external planning engine | adapter returns plan/reference; Moduregis governs Plan usage |
| `execution` | PRAXOVELA / AXON | managed agent runtime | adapter receives authorized immutable Capability version |
| `workflow` | RHEOVELA | BPM/workflow platform | adapter owns process instance, not Capability lifecycle |
| `memory` | MNEMOVELA | search/vector/knowledge service | receives projections; never Registry authority |
| `coordination` | Harmovela | conformant coordination transport | carries lifecycle semantics, not central control-plane truth |
| `gateway` | LIMENORA | enterprise API gateway | owns north-south boundary and credential mediation |
| `attestation` | AEGIVELA/attestation provider | artifact verification service | returns evidence reference and verification outcome |

## Adapter Manifest

`contracts/adapters/moduregis.adapter.v1alpha1.schema.json` is the language-neutral registration descriptor. It declares:

- adapter ID, vendor, semantic version, and stable contract version;
- adapter kind and supported Capability types;
- optional deployment endpoint reference;
- supported CAP conformance profiles.

It deliberately excludes credentials, long-lived tokens, private endpoint configuration, and vendor-specific opaque execution state. Those belong in deployment bindings and AEGIVELA-controlled secret/authorization systems.

## Onboarding and Activation

1. Provider submits a Manifest, whether it is AxisRobo, an internal enterprise team, or a third party.
2. Moduregis parses it strictly and validates the manifest schema and descriptor identity.
3. Attestor verifies conformance profile evidence, artifact identity, and the deployment binding.
4. AEGIVELA authorizes the binding and its permitted scope.
5. Governor activates the adapter for a tenant/namespace only after all required evidence is present.

Manifest parsing is intentionally not activation. A parsed manifest has no authority to receive Capability calls until Adapter Registry verification, Attestor, Governor, and AEGIVELA steps complete.

Adapter Manifest identity and lifecycle are separate from an immutable HTTP executor deployment Contract. The Manifest identifies an Adapter version and its kind; the HTTP Contract supplies that version's HTTPS endpoint, egress limits, and named routes. An `http` Capability can be admitted for publication only when its exact `adapter_ref` resolves to an active execution Adapter and the immutable HTTP Contract for that same tenant, namespace, Adapter ID, and version contains its `route_id`.

## Adapter Registry

Moduregis now persists tenant/namespace-scoped immutable Adapter Manifest versions with `draft`, `verified`, `active`, `suspended`, and `revoked` lifecycle states. PostgreSQL RLS applies to both versions and transition history.

The Registry lifecycle state is necessary but insufficient for activation. Production activation is a Governor operation that must consume verified Attestor evidence and an AEGIVELA decision. No HTTP activation endpoint is exposed until that three-party Gate is implemented.

Attestor stores immutable evidence references, issuer identity, artifact digest, and verification outcome under tenant RLS. It does not copy raw logs, retain signing keys, or replace external verifier truth.

Governor now enforces the internal activation sequence: `verified Adapter Registry state` plus `verified Attestor evidence` plus `allowed AEGIVELA activation decision` yields `active`. The result carries policy and evidence references for the future Audit Index; it does not expose a public activation route yet.

The Audit Index now stores those references as append-only events. Governor writes lifecycle state, transition history, and allowed Audit event through one PostgreSQL transaction. Public activation remains deferred until a production AEGIVELA activation adapter is configured.

## Required Context

Every adapter call and callback preserves:

```text
tenant_id, namespace, trace_id, actor_id, policy_version, evidence_refs
```

Execution adapters also receive an immutable Capability snapshot, an invocation-bound authorization artifact, and an idempotency key. They return execution, outcome, and evidence references rather than directly updating Registry records.

## Conformance

An adapter must pass:

1. Adapter Manifest schema validation.
2. Capability-type compatibility fixtures.
3. Tenant/context propagation tests.
4. Authorization denial and revocation tests for execution-capable adapters.
5. Duplicate delivery, timeout, and evidence-reference tests appropriate to its kind.

CAP-C0 validates descriptive compatibility. Higher CAP profiles add execution, governance, recovery, and enterprise assurance requirements. The profile definition remains public even when an Enterprise certification service is used.
