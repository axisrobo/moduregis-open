# ADR 0007: Use an Open Adapter Architecture

**Status:** Accepted  
**Date:** 2026-07-15

## Context

Moduregis must integrate AxisRobo products and third-party products without merging repositories, copying runtime code, or making a vendor-specific implementation authoritative for Capability lifecycle, policy, or audit truth.

## Decision

- Every integration is represented by a versioned Adapter Manifest and a stable adapter port.
- AxisRobo products and third parties use the same manifest schema, context envelope, conformance rules, and authorization boundary.
- Adapter kinds are authorization, planning, execution, workflow, memory, coordination, gateway, and attestation.
- Manifests are descriptive and contain no credentials, bearer artifacts, or raw endpoint secrets.
- Moduregis passes tenant, namespace, trace, actor, policy version, and evidence references on every adapter call.
- An adapter cannot mutate Registry authority state directly. It returns references and evidence to Moduregis, which records control-plane state transactionally.

## Consequences

- PRAXOVELA, ORCHADYN, MNEMOVELA, RHEOVELA, LIMENORA, AEGIVELA, and Harmovela are first-party adapter implementations, not privileged internal dependencies.
- A third-party implementation can participate when it publishes a valid manifest and passes the relevant conformance profile.
- Moduregis must maintain adapter contract compatibility fixtures and cannot add vendor-specific fields to the core Capability Contract.
- A future adapter registry and deployment binding must be governed by Attestor and AEGIVELA before production activation.
