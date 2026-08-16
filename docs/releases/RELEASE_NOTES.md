# Moduregis Open Core Release Notes

Published versions are immutable. A tag and its published archives are never
rewritten; behavioral changes require a new version.

## v1.3.0 — ORCHADYN Planning Adapter Port

**Release date:** 2026-08-16

- Fail-closed ORCHADYN planning service adapter port (remote client,
  development-only stub, and fail-closed configuration).
- The proposal reference is recorded on the plan revision and is never treated
  as lifecycle authority.
- Worker catalog projection refresh configuration.
- 18 cross-platform archives plus `SHA256SUMS` on GitHub Releases.

## v1.2.0 — Capability Plan Governance

**Release date:** 2026-08-16

- `CapabilityPlan v1alpha1` public Contract, schema validation, and fixtures.
- Plan registry with immutable versions, lifecycle transitions, and tenant
  isolation.
- Governed plan publication and lifecycle transitions (suspend, deprecate,
  revoke, reactivate, retire).
- Plan approval positions and attestation evidence reads.
- RHEOVELA materialization references declared by Contract.
- Catalog version comparison, attestation reports, and publication approval
  positions for Capabilities.

## v1.1.0 — Governed Lifecycle Transitions

**Release date:** 2026-08-15

- Governed lifecycle transitions: suspend, deprecate, revoke, reactivate, and
  retire, authorized through AEGIVELA with durable audit evidence.

## v1.0.1 — Publishing and Release Documentation

**Release date:** 2026-08-15

- Documented script-owned publishing to `moduregis-open`.

## v1.0.0 — Initial Production-Adjacent Release

**Release date:** 2026-08-03

- Governed HTTP runtime: immutable Registry versions, lifecycle transitions,
  tenant isolation, HTTP Executor Contract admission, publication
  orchestration, structured Resolver, AEGIVELA ports, and durable Audit Outbox.

## Not Released

Changes on `main` after `v1.3.0` that are not yet tagged include the plan
attestation subject migration (`0015`) and worker projection deployment
configuration. They will be included in the next release.
