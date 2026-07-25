# ADR 0009: Store Immutable Attestation Evidence References

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Adapter and Capability activation require verifiable evidence, but Moduregis must not take ownership of raw runtime logs, signing keys, artifact builders, or third-party verifier internals.

## Decision

- Attestor records immutable evidence references for Capability and Adapter versions.
- Each record includes tenant, namespace, subject identity/version, issuer, artifact digest, evidence reference, verification status, and occurrence time.
- PostgreSQL RLS isolates evidence by tenant; raw evidence remains owned by its producer.
- Attestation status is not a lifecycle transition and does not alone activate an Adapter or publish a Capability.
- Governor activation will require verified Attestor evidence plus an AEGIVELA authorization decision.

## Consequences

- Moduregis can index and audit evidence without copying sensitive raw artifacts.
- Multiple issuers may attest the same immutable subject version.
- Revocation, re-attestation, and evidence-retention policy can be modeled as additional immutable records rather than mutation of historical proof.
